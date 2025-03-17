import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Tour, Vehicle, Hotel, Guide, Season } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays,
  Map,
  Users,
  Car,
  Hotel as HotelIcon,
  Utensils,
  User,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Step5Summary = () => {
  const { t } = useTranslation();
  const { 
    formData, 
    calculation,
    currency 
  } = useContext(CalculatorContext);
  
  // Fetch data for the summary
  const { data: tour } = useQuery<Tour>({
    queryKey: ['/api/tours', formData.tourId],
    enabled: !!formData.tourId,
  });
  
  const { data: vehicle } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', formData.vehicleId],
    enabled: !!formData.vehicleId,
  });
  
  const { data: hotel } = useQuery<Hotel>({
    queryKey: ['/api/hotels', formData.hotelId],
    enabled: !!formData.hotelId,
  });
  
  const { data: guide } = useQuery<Guide>({
    queryKey: ['/api/guides', formData.guideId],
    enabled: !!formData.guideId,
  });
  
  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate duration
  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Get tax rate and profit margin from calculation
  const [taxRate, setTaxRate] = useState<number>(10);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  
  // Get settings
  const { data: taxRateSetting } = useQuery({
    queryKey: ['/api/settings/tax_rate'],
    queryFn: async () => {
      const response = await fetch('/api/settings/tax_rate', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch tax rate');
      return response.json();
    },
  });
  
  const { data: profitMarginSetting } = useQuery({
    queryKey: ['/api/settings/profit_margin'],
    queryFn: async () => {
      const response = await fetch('/api/settings/profit_margin', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch profit margin');
      return response.json();
    },
  });
  
  // Update rates when data is loaded
  useEffect(() => {
    if (taxRateSetting?.value) {
      setTaxRate(parseFloat(taxRateSetting.value));
    }
    if (profitMarginSetting?.value) {
      setProfitMargin(parseFloat(profitMarginSetting.value));
    }
  }, [taxRateSetting, profitMarginSetting]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`;
    } else if (currency === 'USD') {
      return `$${amount.toLocaleString()}`;
    } else if (currency === 'VND') {
      return `₫${amount.toLocaleString()}`;
    }
    return amount.toLocaleString();
  };
  
  // Get calculated amount from calculation result
  const getTotalAmount = () => {
    if (calculation) {
      return calculation.totalInRequestedCurrency;
    }
    return 0;
  };
  
  // Get room type label
  const getRoomTypeLabel = () => {
    if (!formData.roomType) return '';
    
    switch (formData.roomType) {
      case 'single': return t('calculator.singleRoom');
      case 'double': return t('calculator.doubleRoom');
      case 'triple': return t('calculator.tripleRoom');
      default: return formData.roomType;
    }
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.summary.yourTour')}
      </h2>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 h-5 w-5 text-primary" />
              {t('calculator.summary.tourDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tour ? (
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{tour.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tour.location}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {t('calculator.summary.dateRange')}
                    </div>
                    <p>{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      {t('calculator.summary.participants')}
                    </div>
                    <p>{formData.participants} {formData.participants === 1 ? 'person' : 'people'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {t('calculator.summary.duration')}
                    </div>
                    <p>{calculateDuration()} {calculateDuration() === 1 ? t('calculator.summary.days').slice(0, -1) : t('calculator.summary.days')}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Selected Options</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{vehicle?.name || 'No vehicle selected'}</span>
                      </li>
                      
                      <li className="flex items-center">
                        <HotelIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {hotel 
                            ? `${hotel.name} (${getRoomTypeLabel()})` 
                            : 'No hotel selected'}
                        </span>
                      </li>
                      
                      <li className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {guide 
                            ? `${guide.name} (${guide.languages.join(', ')})` 
                            : 'No guide selected'}
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Inclusions</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        {formData.includeBreakfast 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>Breakfast</span>
                      </li>
                      
                      <li className="flex items-center">
                        {formData.includeLunch 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>Lunch</span>
                      </li>
                      
                      <li className="flex items-center">
                        {formData.includeDinner 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>Dinner</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {calculation ? (
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
              <CardDescription>
                Total cost for your customized tour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('calculator.summary.tourCost')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.baseCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('calculator.summary.vehicleCost')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.vehicleCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('calculator.summary.driverCost')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.driverCost)}</TableCell>
                  </TableRow>
                  {calculation.costs.hotelCost > 0 && (
                    <TableRow>
                      <TableCell>{t('calculator.summary.accommodationCost')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculation.costs.hotelCost)}</TableCell>
                    </TableRow>
                  )}
                  {calculation.costs.mealsCost > 0 && (
                    <TableRow>
                      <TableCell>{t('calculator.summary.mealsCost')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculation.costs.mealsCost)}</TableCell>
                    </TableRow>
                  )}
                  {calculation.costs.guideCost > 0 && (
                    <TableRow>
                      <TableCell>{t('calculator.summary.guideCost')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculation.costs.guideCost)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell>{t('calculator.summary.subtotal')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {t('calculator.summary.serviceFee', { rate: profitMargin })}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.profitAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {t('calculator.summary.tax', { rate: taxRate })}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(calculation.costs.taxAmount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold">{t('calculator.summary.totalPrice')}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(calculation.totalInRequestedCurrency)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
            <CardFooter className="bg-muted/30 flex flex-col items-start text-sm text-muted-foreground">
              <p>{t('calculator.summary.includesTax')}</p>
              <p className="mt-1">
                {calculation.calculationDetails.season && (
                  <>
                    Season: {calculation.calculationDetails.season.name} 
                    (Price multiplier: {calculation.calculationDetails.season.multiplier.toFixed(2)}x)
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
              <CardDescription>
                Click "Calculate Total" to see the complete price breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  The final price will include:
                </p>
                <ul className="mt-4 text-left list-disc list-inside space-y-1">
                  <li>Tour base cost</li>
                  <li>Vehicle and driver costs</li>
                  <li>Accommodation costs (if selected)</li>
                  <li>Meal costs (if included)</li>
                  <li>Tour guide costs (if included)</li>
                  <li>Service fee and taxes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Step5Summary;
