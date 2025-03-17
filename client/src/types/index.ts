export type User = {
  id: number;
  username: string;
  role: 'admin' | 'user';
};

export type Tour = {
  id: number;
  name: string;
  code: string;
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

export type Currency = 'JPY' | 'USD' | 'VND';

export type RoomType = 'single' | 'double' | 'triple';

export type CalculatorFormData = {
  tourId: number;
  startDate: string;
  endDate: string;
  vehicleId: number;
  participants: number;
  hotelId?: number;
  roomType?: RoomType;
  singleRoomCount?: number;
  doubleRoomCount?: number;
  tripleRoomCount?: number;
  includeBreakfast?: boolean;
  includeLunch?: boolean;
  includeDinner?: boolean;
  includeGuide?: boolean;
  guideId?: number;
  currency: Currency;
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
