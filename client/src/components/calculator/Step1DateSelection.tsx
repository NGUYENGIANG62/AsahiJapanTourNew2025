import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Season } from '@/types';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Facebook, Mail, Phone } from 'lucide-react';

const Step1DateSelection = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);
  const [season, setSeason] = useState<Season | null>(null);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  
  // Get current month from start date
  const startDate = formData.startDate ? new Date(formData.startDate) : null;
  const currentMonth = startDate ? startDate.getMonth() + 1 : null; // +1 because getMonth() returns 0-11
  
  // Fetch season information if start date is selected
  const { data: seasonData, isLoading: isLoadingSeason } = useQuery<Season>({
    queryKey: ['/api/seasons/month', currentMonth],
    enabled: !!currentMonth,
    queryFn: async () => {
      if (!currentMonth) return null;
      
      const response = await fetch(`/api/seasons/month/${currentMonth}`, {
        credentials: 'include',
      });
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch season data');
      }
      
      return response.json();
    },
  });
  
  // Update season when data changes
  useEffect(() => {
    setSeason(seasonData || null);
  }, [seasonData]);
  
  // Handle date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    updateFormData({ startDate: newStartDate });
    
    // If end date is before start date, reset end date
    if (formData.endDate && formData.endDate < newStartDate) {
      updateFormData({ endDate: '' });
    }
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({ endDate: e.target.value });
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.selectTourDates')}
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <Label className="block text-sm font-medium text-neutral mb-2">
                {t('calculator.startDate')}
              </Label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                min={today}
                value={formData.startDate}
                onChange={handleStartDateChange}
              />
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral mb-2">
                {t('calculator.endDate')}
              </Label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={handleEndDateChange}
                disabled={!formData.startDate}
              />
            </div>
          </div>
          
          {/* Seasonal Information */}
          {isLoadingSeason ? (
            <div className="p-4 bg-accent rounded-lg animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ) : season ? (
            <Alert className="bg-accent border-secondary">
              <InfoCircledIcon className="h-5 w-5 text-secondary" />
              <AlertTitle>{season.name}</AlertTitle>
              <AlertDescription className="mt-1 text-sm text-muted-foreground">
                {season.description}
              </AlertDescription>
            </Alert>
          ) : startDate ? (
            <Alert className="bg-accent">
              <InfoCircledIcon className="h-5 w-5" />
              <AlertTitle>Regular Season</AlertTitle>
              <AlertDescription className="mt-1 text-sm text-muted-foreground">
                You've selected dates during a regular travel season. Standard rates apply.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        
        {/* Welcome Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-primary mb-3">{t('common.welcomeMessage', 'Chào mừng đến với AsahiJapanTours.com')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('common.welcomeDescription', 'Cảm ơn bạn đã quan tâm đến dịch vụ tour của chúng tôi. Hãy bắt đầu bằng việc chọn ngày cho chuyến đi của bạn!')}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61566880418544" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="mailto:hoangtucuoirong@gmail.com" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a 
                  href="tel:0366754977" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Step1DateSelection;
