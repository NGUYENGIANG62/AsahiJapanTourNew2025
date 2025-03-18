import { useContext, useState, useEffect, useRef, useMemo } from 'react';
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
  Phone,
  Facebook,
  PlaneLanding,
  PlaneTakeoff
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
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAge, setCustomerAge] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showContactDirectly, setShowContactDirectly] = useState<boolean>(false);
  const preferredLocationsRef = useRef<HTMLTextAreaElement>(null);
  
  console.log("Current formData:", formData); // Debugging

  // Fetch data for the summary
  const { data: tour } = useQuery<Tour>({
    queryKey: ['/api/tours', formData.tourId],
    enabled: !!formData.tourId,
  });
  
  // Fetch vehicle data
  const { data: allVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    staleTime: 0,
    refetchOnMount: true,
  });
  
  // Get selected vehicle from all vehicles
  const vehicle = useMemo(() => {
    if (!allVehicles || !formData.vehicleId) return null;
    return allVehicles.find(v => v.id === formData.vehicleId) || null;
  }, [allVehicles, formData.vehicleId]);
  
  // Fetch hotel data
  const { data: allHotels } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
    staleTime: 0,
    refetchOnMount: true,
  });
  
  // Get selected hotel
  const hotel = useMemo(() => {
    if (!allHotels || !formData.hotelId) return null;
    return allHotels.find(h => h.id === formData.hotelId) || null;
  }, [allHotels, formData.hotelId]);
  
  // Fetch guide data
  const { data: allGuides } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
    staleTime: 0,
    refetchOnMount: true,
  });
  
  // Get selected guide
  const guide = useMemo(() => {
    if (!allGuides || !formData.guideId || !formData.includeGuide) return null;
    return allGuides.find(g => g.id === formData.guideId) || null;
  }, [allGuides, formData.guideId, formData.includeGuide]);
  
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
    
    // Ensure proper date parsing with specific format
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    // Add one day to include both start and end day in calculation
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays > 0 ? diffDays : 1; // Ensure we always have at least 1 day
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
    
    const singleRoomCount = formData.singleRoomCount || 0;
    const doubleRoomCount = formData.doubleRoomCount || 0;
    const tripleRoomCount = formData.tripleRoomCount || 0;
    
    const roomDetails = [];
    
    if (singleRoomCount > 0) {
      roomDetails.push(`${singleRoomCount} ${t('calculator.singleRoom')}`);
    }
    
    if (doubleRoomCount > 0) {
      roomDetails.push(`${doubleRoomCount} ${t('calculator.doubleRoom')}`);
    }
    
    if (tripleRoomCount > 0) {
      roomDetails.push(`${tripleRoomCount} ${t('calculator.tripleRoom')}`);
    }
    
    return roomDetails.length > 0 ? roomDetails.join(', ') : t(`calculator.${formData.roomType}Room`);
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
      
      // Add customer information
      const customerInfo = `
        Thông tin khách hàng:
        Họ tên: ${customerName || 'Không cung cấp'}
        Tuổi: ${customerAge || 'Không cung cấp'}
        Điện thoại: ${customerPhone || 'Không cung cấp'}
        Email: ${customerEmail}
      `;
      
      // Format special services for email
      let specialServicesText = '';
      if (formData.specialServices) {
        const services = [];
        if (formData.specialServices.geishaShow) services.push('Show Geisha');
        if (formData.specialServices.kimonoExperience) services.push('Trải nghiệm mặc Kimono');
        if (formData.specialServices.teaCeremony) services.push('Trà đạo truyền thống');
        if (formData.specialServices.wagyuDinner) services.push('Ăn tối với bò Wagyu');
        if (formData.specialServices.sumoShow) services.push('Xem đấu Sumo');
        if (formData.specialServices.disneylandTickets) services.push('Vé Disneyland');
        if (formData.specialServices.universalStudioTickets) services.push('Vé Universal Studio');
        if (formData.specialServices.airportTransfer) services.push('Dịch vụ đưa đón sân bay');
        
        specialServicesText = services.length > 0 
          ? `Dịch vụ đặc biệt: ${services.join(', ')}`
          : 'Dịch vụ đặc biệt: Không';
          
        if (formData.specialServices.notes) {
          specialServicesText += `\nGhi chú dịch vụ đặc biệt: ${formData.specialServices.notes}`;
        }
      }

      // Thêm phần thông tin bay
      const getFlightTimeInfo = () => {
        const arrivalInfo = (() => {
          switch(formData.arrivalTime) {
            case 'morning': return 'Sáng (trước 12h)';
            case 'afternoon': return 'Chiều (sau 12h)';
            default: return 'Chưa xác định';
          }
        })();

        const departureInfo = (() => {
          switch(formData.departureTime) {
            case 'morning': return 'Sáng (trước 12h)';
            case 'afternoon': return 'Chiều (sau 12h)';
            default: return 'Chưa xác định';
          }
        })();

        return `Thông tin chuyến bay:\n` +
          `Giờ đáp: ${arrivalInfo}\n` + 
          `Giờ khởi hành: ${departureInfo}`;
      };

      const tourDetails = `
        Tour: ${tour?.name || 'Chưa chọn'}
        Địa điểm: ${tour?.location || 'Chưa chọn'}
        Số ngày: ${calculateDuration()} ngày (${formatDate(formData.startDate)} - ${formatDate(formData.endDate)})
        Số người: ${formData.participants} người
        Phương tiện: ${vehicle ? `${formData.vehicleCount || 1}x ${vehicle.name} (${vehicle.seats} chỗ ngồi, hành lý: ${vehicle.luggageCapacity}kg)` : 'Chưa chọn'}
        Khách sạn: ${formData.hotelStars ? `${formData.hotelStars} sao (${getRoomTypeLabel()}) - ${formData.stayingNights || calculateDuration() - 1} đêm` : 'Không'}
        Hướng dẫn viên: ${guide ? `${guide.name}${guide.languages && guide.languages.length > 0 ? ` (${guide.languages.join(', ')})` : ''}${guide.experience ? `, ${guide.experience} năm kinh nghiệm` : ''}${guide.hasInternationalLicense ? ', có giấy phép HDV quốc tế' : ''}` : 'Không'}
        Bữa ăn: ${(formData.includeBreakfast ? 'Bữa sáng, ' : '') + (formData.includeLunch ? 'Bữa trưa, ' : '') + (formData.includeDinner ? 'Bữa tối' : '') || 'Không'}
        ${specialServicesText}
        
        ${getFlightTimeInfo()}
        
        Tổng chi phí: ${formatCurrency(calculation?.totalInRequestedCurrency || 0)}
        ${formData.participants > 1 ? `Chi phí mỗi người: ${formatCurrency((calculation?.totalInRequestedCurrency || 0) / formData.participants)}` : ''}
        ${preferredLocations ? `Địa điểm mong muốn: ${preferredLocations}` : ''}
      `;

      const fullMessage = customerInfo + '\n' + tourDetails;

      // Send email via the real API endpoint
      const response = await fetch('/api/send-tour-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerName || customerEmail.split('@')[0], // Use provided name or part of email
          email: customerEmail,
          phone: customerPhone,
          subject: emailSubject,
          message: fullMessage
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
      
      // Lưu thông tin yêu cầu tour vào localStorage để không mất dữ liệu
      try {
        const savedTourRequest = {
          customerName,
          customerEmail,
          tourDetails: `${tour?.name || 'Tour'} (${formatDate(formData.startDate)})`,
          timestamp: new Date().toISOString()
        };
        const savedRequests = JSON.parse(localStorage.getItem('tourRequests') || '[]');
        savedRequests.push(savedTourRequest);
        localStorage.setItem('tourRequests', JSON.stringify(savedRequests));
      } catch (err) {
        console.error('Error saving tour request to localStorage', err);
      }
      
      // Cập nhật giao diện và hiển thị thông tin liên hệ trực tiếp
      setEmailStatus('error');
      setShowContactInfo(false);
      setShowContactDirectly(true);
      
      toast({
        title: "Không thể gửi yêu cầu qua email",
        description: "Đã xảy ra lỗi khi gửi email. Thông tin liên hệ được hiển thị bên dưới.",
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
            <DialogTitle>{t('calculator.summary.sendTourRequest', 'Gửi yêu cầu tư vấn tour')}</DialogTitle>
            <DialogDescription>
              {t('calculator.summary.provideContactInfo', 'Vui lòng cung cấp thông tin để chúng tôi liên hệ với bạn')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer-name" className="text-right">
                {t('calculator.summary.fullName', 'Full Name')}
              </label>
              <input
                id="customer-name"
                type="text"
                className="col-span-3 w-full rounded-md border p-2"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer-age" className="text-right">
                {t('calculator.summary.age', 'Age')}
              </label>
              <input
                id="customer-age"
                type="number"
                className="col-span-3 w-full rounded-md border p-2"
                value={customerAge}
                onChange={(e) => setCustomerAge(e.target.value)}
                placeholder="35"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer-phone" className="text-right">
                {t('calculator.summary.phone', 'Phone')}
              </label>
              <input
                id="customer-phone"
                type="tel"
                className="col-span-3 w-full rounded-md border p-2"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0901234567"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="customer-email" className="text-right">
                {t('calculator.summary.email', 'Email')}
              </label>
              <input
                id="customer-email"
                type="email"
                className="col-span-3 w-full rounded-md border p-2"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {t('calculator.summary.tourRequestInfo', 'Tour request information will be sent to Asahi VietLife for detailed consultation')}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={sendTourRequestEmail}
              disabled={emailStatus === 'sending'}
            >
              {emailStatus === 'sending' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {emailStatus === 'sending' ? t('calculator.summary.sending', 'Đang gửi...') : t('calculator.summary.sendRequest', 'Gửi yêu cầu')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Show Direct Contact Information if there was an error sending email */}
      <Dialog open={showContactDirectly} onOpenChange={setShowContactDirectly}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{t('calculator.summary.directContactInfo', 'Thông tin liên hệ trực tiếp')}</DialogTitle>
            <DialogDescription>
              {t('calculator.summary.contactUsPrompt', 'Vui lòng liên hệ với chúng tôi qua các thông tin dưới đây để được tư vấn nhanh chóng')}
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
                    <div>asahivietlifejapantours@gmail.com</div>
                  </div>
                </li>
                <li className="flex items-start">
                  <Phone className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div>Hotline: 03-6675-4977</div>
                    <div>070-2813-6693 (Mrs. Rina - Nhật)</div>
                    <div>070-2794-4770 (Mr. Truong Giang - Việt Nam) Zalo – WhatsApp – Line</div>
                    <div>Mr. Linh - English Guide: 07091881073</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContactDirectly(false)}>
              {t('calculator.summary.understood', 'Đã hiểu')}
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
                
                {/* Thêm thông tin chuyến bay */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <PlaneLanding className="mr-2 h-4 w-4" />
                      Thời gian đáp máy bay
                    </div>
                    <p className="flex items-center text-sm">
                      {(() => {
                        switch(formData.arrivalTime) {
                          case 'morning': return 'Sáng (trước 12h)';
                          case 'afternoon': return 'Chiều (sau 12h)';
                          default: return 'Chưa xác định';
                        }
                      })()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <PlaneTakeoff className="mr-2 h-4 w-4" />
                      Thời gian khởi hành
                    </div>
                    <p className="flex items-center text-sm">
                      {(() => {
                        switch(formData.departureTime) {
                          case 'morning': return 'Sáng (trước 12h)';
                          case 'afternoon': return 'Chiều (sau 12h)';
                          default: return 'Chưa xác định';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('calculator.summary.selectedOptions', 'Selected Options')}</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Car className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          {formData.vehicleId > 0
                            ? (
                              <>
                                <div className="font-medium">
                                  {vehicle 
                                    ? `${formData.vehicleCount || 1}x ${vehicle.name}`
                                    : `Xe đã chọn (ID: ${formData.vehicleId})`}
                                </div>
                                {vehicle && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <span className="mr-2">{vehicle.seats} {t('calculator.summary.seats', 'chỗ ngồi')}</span>
                                    <span>{t('calculator.summary.luggage', 'Hành lý')}: {vehicle.luggageCapacity} kg</span>
                                    {vehicle.driverCostPerDay > 0 && <div>Chi phí tài xế: {formatCurrency(vehicle.driverCostPerDay)}/ngày</div>}
                                  </div>
                                )}
                                {formData.specialServices?.airportTransfer && (
                                  <div className="text-xs text-success font-medium mt-1">
                                    <CheckCircle2 className="inline-block mr-1 h-3 w-3" />
                                    Bao gồm dịch vụ đưa đón sân bay
                                  </div>
                                )}
                              </>
                            ) 
                            : <span className="text-amber-600">{t('calculator.summary.noVehicleSelected', 'Chưa chọn phương tiện')}</span>
                          }
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <HotelIcon className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          {hotel && hotel.name
                            ? (
                              <>
                                <div className="font-medium">{hotel.name} - {hotel.stars} {t('calculator.summary.stars', 'sao')}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <div>{getRoomTypeLabel() || t('calculator.summary.noRoomSelected', 'Không có phòng')}</div>
                                  <div>{formData.stayingNights || calculateDuration() - 1} {t('calculator.summary.nights', 'đêm')}</div>
                                  <div className="mt-1">
                                    {hotel.singleRoomPrice > 0 && <span className="mr-2">Phòng đơn: {formatCurrency(hotel.singleRoomPrice)}/đêm</span>}
                                    {hotel.doubleRoomPrice > 0 && <span className="mr-2">Phòng đôi: {formatCurrency(hotel.doubleRoomPrice)}/đêm</span>}
                                    {hotel.tripleRoomPrice > 0 && <span>Phòng ba: {formatCurrency(hotel.tripleRoomPrice)}/đêm</span>}
                                  </div>
                                  {hotel.breakfastPrice > 0 && <div>Bữa sáng: {formatCurrency(hotel.breakfastPrice)}/người</div>}
                                </div>
                              </>
                            ) 
                            : formData.hotelStars 
                              ? (
                                <>
                                  <div className="font-medium">Khách sạn {formData.hotelStars} {t('calculator.summary.stars', 'sao')}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <div>{getRoomTypeLabel() || t('calculator.summary.noRoomSelected', 'Không có phòng')}</div>
                                    <div>{formData.stayingNights || calculateDuration() - 1} {t('calculator.summary.nights', 'đêm')}</div>
                                  </div>
                                </>
                              )
                              : <span className="text-amber-600">{t('calculator.summary.noHotelSelected', 'Chưa chọn khách sạn')}</span>
                          }
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <User className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          {formData.includeGuide
                            ? (guide && guide.name)
                              ? (<>
                                <div className="flex flex-wrap">
                                  <span className="mr-1 font-medium">{guide.name}</span>
                                  {guide.languages && guide.languages.length > 0 && 
                                    <span className="text-muted-foreground">({guide.languages.join(', ')})</span>
                                  }
                                </div>
                                {(guide.experience || guide.hasInternationalLicense || guide.gender || guide.age) && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {guide.experience && <span className="mr-2">{guide.experience} năm kinh nghiệm</span>}
                                    {guide.hasInternationalLicense && <span className="mr-2">Có giấy phép HDV quốc tế</span>}
                                    {guide.gender && <span className="mr-2">{guide.gender}</span>}
                                    {guide.age && <span>{guide.age} tuổi</span>}
                                  </div>
                                )}
                                {guide.personality && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Tính cách: {guide.personality}
                                  </div>
                                )}
                              </>)
                              : <span className="text-amber-600">Đã chọn bao gồm hướng dẫn viên, nhưng chưa chọn HDV cụ thể</span>
                            : <span className="text-muted-foreground">{t('calculator.summary.noGuideSelected', 'Không bao gồm hướng dẫn viên')}</span>
                          }
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('calculator.summary.inclusions', 'Inclusions')}</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        {formData.includeBreakfast 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>{t('calculator.meals.breakfast', 'Breakfast')}</span>
                      </li>
                      
                      <li className="flex items-center">
                        {formData.includeLunch 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>{t('calculator.meals.lunch', 'Lunch')}</span>
                      </li>
                      
                      <li className="flex items-center">
                        {formData.includeDinner 
                          ? <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> 
                          : <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />}
                        <span>{t('calculator.meals.dinner', 'Dinner')}</span>
                      </li>

                      {/* Thông tin chuyến bay */}
                      <li className="mt-4">
                        <h4 className="font-medium mb-2">Thông tin chuyến bay</h4>
                        <ul className="space-y-1 pl-4">
                          <li className="flex items-center">
                            <PlaneLanding className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">Giờ đáp: {(() => {
                              switch(formData.arrivalTime) {
                                case 'morning': return 'Sáng (trước 12h)';
                                case 'afternoon': return 'Chiều (sau 12h)';
                                default: return 'Chưa xác định';
                              }
                            })()}</span>
                          </li>
                          <li className="flex items-center">
                            <PlaneTakeoff className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">Giờ khởi hành: {(() => {
                              switch(formData.departureTime) {
                                case 'morning': return 'Sáng (trước 12h)';
                                case 'afternoon': return 'Chiều (sau 12h)';
                                default: return 'Chưa xác định';
                              }
                            })()}</span>
                          </li>
                        </ul>
                      </li>
                      
                      {/* Special Services section */}
                      {formData.specialServices && (
                        <li className="mt-4">
                          <h4 className="font-medium mb-2">Dịch vụ đặc biệt</h4>
                          <ul className="space-y-1 pl-4">
                            {formData.specialServices.geishaShow && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Show Geisha</span>
                              </li>
                            )}
                            {formData.specialServices.kimonoExperience && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Trải nghiệm mặc Kimono</span>
                              </li>
                            )}
                            {formData.specialServices.teaCeremony && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Trà đạo truyền thống</span>
                              </li>
                            )}
                            {formData.specialServices.wagyuDinner && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Ăn tối với bò Wagyu</span>
                              </li>
                            )}
                            {formData.specialServices.sumoShow && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Xem đấu Sumo</span>
                              </li>
                            )}
                            {formData.specialServices.disneylandTickets && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Vé Disneyland</span>
                              </li>
                            )}
                            {formData.specialServices.universalStudioTickets && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Vé Universal Studio</span>
                              </li>
                            )}
                            {formData.specialServices.airportTransfer && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">Dịch vụ đưa đón sân bay</span>
                              </li>
                            )}
                            {formData.specialServices.notes && (
                              <li className="text-sm text-muted-foreground mt-1">
                                <strong>Ghi chú:</strong> {formData.specialServices.notes}
                              </li>
                            )}
                            {!(formData.specialServices.geishaShow || 
                               formData.specialServices.kimonoExperience || 
                               formData.specialServices.teaCeremony || 
                               formData.specialServices.wagyuDinner || 
                               formData.specialServices.sumoShow ||
                               formData.specialServices.disneylandTickets ||
                               formData.specialServices.universalStudioTickets ||
                               formData.specialServices.airportTransfer) && (
                              <li className="text-sm text-muted-foreground">
                                Không có dịch vụ đặc biệt
                              </li>
                            )}
                          </ul>
                        </li>
                      )}
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
              <CardTitle>{t('calculator.summary.priceSummary', 'Price Summary')}</CardTitle>
              <CardDescription>
                {t('calculator.summary.totalCostCustomized', 'Total cost for your customized tour')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* For admin users, show detailed breakdown */}
              {isAdmin ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('calculator.summary.item', 'Item')}</TableHead>
                      <TableHead className="text-right">{t('calculator.summary.cost', 'Cost')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{t('calculator.summary.tourCost')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(calculation.costs.baseCost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {vehicle ? `${t('calculator.summary.vehicleCost')} (${formData.vehicleCount || 1}x ${vehicle.name})` : t('calculator.summary.vehicleCost')}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(calculation.costs.vehicleCost)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {t('calculator.summary.driverCost')} {formData.vehicleCount && formData.vehicleCount > 1 ? `(${formData.vehicleCount} drivers)` : ''}
                      </TableCell>
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
                      <span className="mr-2">{t('calculator.summary.pricePerPerson', 'Giá cho mỗi người:')}</span>
                      {formatCurrency(calculation.totalInRequestedCurrency / calculation.calculationDetails.participants)}
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="p-3 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{t('calculator.summary.tourForPeople', 'Tour cho')} {calculation.calculationDetails.participants} {t('calculator.summary.people', 'người')}</span>
                        <span className="font-semibold">{formatCurrency(calculation.totalInRequestedCurrency)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        {calculation.tourDetails.durationDays} {t('calculator.summary.days', 'ngày')}, {calculation.tourDetails.name}, {calculation.tourDetails.location}
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        {t('calculator.summary.from', 'Từ')} {formatDate(formData.startDate)} {t('calculator.summary.to', 'đến')} {formatDate(formData.endDate)}
                      </div>
                      {vehicle && (
                        <div className="text-xs text-muted-foreground text-left mt-1">
                          {t('calculator.summary.transport', 'Phương tiện')}: {formData.vehicleCount || 1}x {vehicle.name} ({vehicle.seats} {t('calculator.summary.seats', 'chỗ')}, {t('calculator.summary.luggage', 'hành lý')}: {vehicle.luggageCapacity})
                        </div>
                      )}
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium text-left mb-2">{t('calculator.summary.preferredLocations', 'Địa điểm mong muốn')}</h4>
                      <textarea 
                        className="w-full border rounded-md h-20 p-2 text-sm"
                        placeholder={t('calculator.summary.preferredLocationsPlaceholder', 'Vui lòng nhập các địa điểm bạn muốn đến thăm trong chuyến tour này...')}
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
                          {t('calculator.summary.daysExceeded', 'Số ngày bạn chọn')} ({calculateDuration()} {t('calculator.summary.days', 'ngày')}) {t('calculator.summary.exceedsTourDays', 'vượt quá số ngày tiêu chuẩn của tour')} ({tour?.durationDays} {t('calculator.summary.days', 'ngày')}). 
                          {t('calculator.summary.pleaseEnterLocations', 'Vui lòng nhập địa điểm bạn muốn đến trong phần "Địa điểm mong muốn".')}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <button
                      className="mt-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                      onClick={() => setShowContactInfo(true)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t('calculator.summary.sendEmailRequest')}
                    </button>
                    
                    {/* Welcoming Message */}
                    <div className="mt-6 border rounded-md p-4 bg-muted/10 text-left">
                      <h4 className="font-medium mb-2 text-primary">{t('common.welcomeMessage')}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t('common.summaryThankYou')}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
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
                    </div>
                  </div>
                  
                  <p className="mt-4 text-muted-foreground">
                    {t('calculator.summary.includesTax')}
                  </p>
                  {calculation.calculationDetails.season && (
                    <p className="mt-2 text-muted-foreground">
                      {t('calculator.summary.season')}: {calculation.calculationDetails.season.name}
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
                    {t('calculator.summary.season')}: {calculation.calculationDetails.season.name} 
                    ({t('calculator.summary.priceMultiplier')}: {calculation.calculationDetails.season.multiplier.toFixed(2)}x)
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t('calculator.summary.priceSummary', 'Price Summary')}</CardTitle>
              <CardDescription>
                {t('calculator.summary.clickCalculate', 'Click "Calculate Total" to see the complete price breakdown')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {t('calculator.summary.finalPriceIncludes', 'The final price will include:')}
                </p>
                <ul className="mt-4 text-left list-disc list-inside space-y-1">
                  <li>{t('calculator.summary.tourBaseCost', 'Tour base cost')}</li>
                  <li>{t('calculator.summary.vehicleDriverCosts', 'Vehicle and driver costs')}</li>
                  <li>{t('calculator.summary.accommodationCosts', 'Accommodation costs (if selected)')}</li>
                  <li>{t('calculator.summary.mealCosts', 'Meal costs (if included)')}</li>
                  <li>{t('calculator.summary.guideCosts', 'Tour guide costs (if included)')}</li>
                  <li>{t('calculator.summary.serviceFeeAndTaxes', 'Service fee and taxes')}</li>
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
