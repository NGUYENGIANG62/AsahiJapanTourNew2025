import { 
  users, type User, type InsertUser,
  tours, type Tour, type InsertTour,
  vehicles, type Vehicle, type InsertVehicle,
  hotels, type Hotel, type InsertHotel,
  guides, type Guide, type InsertGuide,
  seasons, type Season, type InsertSeason,
  settings, type Setting, type InsertSetting
} from "@shared/schema";
import bcrypt from 'bcrypt';

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<User | undefined>;
  
  // Tour Management
  getAllTours(): Promise<Tour[]>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: number, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: number): Promise<boolean>;
  
  // Vehicle Management
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  
  // Hotel Management
  getAllHotels(): Promise<Hotel[]>;
  getHotel(id: number): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined>;
  deleteHotel(id: number): Promise<boolean>;
  
  // Guide Management
  getAllGuides(): Promise<Guide[]>;
  getGuide(id: number): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: number, guide: Partial<InsertGuide>): Promise<Guide | undefined>;
  deleteGuide(id: number): Promise<boolean>;
  
  // Season Management
  getAllSeasons(): Promise<Season[]>;
  getSeason(id: number): Promise<Season | undefined>;
  getSeasonByMonth(month: number): Promise<Season | undefined>;
  createSeason(season: InsertSeason): Promise<Season>;
  updateSeason(id: number, season: Partial<InsertSeason>): Promise<Season | undefined>;
  deleteSeason(id: number): Promise<boolean>;
  
  // Settings Management
  getSetting(key: string): Promise<string | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private vehicles: Map<number, Vehicle>;
  private hotels: Map<number, Hotel>;
  private guides: Map<number, Guide>;
  private seasons: Map<number, Season>;
  private settings: Map<string, Setting>;
  
  private currentUserId: number;
  private currentTourId: number;
  private currentVehicleId: number;
  private currentHotelId: number;
  private currentGuideId: number;
  private currentSeasonId: number;
  private currentSettingId: number;

  constructor() {
    this.users = new Map();
    this.tours = new Map();
    this.vehicles = new Map();
    this.hotels = new Map();
    this.guides = new Map();
    this.seasons = new Map();
    this.settings = new Map();
    
    this.currentUserId = 1;
    this.currentTourId = 1;
    this.currentVehicleId = 1;
    this.currentHotelId = 1;
    this.currentGuideId = 1;
    this.currentSeasonId = 1;
    this.currentSettingId = 1;
    
    // Initialize with admin user
    this.initializeData();
  }

  private async initializeData() {
    // Create default admin user
    const adminPassword = await bcrypt.hash('Kiminonaha01', 10);
    
    this.users.set(this.currentUserId, {
      id: this.currentUserId++,
      username: 'AsahiVietLifeJapanTour',
      password: adminPassword,
      role: 'admin'
    });
    
    // Create default customer user
    const customerPassword = await bcrypt.hash('AsahiTour2024', 10);
    
    this.users.set(this.currentUserId, {
      id: this.currentUserId++,
      username: 'customer',
      password: customerPassword,
      role: 'user'
    });
    
    // Create default settings
    this.settings.set('profit_margin', {
      id: this.currentSettingId++,
      key: 'profit_margin',
      value: '20' // 20% profit margin
    });
    
    this.settings.set('tax_rate', {
      id: this.currentSettingId++,
      key: 'tax_rate',
      value: '10' // 10% tax rate
    });
    
    this.settings.set('meal_cost_lunch', {
      id: this.currentSettingId++,
      key: 'meal_cost_lunch',
      value: '2000' // 2000 JPY per person
    });
    
    this.settings.set('meal_cost_dinner', {
      id: this.currentSettingId++,
      key: 'meal_cost_dinner',
      value: '3000' // 3000 JPY per person
    });
    
    // Initialize with sample seasons
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Cherry Blossom Season',
      startMonth: 3, // March
      endMonth: 5,   // May
      description: 'The beautiful cherry blossom season in Japan with higher accommodation rates. Cherry blossom viewing spots will be included in available tours.',
      priceMultiplier: 1.3, // 30% price increase
      nameJa: '桜の季節',
      nameZh: '樱花季节',
      nameKo: '벚꽃 시즌',
      nameVi: 'Mùa hoa anh đào',
      descriptionJa: '日本の美しい桜の季節です。宿泊料金が高くなります。ツアーには桜の名所が含まれます。',
      descriptionZh: '日本美丽的樱花季节，住宿费用较高。樱花观赏点将包含在可用的旅游行程中。',
      descriptionKo: '일본의 아름다운 벚꽃 시즌으로 숙박 요금이 높습니다. 벚꽃 관람 명소가 여행 일정에 포함됩니다.',
      descriptionVi: 'Mùa hoa anh đào đẹp ở Nhật Bản với giá phòng cao hơn. Các điểm ngắm hoa anh đào sẽ được đưa vào các tour du lịch.'
    });
    
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Autumn Foliage',
      startMonth: 10, // October
      endMonth: 11,   // November
      description: 'Experience the stunning autumn colors throughout Japan. This popular season features moderate accommodation rates.',
      priceMultiplier: 1.2, // 20% price increase
      nameJa: '紅葉シーズン',
      nameZh: '秋叶季节',
      nameKo: '단풍 시즌',
      nameVi: 'Mùa lá thu',
      descriptionJa: '日本全国で見事な秋の色を体験してください。この人気のシーズンは適度な宿泊料金が特徴です。',
      descriptionZh: '体验日本各地令人惊叹的秋季色彩。这个受欢迎的季节住宿费适中。',
      descriptionKo: '일본 전역의 아름다운 가을 색상을 경험하세요. 이 인기 시즌은 적당한 숙박 요금이 특징입니다.',
      descriptionVi: 'Trải nghiệm màu sắc mùa thu tuyệt đẹp khắp Nhật Bản. Mùa phổ biến này có giá phòng vừa phải.'
    });
    
    // Initialize with sample vehicles
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Small Van (5 seats)',
      seats: 5,
      pricePerDay: 15000, // 15,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Medium Van (10 seats)',
      seats: 10,
      pricePerDay: 25000, // 25,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Large Bus (25 seats)',
      seats: 25,
      pricePerDay: 45000, // 45,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    // Initialize with sample tours
    this.tours.set(this.currentTourId, {
      id: this.currentTourId++,
      name: 'Tokyo Highlights',
      code: 'TYO-HL',
      location: 'Tokyo',
      description: 'Explore the best of Tokyo including Asakusa, Shibuya, and Tokyo Tower.',
      durationDays: 1,
      basePrice: 15000, // 15,000 JPY per person
      imageUrl: 'https://source.unsplash.com/featured/?tokyo,japan',
      nameJa: '東京ハイライト',
      nameZh: '东京亮点',
      nameKo: '도쿄 하이라이트',
      nameVi: 'Điểm nhấn Tokyo',
      descriptionJa: '浅草、渋谷、東京タワーなど、東京の最高の場所を探索します。',
      descriptionZh: '探索东京最好的地方，包括浅草、涩谷和东京塔。',
      descriptionKo: '아사쿠사, 시부야, 도쿄 타워 등 도쿄 최고의 명소를 탐험하세요.',
      descriptionVi: 'Khám phá những điểm tốt nhất của Tokyo bao gồm Asakusa, Shibuya và Tháp Tokyo.'
    });
    
    this.tours.set(this.currentTourId, {
      id: this.currentTourId++,
      name: 'Kyoto Cultural Tour',
      code: 'KYO-CT',
      location: 'Kyoto',
      description: 'Immerse yourself in the ancient culture of Kyoto with visits to temples and traditional experiences.',
      durationDays: 2,
      basePrice: 35000, // 35,000 JPY per person
      imageUrl: 'https://source.unsplash.com/featured/?kyoto,japan',
      nameJa: '京都文化ツアー',
      nameZh: '京都文化之旅',
      nameKo: '교토 문화 투어',
      nameVi: 'Tour văn hóa Kyoto',
      descriptionJa: '寺院訪問や伝統的な体験を通じて、京都の古代文化に浸りましょう。',
      descriptionZh: '通过参观寺庙和传统体验，沉浸在京都的古代文化中。',
      descriptionKo: '사원 방문과 전통 체험을 통해 교토의 고대 문화에 빠져보세요.',
      descriptionVi: 'Đắm mình trong văn hóa cổ đại của Kyoto với các chuyến thăm đền chùa và trải nghiệm truyền thống.'
    });
    
    // Initialize with sample hotels
    this.hotels.set(this.currentHotelId, {
      id: this.currentHotelId++,
      name: 'Tokyo Plaza Hotel',
      location: 'Tokyo',
      stars: 3,
      singleRoomPrice: 15000, // 15,000 JPY per night
      doubleRoomPrice: 22000, // 22,000 JPY per night
      tripleRoomPrice: 30000, // 30,000 JPY per night
      breakfastPrice: 2000,   // 2,000 JPY per person
      imageUrl: 'https://source.unsplash.com/featured/?hotel,tokyo'
    });
    
    this.hotels.set(this.currentHotelId, {
      id: this.currentHotelId++,
      name: 'Kyoto Royal Resort',
      location: 'Kyoto',
      stars: 4,
      singleRoomPrice: 25000, // 25,000 JPY per night
      doubleRoomPrice: 35000, // 35,000 JPY per night
      tripleRoomPrice: 48000, // 48,000 JPY per night
      breakfastPrice: 2500,   // 2,500 JPY per person
      imageUrl: 'https://source.unsplash.com/featured/?hotel,kyoto'
    });
    
    // Initialize with sample guides
    this.guides.set(this.currentGuideId, {
      id: this.currentGuideId++,
      name: 'Tanaka Yuki',
      languages: ['english', 'japanese'],
      pricePerDay: 20000 // 20,000 JPY per day
    });
    
    this.guides.set(this.currentGuideId, {
      id: this.currentGuideId++,
      name: 'Nguyen Minh',
      languages: ['english', 'vietnamese', 'japanese'],
      pricePerDay: 22000 // 22,000 JPY per day
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPassword(id: number, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = { ...user, password: hashedPassword };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tour Management
  async getAllTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }
  
  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }
  
  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = this.currentTourId++;
    const tour: Tour = { ...insertTour, id };
    this.tours.set(id, tour);
    return tour;
  }
  
  async updateTour(id: number, tourUpdate: Partial<InsertTour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;
    
    const updatedTour = { ...tour, ...tourUpdate };
    this.tours.set(id, updatedTour);
    return updatedTour;
  }
  
  async deleteTour(id: number): Promise<boolean> {
    return this.tours.delete(id);
  }

  // Vehicle Management
  async getAllVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }
  
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.currentVehicleId++;
    const vehicle: Vehicle = { ...insertVehicle, id };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicle(id: number, vehicleUpdate: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const updatedVehicle = { ...vehicle, ...vehicleUpdate };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Hotel Management
  async getAllHotels(): Promise<Hotel[]> {
    return Array.from(this.hotels.values());
  }
  
  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }
  
  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const id = this.currentHotelId++;
    const hotel: Hotel = { ...insertHotel, id };
    this.hotels.set(id, hotel);
    return hotel;
  }
  
  async updateHotel(id: number, hotelUpdate: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const hotel = this.hotels.get(id);
    if (!hotel) return undefined;
    
    const updatedHotel = { ...hotel, ...hotelUpdate };
    this.hotels.set(id, updatedHotel);
    return updatedHotel;
  }
  
  async deleteHotel(id: number): Promise<boolean> {
    return this.hotels.delete(id);
  }

  // Guide Management
  async getAllGuides(): Promise<Guide[]> {
    return Array.from(this.guides.values());
  }
  
  async getGuide(id: number): Promise<Guide | undefined> {
    return this.guides.get(id);
  }
  
  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const id = this.currentGuideId++;
    const guide: Guide = { ...insertGuide, id };
    this.guides.set(id, guide);
    return guide;
  }
  
  async updateGuide(id: number, guideUpdate: Partial<InsertGuide>): Promise<Guide | undefined> {
    const guide = this.guides.get(id);
    if (!guide) return undefined;
    
    const updatedGuide = { ...guide, ...guideUpdate };
    this.guides.set(id, updatedGuide);
    return updatedGuide;
  }
  
  async deleteGuide(id: number): Promise<boolean> {
    return this.guides.delete(id);
  }

  // Season Management
  async getAllSeasons(): Promise<Season[]> {
    return Array.from(this.seasons.values());
  }
  
  async getSeason(id: number): Promise<Season | undefined> {
    return this.seasons.get(id);
  }
  
  async getSeasonByMonth(month: number): Promise<Season | undefined> {
    return Array.from(this.seasons.values()).find(
      (season) => month >= season.startMonth && month <= season.endMonth
    );
  }
  
  async createSeason(insertSeason: InsertSeason): Promise<Season> {
    const id = this.currentSeasonId++;
    const season: Season = { ...insertSeason, id };
    this.seasons.set(id, season);
    return season;
  }
  
  async updateSeason(id: number, seasonUpdate: Partial<InsertSeason>): Promise<Season | undefined> {
    const season = this.seasons.get(id);
    if (!season) return undefined;
    
    const updatedSeason = { ...season, ...seasonUpdate };
    this.seasons.set(id, updatedSeason);
    return updatedSeason;
  }
  
  async deleteSeason(id: number): Promise<boolean> {
    return this.seasons.delete(id);
  }

  // Settings Management
  async getSetting(key: string): Promise<string | undefined> {
    const setting = this.settings.get(key);
    return setting?.value;
  }
  
  async updateSetting(key: string, value: string): Promise<Setting> {
    const existingSetting = this.settings.get(key);
    
    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value };
      this.settings.set(key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.currentSettingId++;
      const newSetting: Setting = { id, key, value };
      this.settings.set(key, newSetting);
      return newSetting;
    }
  }
}

export const storage = new MemStorage();
