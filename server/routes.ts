import express, { Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { validateCredentials, isAuthenticated, isAdminUser, isAdminOrAgentUser, syncOnLogin } from "./auth";
import { 
  insertUserSchema, 
  insertTourSchema, 
  insertVehicleSchema, 
  insertHotelSchema, 
  insertGuideSchema, 
  insertSeasonSchema,
  calculationSchema,
  User
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
        stale: false, // Prevent expired sessions from being returned
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: 'lax' // Helps prevent CSRF attacks
      },
      name: 'asahi.sid', // Custom name to avoid default (connect.sid)
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
    passport.authenticate("local", (err: Error | null, user: any, info: { message: string }) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Login failed for user:", req.body.username);
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }
      req.logIn(user, (err: Error | null) => {
        if (err) {
          console.error("Session login error:", err);
          return next(err);
        }
        console.log(`User logged in: ${user.username} (${user.role})`);
        
        // Trigger data synchronization on login
        syncOnLogin(user);
        
        // Regenerate session ID after login to prevent session fixation attacks
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error:", err);
            return next(err);
          }
          
          // Save the user data in the new session
          (req.session as any).passport = { user: user.id };
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return next(err);
            }
            
            return res.json({
              id: user.id,
              username: user.username,
              role: user.role,
            });
          });
        });
      });
    })(req, res, next);
  });

  apiRouter.post("/auth/logout", (req, res) => {
    const username = (req.user as any)?.username || 'unknown';
    console.log(`Logging out user: ${username}`);
    
    // First, invalidate the session
    req.logout((err: Error | null) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error during logout" });
      }
      
      // Then destroy the session completely
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Error destroying session" });
        }
        
        console.log(`User logged out: ${username}`);
        res.clearCookie("asahi.sid"); // Clear the session cookie
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  apiRouter.get("/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      
      // Trigger auto-sync if user is authenticated and the session is valid
      // This ensures data is synchronized when application refreshes
      syncOnLogin(user as User);
      
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
  // Lấy tất cả settings
  apiRouter.get("/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      
      // Chuyển đổi từ mảng sang đối tượng key-value để dễ sử dụng ở client
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      res.json(settingsMap);
    } catch (error) {
      console.error('Error fetching all settings:', error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  
  // Lấy setting theo key
  apiRouter.get("/settings/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const value = await storage.getSetting(key);
      
      if (!value) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json({ key, value });
    } catch (error) {
      console.error(`Error fetching setting ${req.params.key}:`, error);
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
      
      // Tính toán số ngày sử dụng xe dựa trên thời gian đến và đi
      let vehicleDays = durationDays;
      
      // Điều chỉnh ngày xe dựa trên thời gian bay đến/đi
      if (calculationData.arrivalTime === 'afternoon') {
        // Nếu đến buổi chiều, chỉ tính nửa ngày xe cho ngày đầu tiên (dịch vụ đưa đón sân bay)
        vehicleDays -= 0.5;
      }
      
      // Tính chi phí xe và tài xế dựa trên số ngày đã điều chỉnh
      const vehicleCost = vehicle.pricePerDay * vehicleDays * vehicleCount;
      const driverCost = vehicle.driverCostPerDay * vehicleDays * vehicleCount;
      
      // Add hotel costs if selected
      let hotelCost = 0;
      if (calculationData.roomType) {
        // Check if using star rating or specific hotel
        if (calculationData.hotelStars) {
          // Using star rating system (3-5 stars)
          const numNights = durationDays - 1;
          
          if (numNights > 0) {
            // Get base prices for the selected star rating
            let baseSingleRoomPrice = 0;
            let baseDoubleRoomPrice = 0;
            let baseTripleRoomPrice = 0;
            let baseBreakfastPrice = 0;
            
            // Set base prices based on star rating (giá trực tiếp theo Google Sheets)
            switch (calculationData.hotelStars) {
              case 3:
                baseSingleRoomPrice = 9500; // Dựa trên Google Sheets cho Tokyo Plaza Hotel (3 sao)
                baseDoubleRoomPrice = 7000;
                baseTripleRoomPrice = 6000;
                baseBreakfastPrice = 2000;
                break;
              case 4:
                baseSingleRoomPrice = 18000; // Dựa trên Google Sheets cho Kyoto Royal Resort (4 sao)
                baseDoubleRoomPrice = 12000;
                baseTripleRoomPrice = 9000;
                baseBreakfastPrice = 2500;
                break;
              case 5:
                baseSingleRoomPrice = 35000; // Dựa trên Google Sheets cho Tokyo Plaza Luxury (5 sao)
                baseDoubleRoomPrice = 20000;
                baseTripleRoomPrice = 15000;
                baseBreakfastPrice = 4000;
                break;
            }
            
            // Calculate room costs based on room type
            let roomRate = 0;
            switch (calculationData.roomType) {
              case 'single':
                roomRate = baseSingleRoomPrice;
                break;
              case 'double':
                roomRate = baseDoubleRoomPrice;
                break;
              case 'triple':
                roomRate = baseTripleRoomPrice;
                break;
            }
            
            // Calculate number of rooms needed based on participants
            let numRooms = 0;
            
            // Use explicit room counts if provided
            if (calculationData.singleRoomCount || calculationData.doubleRoomCount || calculationData.tripleRoomCount) {
              numRooms = (calculationData.singleRoomCount || 0) + (calculationData.doubleRoomCount || 0) + (calculationData.tripleRoomCount || 0);
              
              // Calculate total cost based on specific room counts
              hotelCost = ((calculationData.singleRoomCount || 0) * baseSingleRoomPrice +
                          (calculationData.doubleRoomCount || 0) * baseDoubleRoomPrice +
                          (calculationData.tripleRoomCount || 0) * baseTripleRoomPrice) * numNights;
            } else {
              // Use the room type to calculate number of rooms
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
            }
            
            // Add breakfast if selected
            if (calculationData.includeBreakfast) {
              hotelCost += baseBreakfastPrice * calculationData.participants * numNights;
            }
          }
        } else if (calculationData.hotelId) {
          // Using specific hotel
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
      }
      
      // Add meals costs if selected
      let mealsCost = 0;
      if (calculationData.includeLunch || calculationData.includeDinner) {
        // Lấy giá trị bữa ăn từ Google Sheets (đồng nhất cho tất cả tour và độc lập với khách sạn)
        let lunchCost = parseFloat(await storage.getSetting('lunchPrice') || '2200');
        let dinnerCost = parseFloat(await storage.getSetting('dinnerPrice') || '3000');
        
        // Tính toán số ngày cần cung cấp bữa trưa và bữa tối dựa trên thời gian bay
        let lunchDays = durationDays;
        let dinnerDays = durationDays;
        
        // Điều chỉnh bữa ăn dựa trên thời gian đến/đi
        if (calculationData.arrivalTime) {
          if (calculationData.arrivalTime === 'afternoon') {
            // Đến buổi chiều: không tính bữa trưa ngày đầu tiên
            lunchDays -= 1;
          }
          // Nếu "unknown" hoặc "morning", giữ nguyên tính toán mặc định
        }
        
        if (calculationData.departureTime) {
          if (calculationData.departureTime === 'morning') {
            // Khởi hành buổi sáng: không tính bữa trưa ngày cuối
            lunchDays -= 1;
          }
          // Nếu "unknown" hoặc "afternoon", giữ nguyên tính toán mặc định
        }
        
        // Đảm bảo số ngày không bị âm
        lunchDays = Math.max(0, lunchDays);
        dinnerDays = Math.max(0, dinnerDays);
        
        // Chỉ tính chi phí cho những bữa ăn được chọn
        const totalLunchCost = calculationData.includeLunch ? lunchCost * lunchDays : 0;
        const totalDinnerCost = calculationData.includeDinner ? dinnerCost * dinnerDays : 0;
        
        mealsCost = (totalLunchCost + totalDinnerCost) * calculationData.participants;
      }
      
      // Add guide costs if selected
      let guideCost = 0;
      if (calculationData.includeGuide && calculationData.guideId) {
        const guide = await storage.getGuide(calculationData.guideId);
        
        if (guide) {
          // Điều chỉnh chi phí hướng dẫn viên dựa trên thời gian bay
          let guideDays = durationDays;
          
          if (calculationData.arrivalTime === 'afternoon') {
            // Nếu đến buổi chiều, hướng dẫn viên chỉ đón tại sân bay, không dẫn tour cả ngày
            guideDays -= 0.5;
          }
          
          guideCost = guide.pricePerDay * guideDays;
          
          // Add accommodation and meals for the guide as well
          const numNights = durationDays - 1;
          
          if (numNights > 0) {
            // Check if using star rating or specific hotel
            if (calculationData.hotelStars) {
              // Using star rating system for guide accommodation
              let guideSingleRoomPrice = 0;
              let guideBreakfastPrice = 0;
              
              // Set prices based on star rating (giá trực tiếp từ Google Sheets)
              switch (calculationData.hotelStars) {
                case 3:
                  guideSingleRoomPrice = 9500; // Dựa trên Google Sheets cho Tokyo Plaza Hotel (3 sao)
                  guideBreakfastPrice = 2000; 
                  break;
                case 4:
                  guideSingleRoomPrice = 18000; // Dựa trên Google Sheets cho Kyoto Royal Resort (4 sao)
                  guideBreakfastPrice = 2500;
                  break;
                case 5:
                  guideSingleRoomPrice = 35000; // Dựa trên Google Sheets cho Tokyo Plaza Luxury (5 sao)
                  guideBreakfastPrice = 4000;
                  break;
              }
              
              // Guide gets a single room
              hotelCost += guideSingleRoomPrice * numNights;
              
              // Guide gets breakfast if participants do
              if (calculationData.includeBreakfast) {
                hotelCost += guideBreakfastPrice * numNights;
              }
            } else if (calculationData.hotelId && calculationData.roomType) {
              // Using specific hotel
              const hotel = await storage.getHotel(calculationData.hotelId);
              
              if (hotel) {
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
            // Lấy giá trị bữa ăn từ Google Sheets (đồng nhất cho tất cả tour và độc lập với khách sạn)
            let lunchCost = parseFloat(await storage.getSetting('lunchPrice') || '2200');
            let dinnerCost = parseFloat(await storage.getSetting('dinnerPrice') || '3000');
            
            // Sử dụng cùng logic tính toán số ngày bữa ăn như với khách
            let lunchDays = durationDays;
            let dinnerDays = durationDays;
            
            // Điều chỉnh bữa ăn dựa trên thời gian đến/đi
            if (calculationData.arrivalTime === 'afternoon') {
              lunchDays -= 1;
            }
            
            if (calculationData.departureTime === 'morning') {
              lunchDays -= 1;
            }
            
            // Đảm bảo số ngày không bị âm
            lunchDays = Math.max(0, lunchDays);
            dinnerDays = Math.max(0, dinnerDays);
            
            // Chỉ tính chi phí cho những bữa ăn được chọn
            const totalLunchCost = calculationData.includeLunch ? lunchCost * lunchDays : 0;
            const totalDinnerCost = calculationData.includeDinner ? dinnerCost * dinnerDays : 0;
            
            mealsCost += (totalLunchCost + totalDinnerCost);
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
  apiRouter.get("/sync/status", isAuthenticated, async (req, res) => {
    try {
      const lastSyncTime = await storage.getLastSyncTimestamp();
      // Get the current user to determine data source
      const user = req.user as unknown as User | undefined;
      const dataSource = user && user.role === 'agent' && user.dataSource 
                        ? user.dataSource 
                        : 'default';
                        
      res.json({
        lastSync: lastSyncTime ? new Date(lastSyncTime).toISOString() : null,
        status: "ok",
        dataSource: dataSource,
        userRole: user ? user.role : 'guest'
      });
    } catch (error) {
      console.error("Error getting sync status:", error);
      res.status(500).json({ message: "Failed to get sync status", error: String(error) });
    }
  });

  apiRouter.post("/sync/from-sheets", isAuthenticated, async (req, res) => {
    try {
      // Lấy thông tin người dùng từ session để đồng bộ đúng nguồn dữ liệu
      const user = req.user as unknown as User | undefined;
      await syncDataFromSheets(storage, user);
      await storage.updateLastSyncTimestamp();
      res.json({ 
        message: "Successfully synchronized data from Google Sheets",
        timestamp: new Date().toISOString(),
        dataSource: user && user.role === 'agent' ? user.dataSource : 'default'
      });
    } catch (error) {
      console.error("Error syncing from sheets:", error);
      res.status(500).json({ message: "Failed to sync from Google Sheets", error: String(error) });
    }
  });

  apiRouter.post("/sync/to-sheets", isAdminOrAgentUser, async (req, res) => {
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
      
      // Lấy ngôn ngữ và nguồn dữ liệu từ request body
      const { language = 'en', dataSource } = req.body as { 
        language?: 'en' | 'ja' | 'zh' | 'ko' | 'vi',
        dataSource?: string 
      };
      
      // Lấy thông tin người dùng từ session để đồng bộ đúng nguồn dữ liệu
      const user = req.user as unknown as User | undefined;
      
      // Nếu là admin và có chỉ định nguồn dữ liệu cụ thể, sử dụng nguồn đó
      const specificSource = (user?.role === 'admin' && dataSource) ? dataSource : undefined;
      
      // Hiển thị thông tin nguồn dữ liệu
      console.log(`Exporting to sheets: User: ${user?.username}, Role: ${user?.role}, DataSource: ${specificSource || (user?.dataSource || 'default')}`);
      
      // Nếu có Service Account, tiến hành đồng bộ với ngôn ngữ chỉ định
      await syncDataToSheets(storage, language, user);
      await storage.updateLastSyncTimestamp();
      res.json({ 
        message: "Successfully synchronized data to Google Sheets",
        language: language,
        timestamp: new Date().toISOString(),
        dataSource: user && user.role === 'agent' ? user.dataSource : 'default'
      });
    } catch (error) {
      console.error("Error syncing to sheets:", error);
      res.status(500).json({ message: "Failed to sync to Google Sheets", error: String(error) });
    }
  });
  
  // API endpoint để cập nhật mã AVF cho tất cả tour
  apiRouter.post("/tours/update-avf-codes", isAdminMiddleware, async (req, res) => {
    try {
      const updatedTours = await storage.updateAllTourAVFCodes();
      res.json({
        message: "Đã cập nhật mã AVF cho tất cả tour thành công",
        tourCount: updatedTours.length,
        tours: updatedTours
      });
    } catch (error) {
      console.error("Error updating AVF codes:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật mã AVF", error: String(error) });
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
