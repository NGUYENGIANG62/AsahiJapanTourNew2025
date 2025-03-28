export type User = {
  id: number;
  username: string;
  role: 'admin' | 'user' | 'agent';
};

export type Tour = {
  id: number;
  name: string;
  code: string;
  avfCode?: string; // Mã định dạng AVF mới (AVF001, AVF002, ...)
  location: string;
  description: string;
  durationDays: number;
  basePrice: number;
  imageUrl?: string;
  nameJa?: string;
  nameZh?: string;
  nameKo?: string;
  nameVi?: string;
  descriptionJa?: string;
  descriptionZh?: string;
  descriptionKo?: string;
  descriptionVi?: string;
};

export type Vehicle = {
  id: number;
  name: string;
  seats: number;
  luggageCapacity: number;
  pricePerDay: number;
  driverCostPerDay: number;
};

export type Hotel = {
  id: number;
  name: string;
  location: string;
  stars: number;
  singleRoomPrice: number;
  doubleRoomPrice: number;
  tripleRoomPrice: number;
  breakfastPrice: number;
  imageUrl?: string;
};

export type Guide = {
  id: number;
  name: string;
  languages: string[];
  pricePerDay: number;
  experience?: number; // Số năm kinh nghiệm
  hasInternationalLicense?: boolean; // Có giấy phép HDV quốc tế
  personality?: string; // Tính tình
  gender?: string; // Giới tính
  age?: number; // Độ tuổi
};

export type Season = {
  id: number;
  name: string;
  startMonth: number;
  endMonth: number;
  description: string;
  priceMultiplier: number;
  nameJa?: string;
  nameZh?: string;
  nameKo?: string;
  nameVi?: string;
  descriptionJa?: string;
  descriptionZh?: string;
  descriptionKo?: string;
  descriptionVi?: string;
};

export type Setting = {
  id: number;
  key: string;
  value: string;
};

export type Language = 'en' | 'ja' | 'zh' | 'ko' | 'vi';

export type Currency = 'JPY' | 'USD' | 'VND' | 'CNY' | 'KRW';

export type RoomType = 'single' | 'double' | 'triple';

export type SpecialService = {
  geishaShow?: boolean;
  kimonoExperience?: boolean;
  teaCeremony?: boolean;
  wagyuDinner?: boolean;
  sumoShow?: boolean;
  disneylandTickets?: boolean;
  universalStudioTickets?: boolean;
  airportTransfer?: boolean; // Dịch vụ đưa đón sân bay
  notes?: string;
};

export type HotelStarRating = 3 | 4 | 5;

export type FlightTimeOption = 'morning' | 'afternoon' | 'unknown';

export type CalculatorFormData = {
  tourId: number;
  startDate: string;
  endDate: string;
  vehicleId: number;
  vehicleCount?: number;
  participants: number;
  hotelId?: number;
  hotelStars?: HotelStarRating; // Mới: Hạng sao của khách sạn (3-5 sao)
  roomType?: RoomType;
  singleRoomCount?: number;
  doubleRoomCount?: number;
  tripleRoomCount?: number;
  stayingNights?: number; // Số đêm nghỉ tại khách sạn
  includeBreakfast?: boolean;
  includeLunch?: boolean;
  includeDinner?: boolean;
  includeGuide?: boolean;
  guideId?: number;
  currency: Currency;
  // Thông tin về thời gian bay
  arrivalTime?: FlightTimeOption; // Thời gian đến (sáng/chiều)
  departureTime?: FlightTimeOption; // Thời gian đi (sáng/chiều)
  // Dịch vụ đặc biệt thêm ngoài tour
  specialServices?: SpecialService;
};

export type CalculationResult = {
  tourDetails: {
    id: number;
    name: string;
    location: string;
    code: string;
    durationDays: number;
  };
  calculationDetails: {
    startDate: string;
    endDate: string;
    participants: number;
    season: { name: string; multiplier: number; } | null;
  };
  costs: {
    baseCost: number;
    vehicleCost: number;
    driverCost: number;
    hotelCost: number;
    mealsCost: number;
    guideCost: number;
    subtotal: number;
    profitAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  currency: Currency;
  totalInRequestedCurrency: number;
};
