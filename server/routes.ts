import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { validateCredentials, isAuthenticated, isAdminUser } from "./auth";
import { 
  insertUserSchema, 
  insertTourSchema, 
  insertVehicleSchema, 
  insertHotelSchema, 
  insertGuideSchema, 
  insertSeasonSchema,
  calculationSchema 
} from "@shared/schema";
import { convertCurrency } from "./currencyConverter";
import { sendEmail } from "./emailService";
import { syncDataFromSheets, syncDataToSheets } from "./googleSheetsService";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Session Management
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "asahi-vietlife-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Passport Setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await validateCredentials(username, password);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // API Routes - All prefixed with /api
  const apiRouter = express.Router();

  // Authentication Routes
  apiRouter.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role,
        });
      });
    })(req, res, next);
  });

  apiRouter.post("/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  apiRouter.get("/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }
    return res.status(401).json({ message: "Not authenticated" });
  });

  // User Management Routes (Admin only)
  apiRouter.put("/admin/password", isAdminMiddleware, async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
        return res.status(400).json({ message: "Invalid password format. Password must be at least 8 characters long." });
      }
      
      const user = req.user as any;
      const updatedUser = await storage.updateUserPassword(user.id, newPassword);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Tour Management Routes
  apiRouter.get("/tours", async (req, res) => {
    try {
      const tours = await storage.getAllTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  apiRouter.get("/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(parseInt(req.params.id));
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  apiRouter.post("/tours", isAdminMiddleware, async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.status(201).json(tour);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create tour" });
    }
  });

  apiRouter.put("/tours/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tourData = insertTourSchema.partial().parse(req.body);
      const tour = await storage.updateTour(id, tourData);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(tour);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update tour" });
    }
  });

  apiRouter.delete("/tours/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTour(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json({ message: "Tour deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tour" });
    }
  });

  // Vehicle Management Routes
  apiRouter.get("/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  apiRouter.get("/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(parseInt(req.params.id));
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  apiRouter.post("/vehicles", isAdminMiddleware, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create vehicle" });
    }
  });

  apiRouter.put("/vehicles/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, vehicleData);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  apiRouter.delete("/vehicles/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVehicle(id);
      
      if (!success) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  // Hotel Management Routes
  apiRouter.get("/hotels", async (req, res) => {
    try {
      const hotels = await storage.getAllHotels();
      res.json(hotels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  apiRouter.get("/hotels/:id", async (req, res) => {
    try {
      const hotel = await storage.getHotel(parseInt(req.params.id));
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  apiRouter.post("/hotels", isAdminMiddleware, async (req, res) => {
    try {
      const hotelData = insertHotelSchema.parse(req.body);
      const hotel = await storage.createHotel(hotelData);
      res.status(201).json(hotel);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  apiRouter.put("/hotels/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hotelData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, hotelData);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      res.json(hotel);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  apiRouter.delete("/hotels/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHotel(id);
      
      if (!success) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      res.json({ message: "Hotel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });

  // Guide Management Routes
  apiRouter.get("/guides", async (req, res) => {
    try {
      const guides = await storage.getAllGuides();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  apiRouter.get("/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(parseInt(req.params.id));
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      res.json(guide);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guide" });
    }
  });

  apiRouter.post("/guides", isAdminMiddleware, async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create guide" });
    }
  });

  apiRouter.put("/guides/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const guideData = insertGuideSchema.partial().parse(req.body);
      const guide = await storage.updateGuide(id, guideData);
      
      if (!guide) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      res.json(guide);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update guide" });
    }
  });

  apiRouter.delete("/guides/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGuide(id);
      
      if (!success) {
        return res.status(404).json({ message: "Guide not found" });
      }
      
      res.json({ message: "Guide deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete guide" });
    }
  });

  // Season Management Routes
  apiRouter.get("/seasons", async (req, res) => {
    try {
      const seasons = await storage.getAllSeasons();
      res.json(seasons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seasons" });
    }
  });

  apiRouter.get("/seasons/:id", async (req, res) => {
    try {
      const season = await storage.getSeason(parseInt(req.params.id));
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }
      res.json(season);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch season" });
    }
  });

  apiRouter.get("/seasons/month/:month", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      if (isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ message: "Invalid month. Must be between 1 and 12." });
      }
      
      const season = await storage.getSeasonByMonth(month);
      if (!season) {
        return res.status(404).json({ message: "No season found for this month" });
      }
      
      res.json(season);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch season" });
    }
  });

  apiRouter.post("/seasons", isAdminMiddleware, async (req, res) => {
    try {
      const seasonData = insertSeasonSchema.parse(req.body);
      const season = await storage.createSeason(seasonData);
      res.status(201).json(season);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create season" });
    }
  });

  apiRouter.put("/seasons/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const seasonData = insertSeasonSchema.partial().parse(req.body);
      const season = await storage.updateSeason(id, seasonData);
      
      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }
      
      res.json(season);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update season" });
    }
  });

  apiRouter.delete("/seasons/:id", isAdminMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSeason(id);
      
      if (!success) {
        return res.status(404).json({ message: "Season not found" });
      }
      
      res.json({ message: "Season deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete season" });
    }
  });

  // Settings Management Routes
  apiRouter.get("/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const value = await storage.getSetting(key);
      
      if (!value) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json({ key, value });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  apiRouter.put("/settings/:key", isAdminMiddleware, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (!value || typeof value !== 'string') {
        return res.status(400).json({ message: "Invalid value format" });
      }
      
      const setting = await storage.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Currency Conversion Route
  apiRouter.get("/currency/convert", async (req, res) => {
    try {
      const amount = parseFloat(req.query.amount as string);
      const from = (req.query.from as string)?.toUpperCase() || 'JPY';
      const to = (req.query.to as string)?.toUpperCase() || 'USD';
      
      if (isNaN(amount)) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const convertedAmount = await convertCurrency(amount, from, to);
      res.json({
        from,
        to,
        amount,
        convertedAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  // Tour Price Calculator
  apiRouter.post("/calculator", async (req, res) => {
    try {
      const calculationData = calculationSchema.parse(req.body);
      
      // Get all required data
      const tour = await storage.getTour(calculationData.tourId);
      const vehicle = await storage.getVehicle(calculationData.vehicleId);
      
      if (!tour || !vehicle) {
        return res.status(404).json({ message: "Tour or vehicle not found" });
      }
      
      // Calculate tour duration
      const startDate = new Date(calculationData.startDate);
      const endDate = new Date(calculationData.endDate);
      const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Check if the dates are within a special season
      const currentMonth = startDate.getMonth() + 1; // JavaScript months are 0-indexed
      const season = await storage.getSeasonByMonth(currentMonth);
      const seasonMultiplier = season ? season.priceMultiplier : 1.0;
      
      // Get base costs
      let baseCost = tour.basePrice * calculationData.participants;
      
      // Add vehicle costs based on number of vehicles
      const vehicleCount = calculationData.vehicleCount || 1; // Default to 1 if not specified
      const vehicleCost = vehicle.pricePerDay * durationDays * vehicleCount;
      const driverCost = vehicle.driverCostPerDay * durationDays * vehicleCount;
      
      // Add hotel costs if selected
      let hotelCost = 0;
      if (calculationData.hotelId && calculationData.roomType) {
        const hotel = await storage.getHotel(calculationData.hotelId);
        
        if (hotel) {
          const numNights = durationDays - 1;
          
          if (numNights > 0) {
            // Calculate room costs based on room type
            let roomRate = 0;
            switch (calculationData.roomType) {
              case 'single':
                roomRate = hotel.singleRoomPrice;
                break;
              case 'double':
                roomRate = hotel.doubleRoomPrice;
                break;
              case 'triple':
                roomRate = hotel.tripleRoomPrice;
                break;
            }
            
            // Calculate number of rooms needed based on participants
            let numRooms = 0;
            switch (calculationData.roomType) {
              case 'single':
                numRooms = calculationData.participants;
                break;
              case 'double':
                numRooms = Math.ceil(calculationData.participants / 2);
                break;
              case 'triple':
                numRooms = Math.ceil(calculationData.participants / 3);
                break;
            }
            
            // Calculate hotel cost
            hotelCost = roomRate * numRooms * numNights;
            
            // Add breakfast if selected
            if (calculationData.includeBreakfast) {
              hotelCost += hotel.breakfastPrice * calculationData.participants * numNights;
            }
          }
        }
      }
      
      // Add meals costs if selected
      let mealsCost = 0;
      if (calculationData.includeLunch || calculationData.includeDinner) {
        const lunchCost = calculationData.includeLunch ? parseFloat(await storage.getSetting('meal_cost_lunch') || '2000') : 0;
        const dinnerCost = calculationData.includeDinner ? parseFloat(await storage.getSetting('meal_cost_dinner') || '3000') : 0;
        
        mealsCost = (lunchCost + dinnerCost) * calculationData.participants * durationDays;
      }
      
      // Add guide costs if selected
      let guideCost = 0;
      if (calculationData.includeGuide && calculationData.guideId) {
        const guide = await storage.getGuide(calculationData.guideId);
        
        if (guide) {
          guideCost = guide.pricePerDay * durationDays;
          
          // Add accommodation and meals for the guide as well
          if (calculationData.hotelId && calculationData.roomType) {
            const hotel = await storage.getHotel(calculationData.hotelId);
            
            if (hotel) {
              const numNights = durationDays - 1;
              
              if (numNights > 0) {
                // Guide gets a single room
                hotelCost += hotel.singleRoomPrice * numNights;
                
                // Guide gets breakfast if participants do
                if (calculationData.includeBreakfast) {
                  hotelCost += hotel.breakfastPrice * numNights;
                }
              }
            }
          }
          
          // Guide gets the same meals as participants
          if (calculationData.includeLunch || calculationData.includeDinner) {
            const lunchCost = calculationData.includeLunch ? parseFloat(await storage.getSetting('meal_cost_lunch') || '2000') : 0;
            const dinnerCost = calculationData.includeDinner ? parseFloat(await storage.getSetting('meal_cost_dinner') || '3000') : 0;
            
            mealsCost += (lunchCost + dinnerCost) * durationDays;
          }
        }
      }
      
      // Calculate subtotal with seasonal multiplier
      const subtotal = (baseCost + vehicleCost + driverCost + hotelCost + mealsCost + guideCost) * seasonMultiplier;
      
      // Apply profit margin
      const profitMargin = parseFloat(await storage.getSetting('profit_margin') || '20') / 100;
      const totalBeforeTax = subtotal * (1 + profitMargin);
      
      // Apply tax
      const taxRate = parseFloat(await storage.getSetting('tax_rate') || '10') / 100;
      const taxAmount = totalBeforeTax * taxRate;
      const totalAmount = totalBeforeTax + taxAmount;
      
      // Convert to requested currency if needed
      let totalInRequestedCurrency = totalAmount;
      if (calculationData.currency !== 'JPY') {
        totalInRequestedCurrency = await convertCurrency(totalAmount, 'JPY', calculationData.currency);
      }
      
      // Return the calculation
      res.json({
        tourDetails: {
          id: tour.id,
          name: tour.name,
          location: tour.location,
          code: tour.code,
          durationDays
        },
        calculationDetails: {
          startDate: calculationData.startDate,
          endDate: calculationData.endDate,
          participants: calculationData.participants,
          season: season ? { name: season.name, multiplier: season.priceMultiplier } : null,
        },
        costs: {
          baseCost,
          vehicleCost,
          driverCost,
          hotelCost,
          mealsCost,
          guideCost,
          subtotal,
          profitAmount: subtotal * profitMargin,
          taxAmount,
          totalAmount
        },
        currency: calculationData.currency,
        totalInRequestedCurrency
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to calculate tour price" });
    }
  });

  // Email service route
  apiRouter.post("/send-tour-inquiry", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!email || !message) {
        return res.status(400).json({ message: "Email and message are required" });
      }
      
      const result = await sendEmail({
        name,
        email,
        subject: subject || "Tour Inquiry",
        message
      });
      
      if (result.success) {
        return res.status(200).json({ message: "Email sent successfully" });
      } else {
        return res.status(500).json({ message: result.message });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Google Sheets Sync Routes (Admin only)
  apiRouter.get("/sync/status", isAdminMiddleware, async (req, res) => {
    try {
      const lastSyncTime = await storage.getLastSyncTimestamp();
      res.json({
        lastSync: lastSyncTime ? new Date(lastSyncTime).toISOString() : null,
        status: "ok"
      });
    } catch (error) {
      console.error("Error getting sync status:", error);
      res.status(500).json({ message: "Failed to get sync status", error: String(error) });
    }
  });

  apiRouter.post("/sync/from-sheets", isAdminMiddleware, async (req, res) => {
    try {
      await syncDataFromSheets(storage);
      await storage.updateLastSyncTimestamp();
      res.json({ 
        message: "Successfully synchronized data from Google Sheets",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error syncing from sheets:", error);
      res.status(500).json({ message: "Failed to sync from Google Sheets", error: String(error) });
    }
  });

  apiRouter.post("/sync/to-sheets", isAdminMiddleware, async (req, res) => {
    try {
      // Kiểm tra xem có Service Account không
      const hasServiceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && 
                              process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
      
      if (!hasServiceAccount) {
        // Nếu không có Service Account, thông báo cho người dùng
        return res.status(400).json({ 
          message: "Export to Google Sheets is currently not available. Google Sheets is in read-only mode.",
          details: "To enable writing to Google Sheets, you need to configure Service Account in Google Cloud Console."
        });
      }
      
      // Lấy ngôn ngữ được chọn từ request body hoặc mặc định là 'en'
      const { language = 'en' } = req.body as { language?: 'en' | 'ja' | 'zh' | 'ko' | 'vi' };
      
      // Nếu có Service Account, tiến hành đồng bộ với ngôn ngữ chỉ định
      await syncDataToSheets(storage, language);
      await storage.updateLastSyncTimestamp();
      res.json({ 
        message: "Successfully synchronized data to Google Sheets",
        language: language,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error syncing to sheets:", error);
      res.status(500).json({ message: "Failed to sync to Google Sheets", error: String(error) });
    }
  });

  // Register API routes with proper prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}

// Middleware to check if user is admin
function isAdminMiddleware(req: Request, res: Response, next: express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user && (req.user as any).role !== 'admin') {
    return res.status(403).json({ message: "Not authorized" });
  }
  
  next();
}
