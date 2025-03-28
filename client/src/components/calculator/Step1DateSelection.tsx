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
import i18n from '@/lib/i18n';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FlightDetails from './FlightDetails';

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
  const { data: seasonData, isLoading: isLoadingSeason, refetch: refetchSeason } = useQuery<Season>({
    queryKey: ['/api/seasons/month', currentMonth, i18n.language],
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
  
  // Update season when data changes or language changes
  useEffect(() => {
    setSeason(seasonData || null);
  }, [seasonData]);
  
  // Refetch season data when language changes
  useEffect(() => {
    if (currentMonth) {
      refetchSeason();
    }
  }, [i18n.language, refetchSeason, currentMonth]);
  
  // Handle date change
  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    const newStartDate = date.toISOString().split('T')[0];
    updateFormData({ startDate: newStartDate });
    
    // If end date is before start date, reset end date
    if (formData.endDate && formData.endDate < newStartDate) {
      updateFormData({ endDate: '' });
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    const newEndDate = date.toISOString().split('T')[0];
    updateFormData({ endDate: newEndDate });
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
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary/50 focus-within:outline-none">
                <DatePicker 
                  className="w-full outline-none"
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={handleStartDateChange}
                  minDate={new Date()}
                  dateFormat="yyyy/MM/dd"
                  locale={i18n.language}
                  placeholderText={t('calculator.selectTourDates')}
                />
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral mb-2">
                {t('calculator.endDate')}
              </Label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary/50 focus-within:outline-none">
                <DatePicker 
                  className="w-full outline-none"
                  selected={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={handleEndDateChange}
                  minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                  dateFormat="yyyy/MM/dd"
                  locale={i18n.language}
                  placeholderText={t('calculator.selectTourDates')}
                  disabled={!formData.startDate}
                />
              </div>
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
              <AlertTitle>
                {i18n.language === 'ja' && season.nameJa ? season.nameJa : 
                 i18n.language === 'zh' && season.nameZh ? season.nameZh :
                 i18n.language === 'ko' && season.nameKo ? season.nameKo :
                 i18n.language === 'vi' && season.nameVi ? season.nameVi : 
                 season.name}
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                {i18n.language === 'ja' && season.descriptionJa ? season.descriptionJa : 
                 i18n.language === 'zh' && season.descriptionZh ? season.descriptionZh :
                 i18n.language === 'ko' && season.descriptionKo ? season.descriptionKo :
                 i18n.language === 'vi' && season.descriptionVi ? season.descriptionVi : 
                 season.description}
              </AlertDescription>
            </Alert>
          ) : startDate ? (
            <Alert className="bg-accent">
              <InfoCircledIcon className="h-5 w-5" />
              <AlertTitle>{t('calculator.regularSeason', 'Regular Season')}</AlertTitle>
              <AlertDescription className="mt-1 text-sm text-muted-foreground">
                {t('calculator.regularSeasonDescription', 'You\'ve selected dates during a regular travel season. Standard rates apply.')}
              </AlertDescription>
            </Alert>
          ) : null}
          
          {/* Flight Details Section - only show if dates are selected */}
          {formData.startDate && formData.endDate && (
            <div className="mt-8">
              <FlightDetails />
            </div>
          )}
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
                  href="mailto:asahivietlifejapantours@gmail.com" 
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a 
                  href="tel:03-6675-4977" 
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
