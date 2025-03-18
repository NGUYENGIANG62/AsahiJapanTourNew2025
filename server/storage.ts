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
  updateAllTourAVFCodes(): Promise<Tour[]>;
  
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
  getAllSettings(): Promise<Setting[]>;
  
  // Google Sheets Sync Methods
  createOrUpdateTour(tour: any): Promise<Tour>;
  createOrUpdateVehicle(vehicle: any): Promise<Vehicle>;
  createOrUpdateHotel(hotel: any): Promise<Hotel>;
  createOrUpdateGuide(guide: any): Promise<Guide>;
  createOrUpdateSeason(season: any): Promise<Season>;
  createOrUpdateSetting(setting: any): Promise<Setting>;
  getLastSyncTimestamp(): Promise<number>;
  updateLastSyncTimestamp(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tours: Map<number, Tour>;
  private vehicles: Map<number, Vehicle>;
  private hotels: Map<number, Hotel>;
  private guides: Map<number, Guide>;
  private seasons: Map<number, Season>;
  private settings: Map<string, Setting>;
  
  // Last sync timestamp
  private lastSyncTimestamp: number = 0;
  
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
    
    this.settings.set('lunchPrice', {
      id: this.currentSettingId++,
      key: 'lunchPrice',
      value: '2000' // 2000 JPY per person per day
    });
    
    this.settings.set('dinnerPrice', {
      id: this.currentSettingId++,
      key: 'dinnerPrice',
      value: '3000' // 3000 JPY per person per day
    });
    
    // Khách sạn 3 sao
    this.settings.set('hotel_3star_single', {
      id: this.currentSettingId++,
      key: 'hotel_3star_single',
      value: '9500' // 9500 JPY per night
    });
    
    this.settings.set('hotel_3star_double', {
      id: this.currentSettingId++,
      key: 'hotel_3star_double',
      value: '15000' // 15000 JPY per night
    });
    
    this.settings.set('hotel_3star_triple', {
      id: this.currentSettingId++,
      key: 'hotel_3star_triple',
      value: '19000' // 19000 JPY per night
    });
    
    this.settings.set('hotel_3star_breakfast', {
      id: this.currentSettingId++,
      key: 'hotel_3star_breakfast',
      value: '1500' // 1500 JPY per person
    });
    
    // Khách sạn 4 sao
    this.settings.set('hotel_4star_single', {
      id: this.currentSettingId++,
      key: 'hotel_4star_single',
      value: '15000' // 15000 JPY per night
    });
    
    this.settings.set('hotel_4star_double', {
      id: this.currentSettingId++,
      key: 'hotel_4star_double',
      value: '25000' // 25000 JPY per night
    });
    
    this.settings.set('hotel_4star_triple', {
      id: this.currentSettingId++,
      key: 'hotel_4star_triple',
      value: '32000' // 32000 JPY per night
    });
    
    this.settings.set('hotel_4star_breakfast', {
      id: this.currentSettingId++,
      key: 'hotel_4star_breakfast',
      value: '2000' // 2000 JPY per person
    });
    
    // Khách sạn 5 sao
    this.settings.set('hotel_5star_single', {
      id: this.currentSettingId++,
      key: 'hotel_5star_single',
      value: '25000' // 25000 JPY per night
    });
    
    this.settings.set('hotel_5star_double', {
      id: this.currentSettingId++,
      key: 'hotel_5star_double',
      value: '40000' // 40000 JPY per night
    });
    
    this.settings.set('hotel_5star_triple', {
      id: this.currentSettingId++,
      key: 'hotel_5star_triple',
      value: '50000' // 50000 JPY per night
    });
    
    this.settings.set('hotel_5star_breakfast', {
      id: this.currentSettingId++,
      key: 'hotel_5star_breakfast',
      value: '3000' // 3000 JPY per person
    });
    
    // Initialize with detailed seasonal information
    
    // Spring Season (March - May)
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Cherry Blossom Season',
      startMonth: 3, // March
      endMonth: 5,   // May
      description: '🌸 Spring (March - May): Cherry blossom season, Hina Matsuri doll festival (March 3), Takayama Festival (April 14-15), Golden Week (April 29-May 5), Fuji wisteria blooms, and Shibazakura flowers at Mt. Fuji base.',
      priceMultiplier: 1.3, // 30% price increase
      nameJa: '桜の季節',
      nameZh: '樱花季节',
      nameKo: '벚꽃 시즌',
      nameVi: 'Mùa Xuân - Mùa hoa anh đào',
      descriptionJa: '🌸 春 (3月～5月): 桜の季節、ひな祭り (3月3日)、高山祭 (4月14-15日)、ゴールデンウィーク (4月29日-5月5日)、藤の花、富士山麓の芝桜。',
      descriptionZh: '🌸 春季 (3月-5月): 樱花季节、雏人偶节 (3月3日)、高山祭 (4月14-15日)、黄金周 (4月29日-5月5日)、紫藤花盛开、富士山脚下的芝樱。',
      descriptionKo: '🌸 봄 (3월-5월): 벚꽃 시즌, 히나마츠리 인형 축제 (3월 3일), 다카야마 축제 (4월 14-15일), 골든위크 (4월 29일-5월 5일), 등나무 꽃 만개, 후지산 기슭의 시바자쿠라.',
      descriptionVi: '🌸 Mùa Xuân (Tháng 3 – Tháng 5): Mùa hoa anh đào, lễ hội búp bê Hina Matsuri (3/3), lễ hội Takayama (14-15/4), Tuần lễ vàng (29/4 – 5/5), hoa tử đằng nở rộ, hoa Shibazakura dưới chân núi Phú Sĩ.'
    });
    
    // Summer Season (June - August)
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Summer Festival Season',
      startMonth: 6, // June
      endMonth: 8,   // August
      description: '🌿 Summer (June - August): Rainy season, Hydrangea blooms in Kamakura & Kyoto, Gion Matsuri in Kyoto, Mt. Fuji climbing season, Tenjin Matsuri in Osaka, fireworks festivals, Obon holiday, and Nebuta Matsuri lantern parade in Aomori.',
      priceMultiplier: 1.1, // 10% price increase
      nameJa: '夏祭りシーズン',
      nameZh: '夏季节日季节',
      nameKo: '여름 축제 시즌',
      nameVi: 'Mùa Hè - Mùa lễ hội',
      descriptionJa: '🌿 夏 (6月～8月): 梅雨、鎌倉と京都の紫陽花、祇園祭、富士山登山シーズン、天神祭、花火大会、お盆、青森のねぶた祭り。',
      descriptionZh: '🌿 夏季 (6月-8月): 梅雨季节、镰仓和京都的绣球花盛开、京都祗园祭、富士山攀登季节、大阪天神祭、烟花大会、盂兰盆节、青森睡魔祭。',
      descriptionKo: '🌿 여름 (6월-8월): 장마철, 가마쿠라와 교토의 수국 개화, 기온 마쓰리, 후지산 등반 시즌, 오사카 텐진 마쓰리, 불꽃 축제, 오본 휴일, 아오모리 네부타 축제.',
      descriptionVi: '🌿 Mùa Hè (Tháng 6 – Tháng 8): Mùa mưa, hoa cẩm tú cầu nở ở Kamakura và Kyoto, lễ hội Gion Matsuri ở Kyoto, mùa leo núi Phú Sĩ, lễ hội Tenjin Matsuri ở Osaka, lễ hội pháo hoa, lễ hội Obon tưởng nhớ tổ tiên, và lễ hội Nebuta Matsuri ở Aomori.'
    });
    
    // Autumn Season (September - November)
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Autumn Foliage',
      startMonth: 9, // September
      endMonth: 11,   // November
      description: '🍁 Autumn (September - November): Golden rice fields, Kishiwada Danjiri Festival in Osaka, maple leaves changing colors in Hokkaido and highlands, Jidai Matsuri in Kyoto, and Shichi-Go-San festival for children aged 3, 5, and 7.',
      priceMultiplier: 1.2, // 20% price increase
      nameJa: '紅葉シーズン',
      nameZh: '秋叶季节',
      nameKo: '단풍 시즌',
      nameVi: 'Mùa Thu - Mùa lá đỏ',
      descriptionJa: '🍁 秋 (9月～11月): 黄金色の稲穂、岸和田だんじり祭り、北海道と高地での紅葉、時代祭、七五三。',
      descriptionZh: '🍁 秋季 (9月-11月): 金黄稻田、大阪岸和田地车祭、北海道和高地枫叶变色、京都时代祭、七五三儿童成长礼。',
      descriptionKo: '🍁 가을 (9월-11월): 황금빛 논, 오사카의 기시와다 단지리 축제, 홋카이도와 고지대에서 단풍 색 변화, 교토의 지다이 마쓰리, 3, 5, 7세 어린이를 위한 시치고산 축제.',
      descriptionVi: '🍁 Mùa Thu (Tháng 9 – Tháng 11): Mùa lúa chín vàng, lễ hội Kishiwada Danjiri ở Osaka, lá phong đổi màu ở Hokkaido và vùng cao, lễ hội Jidai Matsuri ở Kyoto, và lễ hội Shichi-Go-San cho trẻ em 3, 5, 7 tuổi.'
    });
    
    // Winter Season (December - February)
    this.seasons.set(this.currentSeasonId, {
      id: this.currentSeasonId++,
      name: 'Winter Snow Season',
      startMonth: 12, // December
      endMonth: 2,   // February
      description: '❄️ Winter (December - February): Christmas illuminations in Tokyo and Osaka, ski season in Hokkaido and Nagano, popular onsen (hot springs), New Year celebrations at temples, Sapporo White Illumination, Sapporo Snow Festival with ice sculptures, Yokote Kamakura snow hut festival, and snow monkeys bathing in onsen at Jigokudani.',
      priceMultiplier: 1.15, // 15% price increase
      nameJa: '冬の雪シーズン',
      nameZh: '冬季雪季',
      nameKo: '겨울 눈 시즌',
      nameVi: 'Mùa Đông - Mùa tuyết',
      descriptionJa: '❄️ 冬 (12月～2月): 東京と大阪のクリスマスイルミネーション、北海道と長野のスキーシーズン、温泉、寺院での新年の祝賀、札幌ホワイトイルミネーション、札幌雪まつり、横手かまくら、地獄谷の雪猿。',
      descriptionZh: '❄️ 冬季 (12月-2月): 东京和大阪的圣诞彩灯、北海道和长野的滑雪季节、温泉受欢迎、寺庙新年庆祝、札幌白色灯饰、札幌冰雪节、横手雪屋节、地狱谷温泉中的雪猴。',
      descriptionKo: '❄️ 겨울 (12월-2월): 도쿄와 오사카의 크리스마스 일루미네이션, 홋카이도와 나가노의 스키 시즌, 인기 있는 온천, 사원에서의 새해 축하 행사, 삿포로 화이트 일루미네이션, 얼음 조각이 있는 삿포로 눈 축제, 요코테 카마쿠라 눈집 축제, 지고쿠다니에서 온천에 목욕하는 눈 원숭이.',
      descriptionVi: '❄️ Mùa Đông (Tháng 12 – Tháng 2): Đèn trang trí Giáng sinh ở Tokyo và Osaka, mùa trượt tuyết ở Hokkaido và Nagano, các khu nghỉ dưỡng onsen (suối nước nóng) phổ biến, lễ đón năm mới tại các đền chùa, lễ hội ánh sáng Sapporo, lễ hội tuyết Sapporo với điêu khắc băng, lễ hội lều tuyết Yokote Kamakura, và khỉ tuyết tắm onsen tại Jigokudani.'
    });
    
    // Initialize with sample vehicles
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Small Van (5 seats)',
      seats: 5,
      luggageCapacity: 4, // 4 suitcases
      pricePerDay: 15000, // 15,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Medium Van (10 seats)',
      seats: 10,
      luggageCapacity: 8, // 8 suitcases
      pricePerDay: 25000, // 25,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Large Bus (25 seats)',
      seats: 25,
      luggageCapacity: 20, // 20 suitcases
      pricePerDay: 45000, // 45,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    this.vehicles.set(this.currentVehicleId, {
      id: this.currentVehicleId++,
      name: 'Extra Large Bus (45 seats)',
      seats: 45,
      luggageCapacity: 40, // 40 suitcases
      pricePerDay: 70000, // 70,000 JPY per day
      driverCostPerDay: 5000 // 5,000 JPY per day
    });
    
    // Đặt lại currentTourId để đảm bảo mã AVF bắt đầu từ 0
    this.currentTourId = 1;
    
    // Initialize with sample tours
    this.tours.set(this.currentTourId, {
      id: this.currentTourId,
      name: 'Tokyo Highlights',
      code: 'AVF000', // Mã mới theo định dạng AVF
      avfCode: 'AVF001', // Mã AVF mới
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
    this.currentTourId++; // Tăng ID sau khi đã set
    
    this.tours.set(this.currentTourId, {
      id: this.currentTourId,
      name: 'Kyoto Cultural Tour',
      code: 'AVF001', // Mã mới theo định dạng AVF
      avfCode: 'AVF002', // Mã AVF mới
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
    
    // Initialize with sample hotels based on Google Sheets
    this.hotels.set(this.currentHotelId, {
      id: this.currentHotelId++,
      name: 'Tokyo Plaza Hotel',
      location: 'Tokyo',
      stars: 3,
      singleRoomPrice: 9500, // Based on Google Sheets
      doubleRoomPrice: 16000, // Based on Google Sheets
      tripleRoomPrice: 27000, // Based on Google Sheets
      breakfastPrice: 2000,   // Based on Google Sheets
      imageUrl: 'https://source.unsplash.com/featured/?hotel,tokyo'
    });
    
    this.hotels.set(this.currentHotelId, {
      id: this.currentHotelId++,
      name: 'Kyoto Royal Resort',
      location: 'Kyoto',
      stars: 4,
      singleRoomPrice: 18000, // Based on Google Sheets
      doubleRoomPrice: 30000, // Based on Google Sheets
      tripleRoomPrice: 54000, // Based on Google Sheets
      breakfastPrice: 2500,   // Based on Google Sheets
      imageUrl: 'https://source.unsplash.com/featured/?hotel,kyoto'
    });
    
    this.hotels.set(this.currentHotelId, {
      id: this.currentHotelId++,
      name: 'Tokyo Plaza Luxury',
      location: 'Tokyo',
      stars: 5,
      singleRoomPrice: 35000, // Based on Google Sheets
      doubleRoomPrice: 70000, // Based on Google Sheets
      tripleRoomPrice: 110000, // Based on Google Sheets
      breakfastPrice: 4000,   // Based on Google Sheets
      imageUrl: 'https://source.unsplash.com/featured/?hotel,tokyo,luxury'
    });
    
    // Initialize with sample guides
    this.guides.set(this.currentGuideId, {
      id: this.currentGuideId++,
      name: 'Tanaka Yuki',
      languages: ['english', 'japanese'],
      pricePerDay: 20000, // 20,000 JPY per day
      experience: 5,
      hasInternationalLicense: true,
      personality: 'Thân thiện, kiên nhẫn',
      gender: 'Nam',
      age: 35
    });
    
    this.guides.set(this.currentGuideId, {
      id: this.currentGuideId++,
      name: 'Nguyen Minh',
      languages: ['english', 'vietnamese', 'japanese'],
      pricePerDay: 22000, // 22,000 JPY per day
      experience: 7,
      hasInternationalLicense: true,
      personality: 'Vui vẻ, am hiểu văn hóa',
      gender: 'Nam',
      age: 40
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
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user' // Default to user role if not specified
    };
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
    
    // Tạo mã AVF theo số thứ tự
    const avfCode = `AVF${(id - 1).toString().padStart(3, '0')}`;
    
    const tour: Tour = { 
      ...insertTour, 
      id,
      code: avfCode, // Ghi đè mã đã cung cấp với mã AVF mới
      avfCode: avfCode, // Đặt mã AVF giống với code
      nameJa: insertTour.nameJa || null,
      nameZh: insertTour.nameZh || null,
      nameKo: insertTour.nameKo || null,
      nameVi: insertTour.nameVi || null,
      descriptionJa: insertTour.descriptionJa || null,
      descriptionZh: insertTour.descriptionZh || null,
      descriptionKo: insertTour.descriptionKo || null,
      descriptionVi: insertTour.descriptionVi || null,
      imageUrl: insertTour.imageUrl || null
    };
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
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      luggageCapacity: insertVehicle.luggageCapacity || 0 // Default luggage capacity
    };
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
    const hotel: Hotel = { 
      ...insertHotel, 
      id,
      imageUrl: insertHotel.imageUrl || null
    };
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
    const guide: Guide = { 
      ...insertGuide, 
      id,
      experience: insertGuide.experience || null,
      hasInternationalLicense: insertGuide.hasInternationalLicense || null,
      personality: insertGuide.personality || null,
      gender: insertGuide.gender || null,
      age: insertGuide.age || null
    };
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
    const season: Season = { 
      ...insertSeason, 
      id,
      name: insertSeason.name,
      description: insertSeason.description,
      startMonth: insertSeason.startMonth,
      endMonth: insertSeason.endMonth,
      priceMultiplier: insertSeason.priceMultiplier || 1.0,
      nameJa: insertSeason.nameJa || null,
      nameZh: insertSeason.nameZh || null,
      nameKo: insertSeason.nameKo || null,
      nameVi: insertSeason.nameVi || null,
      descriptionJa: insertSeason.descriptionJa || null,
      descriptionZh: insertSeason.descriptionZh || null,
      descriptionKo: insertSeason.descriptionKo || null,
      descriptionVi: insertSeason.descriptionVi || null
    };
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

  // Google Sheets Sync Methods
  async createOrUpdateTour(tour: any): Promise<Tour> {
    if (tour.id && this.tours.has(Number(tour.id))) {
      const id = Number(tour.id);
      return this.updateTour(id, {
        name: tour.name,
        code: tour.code,
        location: tour.location,
        description: tour.description,
        durationDays: Number(tour.durationDays),
        basePrice: Number(tour.basePrice),
        imageUrl: tour.imageUrl,
        nameJa: tour.nameJa,
        nameZh: tour.nameZh,
        nameKo: tour.nameKo,
        nameVi: tour.nameVi,
        descriptionJa: tour.descriptionJa,
        descriptionZh: tour.descriptionZh,
        descriptionKo: tour.descriptionKo,
        descriptionVi: tour.descriptionVi
      }) as Promise<Tour>;
    } else {
      // If no ID or ID not found, create new
      return this.createTour({
        name: tour.name,
        code: tour.code,
        location: tour.location,
        description: tour.description,
        durationDays: Number(tour.durationDays) || 1,
        basePrice: Number(tour.basePrice) || 0,
        imageUrl: tour.imageUrl,
        nameJa: tour.nameJa,
        nameZh: tour.nameZh,
        nameKo: tour.nameKo,
        nameVi: tour.nameVi,
        descriptionJa: tour.descriptionJa,
        descriptionZh: tour.descriptionZh,
        descriptionKo: tour.descriptionKo,
        descriptionVi: tour.descriptionVi
      });
    }
  }

  async createOrUpdateVehicle(vehicle: any): Promise<Vehicle> {
    if (vehicle.id && this.vehicles.has(Number(vehicle.id))) {
      const id = Number(vehicle.id);
      return this.updateVehicle(id, {
        name: vehicle.name,
        seats: Number(vehicle.seats) || 0,
        luggageCapacity: Number(vehicle.luggageCapacity) || 0,
        pricePerDay: Number(vehicle.pricePerDay) || 0,
        driverCostPerDay: Number(vehicle.driverCostPerDay) || 0
      }) as Promise<Vehicle>;
    } else {
      // If no ID or ID not found, create new
      return this.createVehicle({
        name: vehicle.name,
        seats: Number(vehicle.seats) || 0,
        luggageCapacity: Number(vehicle.luggageCapacity) || 0,
        pricePerDay: Number(vehicle.pricePerDay) || 0,
        driverCostPerDay: Number(vehicle.driverCostPerDay) || 0
      });
    }
  }

  async createOrUpdateHotel(hotel: any): Promise<Hotel> {
    if (hotel.id && this.hotels.has(Number(hotel.id))) {
      const id = Number(hotel.id);
      // Update hotel - remove lunch and dinner prices
      return this.updateHotel(id, {
        name: hotel.name,
        location: hotel.location,
        stars: Number(hotel.stars) || 0,
        singleRoomPrice: Number(hotel.singleRoomPrice) || 0,
        doubleRoomPrice: Number(hotel.doubleRoomPrice) || 0,
        tripleRoomPrice: Number(hotel.tripleRoomPrice) || 0,
        breakfastPrice: Number(hotel.breakfastPrice) || 0,
        imageUrl: hotel.imageUrl
      }) as Promise<Hotel>;
    } else {
      // If no ID or ID not found, create new
      // Create hotel - remove lunch and dinner prices
      return this.createHotel({
        name: hotel.name,
        location: hotel.location,
        stars: Number(hotel.stars) || 0,
        singleRoomPrice: Number(hotel.singleRoomPrice) || 0,
        doubleRoomPrice: Number(hotel.doubleRoomPrice) || 0,
        tripleRoomPrice: Number(hotel.tripleRoomPrice) || 0,
        breakfastPrice: Number(hotel.breakfastPrice) || 0,
        imageUrl: hotel.imageUrl
      });
    }
  }

  async createOrUpdateGuide(guide: any): Promise<Guide> {
    const languages = typeof guide.languages === 'string' 
      ? guide.languages.split(',').map((lang: string) => lang.trim()) 
      : guide.languages || [];
    
    // Convert hasInternationalLicense to boolean
    let hasLicense = false;
    if (guide.hasInternationalLicense === true || 
        guide.hasInternationalLicense === 'true' || 
        guide.hasInternationalLicense === 'TRUE' || 
        guide.hasInternationalLicense === '1' || 
        guide.hasInternationalLicense === 'Yes' || 
        guide.hasInternationalLicense === 'yes') {
      hasLicense = true;
    }
    
    if (guide.id && this.guides.has(Number(guide.id))) {
      const id = Number(guide.id);
      return this.updateGuide(id, {
        name: guide.name,
        languages,
        pricePerDay: Number(guide.pricePerDay) || 0,
        experience: guide.experience ? Number(guide.experience) : undefined,
        hasInternationalLicense: hasLicense,
        personality: guide.personality,
        gender: guide.gender,
        age: guide.age ? Number(guide.age) : undefined
      }) as Promise<Guide>;
    } else {
      // If no ID or ID not found, create new
      return this.createGuide({
        name: guide.name,
        languages,
        pricePerDay: Number(guide.pricePerDay) || 0,
        experience: guide.experience ? Number(guide.experience) : undefined,
        hasInternationalLicense: hasLicense,
        personality: guide.personality,
        gender: guide.gender,
        age: guide.age ? Number(guide.age) : undefined
      });
    }
  }

  async createOrUpdateSeason(season: any): Promise<Season> {
    if (season.id && this.seasons.has(Number(season.id))) {
      const id = Number(season.id);
      return this.updateSeason(id, {
        name: season.name,
        startMonth: Number(season.startMonth) || 1,
        endMonth: Number(season.endMonth) || 12,
        description: season.description,
        priceMultiplier: Number(season.priceMultiplier) || 1,
        nameJa: season.nameJa,
        nameZh: season.nameZh,
        nameKo: season.nameKo,
        nameVi: season.nameVi,
        descriptionJa: season.descriptionJa,
        descriptionZh: season.descriptionZh,
        descriptionKo: season.descriptionKo,
        descriptionVi: season.descriptionVi
      }) as Promise<Season>;
    } else {
      // If no ID or ID not found, create new
      return this.createSeason({
        name: season.name,
        startMonth: Number(season.startMonth) || 1,
        endMonth: Number(season.endMonth) || 12,
        description: season.description,
        priceMultiplier: Number(season.priceMultiplier) || 1,
        nameJa: season.nameJa,
        nameZh: season.nameZh,
        nameKo: season.nameKo,
        nameVi: season.nameVi,
        descriptionJa: season.descriptionJa,
        descriptionZh: season.descriptionZh,
        descriptionKo: season.descriptionKo,
        descriptionVi: season.descriptionVi
      });
    }
  }

  // Lấy tất cả settings
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
  
  // Đồng bộ hóa setting từ Google Sheets
  async createOrUpdateSetting(setting: any): Promise<Setting> {
    // Skip if no key
    if (!setting.key) {
      throw new Error('Setting key is required');
    }
    
    // Chuyển đổi value nếu cần
    const value = setting.value !== undefined ? String(setting.value) : '';
    
    try {
      // Cập nhật setting nếu đã tồn tại
      if (this.settings.has(setting.key)) {
        return this.updateSetting(setting.key, value);
      }
      
      // Nếu không tồn tại, tạo mới
      const newSetting: Setting = {
        id: this.currentSettingId++,
        key: setting.key,
        value: value
      };
      
      this.settings.set(setting.key, newSetting);
      return newSetting;
    } catch (error) {
      console.error(`Error in createOrUpdateSetting: ${error}`);
      throw error;
    }
  }

  async getLastSyncTimestamp(): Promise<number> {
    return this.lastSyncTimestamp;
  }

  async updateLastSyncTimestamp(): Promise<void> {
    this.lastSyncTimestamp = Date.now();
  }

  // Cập nhật mã AVF cho tất cả tours
  async updateAllTourAVFCodes(): Promise<Tour[]> {
    const tours = Array.from(this.tours.values());
    
    // Cập nhật mã cho từng tour
    for (let i = 0; i < tours.length; i++) {
      const tour = tours[i];
      const avfCode = `AVF${i.toString().padStart(3, '0')}`; // AVF000, AVF001, ...
      
      // Giữ nguyên mã tour hiện tại, chỉ thêm avfCode
      await this.updateTour(tour.id, { avfCode });
    }
    
    // Trả về danh sách tours đã cập nhật
    return Array.from(this.tours.values());
  }
}

export const storage = new MemStorage();