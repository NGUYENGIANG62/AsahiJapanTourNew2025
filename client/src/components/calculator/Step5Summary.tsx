import { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  CalendarDays,
  Map,
  Users,
  Car,
  Hotel as HotelIcon,
  Utensils,
  User,
  CheckCircle2,
  XCircle,
  Mail,
  AlertCircle,
  Loader2,
  Phone
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const Step5Summary = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { 
    formData, 
    calculation,
    currency 
  } = useContext(CalculatorContext);
  const { toast } = useToast();
  const [preferredLocations, setPreferredLocations] = useState<string>('');
  const [showDurationMismatch, setShowDurationMismatch] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showContactInfo, setShowContactInfo] = useState<boolean>(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [showContactDirectly, setShowContactDirectly] = useState<boolean>(false);
  const preferredLocationsRef = useRef<HTMLTextAreaElement>(null);
  
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

  // Email submission dialog
  useEffect(() => {
    // Check if tour duration exceeds standard duration
    if (tour && calculateDuration() > tour.durationDays) {
      setShowDurationMismatch(true);
    } else {
      setShowDurationMismatch(false);
    }
  }, [tour, formData.startDate, formData.endDate]);

  // Function to send email
  const sendTourRequestEmail = async () => {
    if (!customerEmail) {
      toast({
        title: "Vui lòng nhập email của bạn",
        description: "Chúng tôi cần email của bạn để gửi thông tin chi tiết",
        variant: "destructive"
      });
      return;
    }

    setEmailStatus('sending');

    try {
      // Prepare the email content
      const emailSubject = `Yêu cầu tư vấn tour: ${tour?.name || 'Tour mới'} - ${formatDate(formData.startDate)}`;
      
      const tourDetails = `
        Tour: ${tour?.name || 'Chưa chọn'}
        Địa điểm: ${tour?.location || 'Chưa chọn'}
        Số ngày: ${calculateDuration()} ngày (${formatDate(formData.startDate)} - ${formatDate(formData.endDate)})
        Số người: ${formData.participants} người
        Phương tiện: ${vehicle?.name || 'Chưa chọn'}
        Khách sạn: ${hotel?.name || 'Không'} ${hotel ? `(${getRoomTypeLabel()})` : ''}
        Hướng dẫn viên: ${guide?.name || 'Không'}
        Bữa ăn: ${(formData.includeBreakfast ? 'Bữa sáng, ' : '') + (formData.includeLunch ? 'Bữa trưa, ' : '') + (formData.includeDinner ? 'Bữa tối' : '') || 'Không'}
        Tổng chi phí: ${formatCurrency(calculation?.totalInRequestedCurrency || 0)}
        ${formData.participants > 1 ? `Chi phí mỗi người: ${formatCurrency((calculation?.totalInRequestedCurrency || 0) / formData.participants)}` : ''}
        ${preferredLocations ? `Địa điểm mong muốn: ${preferredLocations}` : ''}
        Email khách hàng: ${customerEmail}
      `;

      // Send email via the real API endpoint
      const response = await fetch('/api/send-tour-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerEmail.split('@')[0],  // Use part of email as name if no name provided
          email: customerEmail,
          subject: emailSubject,
          message: tourDetails
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setEmailStatus('success');
        setShowContactInfo(false);
        setShowContactDirectly(true);
        toast({
          title: "Yêu cầu của bạn đã được ghi lại",
          description: result.message || "Thông tin tour của bạn đã được lưu. Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
        });
      } else {
        throw new Error(result.message || 'Lỗi không xác định');
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailStatus('error');
      setShowContactDirectly(true);
      toast({
        title: "Không thể gửi yêu cầu",
        description: "Vui lòng liên hệ trực tiếp với Asahi VietLife qua thông tin liên hệ bên dưới.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.summary.yourTour')}
      </h2>
      
      {/* Email Dialog */}
      <Dialog open={showContactInfo} onOpenChange={setShowContactInfo}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu tư vấn tour</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp email để chúng tôi liên hệ với bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer-email" className="text-right">
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                className="col-span-3 w-full rounded-md border p-2"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Thông tin yêu cầu tour sẽ được gửi đến Asahi VietLife để tư vấn chi tiết
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={sendTourRequestEmail}
              disabled={emailStatus === 'sending'}
            >
              {emailStatus === 'sending' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {emailStatus === 'sending' ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Show Direct Contact Information if there was an error sending email */}
      <Dialog open={showContactDirectly} onOpenChange={setShowContactDirectly}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Thông tin liên hệ trực tiếp</DialogTitle>
            <DialogDescription>
              Vui lòng liên hệ với chúng tôi qua các thông tin dưới đây để được tư vấn nhanh chóng
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-md p-4 bg-muted/10 text-left">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <Map className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>1-35 Adachi, Adachi-ku, Tokyo, Japan</span>
                </li>
                <li className="flex items-start">
                  <Mail className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div>hoangtucuoirong@gmail.com</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Phone className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div>Hotline: 03-6675-4977</div>
                    <div>070-2813-6693 (Mrs. Rina - Nhật)</div>
                    <div>070-2794-4770 (Mr. Truong Giang - Việt Nam) Zalo – Whatapp -Line</div>
                    <div>Mr. Linh - Hướng dẫn viên du lịch (English): 07091881073</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContactDirectly(false)}>
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                            ? `${guide.name}${guide.languages && guide.languages.length > 0 ? ` (${guide.languages.join(', ')})` : ''}` 
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
              {/* For admin users, show detailed breakdown */}
              {isAdmin ? (
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
              ) : (
                /* For regular users, only show the final price */
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">{t('calculator.summary.totalPrice')}</h3>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(calculation.totalInRequestedCurrency)}
                  </div>
                  
                  {calculation.calculationDetails.participants > 1 && (
                    <div className="mt-3 text-lg font-semibold">
                      <span className="mr-2">Giá cho mỗi người:</span>
                      {formatCurrency(calculation.totalInRequestedCurrency / calculation.calculationDetails.participants)}
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="p-3 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tour cho {calculation.calculationDetails.participants} người</span>
                        <span className="font-semibold">{formatCurrency(calculation.totalInRequestedCurrency)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        {calculation.tourDetails.durationDays} ngày, {calculation.tourDetails.name}, {calculation.tourDetails.location}
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        Từ {formatDate(formData.startDate)} đến {formatDate(formData.endDate)}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium text-left mb-2">Địa điểm mong muốn</h4>
                      <textarea 
                        className="w-full border rounded-md h-20 p-2 text-sm"
                        placeholder="Vui lòng nhập các địa điểm bạn muốn đến thăm trong chuyến tour này..."
                        id="preferred-locations"
                        ref={preferredLocationsRef}
                        onChange={(e) => setPreferredLocations(e.target.value)}
                        value={preferredLocations}
                      ></textarea>
                    </div>
                    
                    {/* Check if duration exceeds tour's standard days */}
                    {calculateDuration() > (tour?.durationDays || 0) && (
                      <Alert className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Số ngày bạn chọn ({calculateDuration()} ngày) vượt quá số ngày tiêu chuẩn của tour ({tour?.durationDays} ngày). 
                          Vui lòng nhập địa điểm bạn muốn đến trong phần "Địa điểm mong muốn".
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <button
                      className="mt-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                      onClick={() => setShowContactInfo(true)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Gửi yêu cầu tư vấn qua email
                    </button>
                    
                    {/* Company Contact Information */}
                    <div className="mt-6 border rounded-md p-4 bg-muted/10 text-left">
                      <h4 className="font-medium mb-2">Thông tin liên hệ</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Map className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>1-35 Adachi, Adachi-ku, Tokyo, Japan</span>
                        </li>
                        <li className="flex items-start">
                          <Mail className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div>hoangtucuoirong@gmail.com</div>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <Phone className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div>Hotline: 03-6675-4977</div>
                            <div>070-2813-6693 (Mrs. Rina - Nhật)</div>
                            <div>070-2794-4770 (Mr. Truong Giang - Việt Nam) Zalo – Whatapp -Line</div>
                            <div>Mr. Linh - Hướng dẫn viên du lịch (English): 07091881073</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-muted-foreground">
                    {t('calculator.summary.includesTax')}
                  </p>
                  {calculation.calculationDetails.season && (
                    <p className="mt-2 text-muted-foreground">
                      Season: {calculation.calculationDetails.season.name}
                    </p>
                  )}
                </div>
              )}
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
