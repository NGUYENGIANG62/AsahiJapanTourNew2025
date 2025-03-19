import { createContext, useState, ReactNode, useEffect } from 'react';
import { CalculatorFormData, CalculationResult, Currency, RoomType } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

type CalculatorContextType = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  formData: CalculatorFormData;
  updateFormData: (data: Partial<CalculatorFormData>) => void;
  resetFormData: () => void;
  calculation: CalculationResult | null;
  isCalculating: boolean;
  calculatePrice: () => Promise<void>;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isValid: boolean;
};

const initialFormData: CalculatorFormData = {
  tourId: 0,
  startDate: '',
  endDate: '',
  vehicleId: 0,
  vehicleCount: 1,
  participants: 1,
  stayingNights: 0,
  currency: 'JPY',
  specialServices: {
    geishaShow: false,
    kimonoExperience: false,
    teaCeremony: false,
    wagyuDinner: false,
    sumoShow: false,
    disneylandTickets: false,
    universalStudioTickets: false,
    airportTransfer: false,
    notes: '',
  },
};

export const CalculatorContext = createContext<CalculatorContextType>({
  currentStep: 1,
  setCurrentStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  formData: initialFormData,
  updateFormData: () => {},
  resetFormData: () => {},
  calculation: null,
  isCalculating: false,
  calculatePrice: async () => {},
  currency: 'JPY',
  setCurrency: () => {},
  isValid: false,
});

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CalculatorFormData>({...initialFormData});
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  // Chỉ sử dụng đơn vị Yên Nhật
  const [currency, setCurrency] = useState<Currency>('JPY');
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // Lấy thông tin người dùng hiện tại
  
  // Reset form khi đăng xuất/đăng nhập mới (trừ admin)
  useEffect(() => {
    // Reset form data khi người dùng thay đổi hoặc đăng xuất
    // Giữ lại dữ liệu nếu là admin
    if (!user || (user && user.role !== 'admin')) {
      console.log("Resetting calculator data due to user change or logout");
      resetFormData();
    }
  }, [user]);

  // Validate current step
  useEffect(() => {
    let valid = false;
    
    switch (currentStep) {
      case 1: // Dates
        valid = formData.startDate !== '' && formData.endDate !== '';
        break;
      case 2: // Services
        valid = formData.tourId > 0 && formData.vehicleId > 0;
        break;
      case 3: // Participants
        valid = formData.participants > 0;
        break;
      case 4: // Accommodation
        // If hotel is selected, room type must be selected
        if (formData.hotelId) {
          valid = !!formData.roomType;
        } else {
          valid = true; // Hotel is optional
        }
        break;
      case 5: // Special Services
        valid = true; // Always valid, optional services
        break;
      case 6: // Summary
        valid = true; // Always valid, just for display
        break;
      default:
        valid = false;
    }
    
    setIsValid(valid);
  }, [currentStep, formData]);

  // Update currency in form data when currency changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, currency }));
  }, [currency]);

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<CalculatorFormData>) => {
    setFormData({ ...formData, ...data });
  };

  const resetFormData = () => {
    setFormData({...initialFormData, currency});
    setCalculation(null);
    setCurrentStep(1);
  };

  const calculatePrice = async () => {
    try {
      setIsCalculating(true);
      const response = await apiRequest('POST', '/api/calculator', formData);
      
      if (response.ok) {
        const result = await response.json();
        setCalculation(result);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Calculation Error',
          description: errorData.message || 'Failed to calculate price',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Price calculation error:', error);
      toast({
        title: 'Calculation Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <CalculatorContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        formData,
        updateFormData,
        resetFormData,
        calculation,
        isCalculating,
        calculatePrice,
        currency,
        setCurrency,
        isValid,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};
