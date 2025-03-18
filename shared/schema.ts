import { pgTable, text, serial, integer, boolean, timestamp, json, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// USER AUTHENTICATION
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// TOURS
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  avfCode: text("avf_code"), // Mã AVF mới (AVF001, AVF002, ...)
  location: text("location").notNull(),
  description: text("description").notNull(),
  durationDays: integer("duration_days").notNull(),
  basePrice: real("base_price").notNull(), // Base price in JPY
  imageUrl: text("image_url"),
  // i18n content
  nameJa: text("name_ja"),
  nameZh: text("name_zh"),
  nameKo: text("name_ko"),
  nameVi: text("name_vi"),
  descriptionJa: text("description_ja"),
  descriptionZh: text("description_zh"),
  descriptionKo: text("description_ko"),
  descriptionVi: text("description_vi"),
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
});

// VEHICLES
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  seats: integer("seats").notNull(),
  luggageCapacity: integer("luggage_capacity").notNull().default(0), // Number of suitcases
  pricePerDay: real("price_per_day").notNull(), // in JPY
  driverCostPerDay: real("driver_cost_per_day").notNull(), // in JPY
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

// HOTELS
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  stars: integer("stars").notNull(), // 3, 4, or 5
  singleRoomPrice: real("single_room_price").notNull(), // in JPY
  doubleRoomPrice: real("double_room_price").notNull(), // in JPY
  tripleRoomPrice: real("triple_room_price").notNull(), // in JPY
  breakfastPrice: real("breakfast_price").notNull(), // in JPY
  lunchPrice: real("lunch_price").default(0), // in JPY
  dinnerPrice: real("dinner_price").default(0), // in JPY
  imageUrl: text("image_url"),
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

// TOUR GUIDES
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  languages: text("languages").array().notNull(), // ["english", "vietnamese", etc.]
  pricePerDay: real("price_per_day").notNull(), // in JPY
  experience: integer("experience").default(0), // Years of experience
  hasInternationalLicense: boolean("has_international_license").default(false), // Has international tour guide license
  personality: text("personality"), // Guide's personality traits
  gender: text("gender"), // Male, Female
  age: integer("age").default(0), // Age of the guide
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
});

// SEASONS
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startMonth: integer("start_month").notNull(), // 1-12
  endMonth: integer("end_month").notNull(), // 1-12
  description: text("description").notNull(),
  priceMultiplier: real("price_multiplier").notNull().default(1.0), // e.g. 1.2 for 20% higher prices
  // i18n content
  nameJa: text("name_ja"),
  nameZh: text("name_zh"),
  nameKo: text("name_ko"),
  nameVi: text("name_vi"),
  descriptionJa: text("description_ja"),
  descriptionZh: text("description_zh"),
  descriptionKo: text("description_ko"),
  descriptionVi: text("description_vi"),
});

export const insertSeasonSchema = createInsertSchema(seasons).omit({
  id: true,
});

// COMPANY SETTINGS
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// Calculation Schema
// Các loại dịch vụ đặc biệt
export const specialServiceSchema = z.object({
  geishaShow: z.boolean().optional(),
  kimonoExperience: z.boolean().optional(),
  teaCeremony: z.boolean().optional(),
  wagyuDinner: z.boolean().optional(),
  sumoShow: z.boolean().optional(),
  disneylandTickets: z.boolean().optional(),
  universalStudioTickets: z.boolean().optional(),
  airportTransfer: z.boolean().optional(), // Dịch vụ đưa đón sân bay
  notes: z.string().optional(),
});

export const calculationSchema = z.object({
  tourId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  vehicleId: z.number(),
  vehicleCount: z.number().optional().default(1),
  participants: z.number().min(1),
  hotelId: z.number().optional(),
  // Hạng sao khách sạn (3-5 sao)
  hotelStars: z.number().min(3).max(5).optional(),
  singleRoomCount: z.number().optional().default(0),
  doubleRoomCount: z.number().optional().default(0),
  tripleRoomCount: z.number().optional().default(0),
  roomType: z.enum(["single", "double", "triple"]).optional(),
  includeBreakfast: z.boolean().optional(),
  includeLunch: z.boolean().optional(),
  includeDinner: z.boolean().optional(),
  includeGuide: z.boolean().optional(),
  guideId: z.number().optional(),
  currency: z.enum(["JPY", "USD", "VND"]).default("JPY"),
  // Dịch vụ đặc biệt
  specialServices: specialServiceSchema.optional(),
});

export type SpecialService = z.infer<typeof specialServiceSchema>;
export type Calculation = z.infer<typeof calculationSchema>;
