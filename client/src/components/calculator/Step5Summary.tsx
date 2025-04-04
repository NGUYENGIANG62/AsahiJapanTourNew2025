import { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tour, Vehicle, Hotel, Guide, Season } from '@/types';
import CurrencySelector from './CurrencySelector';
import PaymentInformation from './PaymentInformation';
import ContactInfo from './ContactInfo';
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
  AlertDescription,
  AlertTitle
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
    queryFn: async () => {
      const response = await fetch(`/api/tours/${formData.tourId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch tour');
      return response.json();
    },
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
    
    // Always count full days, regardless of whether guests arrive in the morning or afternoon, they still use the service for the entire day 
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
  
  // No longer converting currency, only using Japanese Yen (JPY)
  const convertCost = (amountInJPY: number): number => {
    // Always return the original amount in Japanese Yen
    return amountInJPY;
  };
  
  // Format currency - now only using JPY
  const formatCurrency = (amount: number) => {
    // Round the number before display
    const roundedAmount = Math.round(amount);
    // Only display in Japanese Yen (JPY) format
    return `¥${Math.round(roundedAmount).toLocaleString()}`;
  };
  
  // Get calculated amount from calculation result
  const getTotalAmount = () => {
    if (calculation) {
      // Always use the original total cost in JPY
      return calculation.costs.totalAmount;
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
        title: t('calculator.summary.emailRequired', 'Please enter your email'),
        description: t('calculator.summary.emailRequiredDesc', 'We need your email to send you the details'),
        variant: "destructive"
      });
      return;
    }

    setEmailStatus('sending');

    try {
      // Prepare the email content
      const emailSubject = `Tour Request: ${tour?.name || 'New Tour'} - ${formatDate(formData.startDate)}`;
      
      // Add customer information
      const customerInfo = `
        Customer Information:
        Name: ${customerName || 'Not provided'}
        Age: ${customerAge || 'Not provided'}
        Phone: ${customerPhone || 'Not provided'}
        Email: ${customerEmail}
      `;
      
      // Format special services for email
      let specialServicesText = '';
      if (formData.specialServices) {
        const services = [];
        if (formData.specialServices.geishaShow) services.push('Geisha Show');
        if (formData.specialServices.kimonoExperience) services.push('Kimono Experience');
        if (formData.specialServices.teaCeremony) services.push('Tea Ceremony');
        if (formData.specialServices.wagyuDinner) services.push('Wagyu Dinner');
        if (formData.specialServices.sumoShow) services.push('Sumo Show');
        if (formData.specialServices.disneylandTickets) services.push('Disneyland Tickets');
        if (formData.specialServices.universalStudioTickets) services.push('Universal Studio Tickets');
        if (formData.specialServices.airportTransfer) services.push('Airport Transfer');
        
        specialServicesText = services.length > 0 
          ? `Special Services: ${services.join(', ')}`
          : 'Special Services: None';
          
        if (formData.specialServices.notes) {
          specialServicesText += `\nSpecial Service Notes: ${formData.specialServices.notes}`;
        }
      }

      // Add flight information section
      const getFlightTimeInfo = () => {
        const arrivalInfo = (() => {
          switch(formData.arrivalTime) {
            case 'morning': return t('calculator.flightTime.morning', 'Morning (before 12PM)');
            case 'afternoon': return t('calculator.flightTime.afternoon', 'Afternoon (after 12PM)');
            default: return t('calculator.flightTime.undefined', 'Not specified');
          }
        })();

        const departureInfo = (() => {
          switch(formData.departureTime) {
            case 'morning': return t('calculator.flightTime.morning', 'Morning (before 12PM)');
            case 'afternoon': return t('calculator.flightTime.afternoon', 'Afternoon (after 12PM)');
            default: return t('calculator.flightTime.undefined', 'Not specified');
          }
        })();

        return `${t('calculator.summary.flightInfo', 'Flight Information')}:\n` +
          `${t('calculator.summary.arrivalTimeDetail', 'Arrival Time')}: ${arrivalInfo}\n` + 
          `${t('calculator.summary.departureTimeDetail', 'Departure Time')}: ${departureInfo}`;
      };

      const tourDetails = `
        ${t('calculator.summary.tourName', 'Tour')}: ${tour?.name || t('calculator.summary.notSelected', 'Not selected')}
        ${t('calculator.summary.location', 'Location')}: ${tour?.location || t('calculator.summary.notSelected', 'Not selected')}
        ${t('calculator.summary.numDays', 'Number of days')}: ${calculateDuration()} ${t('calculator.summary.days', 'days')} (${formatDate(formData.startDate)} - ${formatDate(formData.endDate)})
        ${t('calculator.summary.numPeople', 'Number of people')}: ${formData.participants} ${t('calculator.summary.people', 'people')}
        ${t('calculator.summary.transport', 'Transport')}: ${vehicle ? `${formData.vehicleCount || 1}x ${vehicle.name} (${vehicle.seats} ${t('calculator.summary.seats', 'seats')}, ${t('calculator.summary.luggage', 'luggage')}: ${vehicle.luggageCapacity} ${t('calculator.summary.pieces', 'pieces')})` : t('calculator.summary.notSelected', 'Not selected')}
        ${t('calculator.summary.hotel', 'Hotel')}: ${formData.hotelStars ? `${formData.hotelStars} ${t('calculator.summary.stars', 'stars')} (${getRoomTypeLabel()}) - ${formData.stayingNights || calculateDuration() - 1} ${t('calculator.summary.nights', 'nights')}` : t('calculator.summary.none', 'None')}
        ${t('calculator.summary.guide', 'Guide')}: ${guide ? `${guide.name}${guide.languages && guide.languages.length > 0 ? ` (${guide.languages.join(', ')})` : ''}${guide.experience ? `, ${guide.experience} ${t('calculator.summary.yearsExperience', 'years experience')}` : ''}${guide.hasInternationalLicense ? `, ${t('calculator.summary.hasInternationalLicense', 'has international license')}` : ''}` : t('calculator.summary.none', 'None')}
        ${t('calculator.summary.meals', 'Meals')}: ${(formData.includeBreakfast ? `${t('calculator.meals.breakfast', 'Breakfast')}, ` : '') + (formData.includeLunch ? `${t('calculator.meals.lunch', 'Lunch')}, ` : '') + (formData.includeDinner ? t('calculator.meals.dinner', 'Dinner') : '') || t('calculator.summary.none', 'None')}
        ${specialServicesText}
        
        ${getFlightTimeInfo()}
        
        ${t('calculator.summary.totalPrice', 'Total price')}: ${formatCurrency(calculation?.costs.totalAmount || 0)}
        ${formData.participants > 1 ? `${t('calculator.summary.pricePerPerson', 'Price per person')}: ${formatCurrency((calculation?.costs.totalAmount || 0) / formData.participants)}` : ''}
        ${preferredLocations ? `${t('calculator.summary.preferredLocations', 'Preferred locations')}: ${preferredLocations}` : ''}
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
          title: t('calculator.summary.requestRecorded', 'Your request has been recorded'),
          description: result.message || t('calculator.summary.requestRecordedDesc', 'Your tour information has been saved. We will contact you as soon as possible.'),
        });
      } else {
        throw new Error(result.message || t('calculator.summary.undefinedError', 'Undefined error'));
      }
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Save tour request information to localStorage to prevent data loss
      try {
        const savedTourRequest = {
          customerName,
          customerEmail,
          customerPhone,
          tourDetails: `${tour?.name || 'Tour'} (${formatDate(formData.startDate)})`,
          timestamp: new Date().toISOString()
        };
        const savedRequests = JSON.parse(localStorage.getItem('tourRequests') || '[]');
        savedRequests.push(savedTourRequest);
        localStorage.setItem('tourRequests', JSON.stringify(savedRequests));
      } catch (err) {
        console.error('Error saving tour request to localStorage', err);
      }
      
      // Update UI and display direct contact information
      setEmailStatus('error');
      setShowContactInfo(false);
      setShowContactDirectly(true);
      
      toast({
        title: t('calculator.summary.emailError', 'Unable to send email request'),
        description: t('calculator.summary.emailErrorDesc', 'An error occurred when sending the email. Contact information is displayed below.'),
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
            <DialogTitle>{t('calculator.summary.sendTourRequest', 'Send Tour Request')}</DialogTitle>
            <DialogDescription>
              {t('calculator.summary.provideContactInfo', 'Please provide your information so we can contact you')}
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
              {emailStatus === 'sending' ? t('calculator.summary.sending', 'Sending...') : t('calculator.summary.sendRequest', 'Send Request')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Show Direct Contact Information if there was an error sending email */}
      <Dialog open={showContactDirectly} onOpenChange={setShowContactDirectly}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{t('calculator.summary.directContactInfo', 'Direct Contact Information')}</DialogTitle>
            <DialogDescription>
              {t('calculator.summary.contactUsPrompt', 'Please contact us directly through the information below for quick consultation')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <ContactInfo showQR={true} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowContactDirectly(false)}>
              {t('calculator.summary.understood', 'Understood')}
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
                
                {/* Flight information section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <PlaneLanding className="mr-2 h-4 w-4" />
                      {t('calculator.summary.arrivalTime', 'Arrival Time')}
                    </div>
                    <p className="flex items-center text-sm">
                      {(() => {
                        switch(formData.arrivalTime) {
                          case 'morning': return t('calculator.flightTime.morning', 'Morning (before 12PM)');
                          case 'afternoon': return t('calculator.flightTime.afternoon', 'Afternoon (after 12PM)');
                          default: return t('calculator.flightTime.undefined', 'Not specified');
                        }
                      })()}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <PlaneTakeoff className="mr-2 h-4 w-4" />
                      {t('calculator.summary.departureTime', 'Departure Time')}
                    </div>
                    <p className="flex items-center text-sm">
                      {(() => {
                        switch(formData.departureTime) {
                          case 'morning': return t('calculator.flightTime.morning', 'Morning (before 12PM)');
                          case 'afternoon': return t('calculator.flightTime.afternoon', 'Afternoon (after 12PM)');
                          default: return t('calculator.flightTime.undefined', 'Not specified');
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
                                    : `${t('calculator.summary.selectedVehicle', 'Selected vehicle')} (ID: ${formData.vehicleId})`}
                                </div>
                                {vehicle && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <span className="mr-2">{vehicle.seats} {t('calculator.summary.seats', 'seats')}</span>
                                    <span>{t('calculator.summary.luggage', 'Luggage')}: {vehicle.luggageCapacity} {t('calculator.summary.pieces', 'pieces')}</span>
                                    {vehicle.driverCostPerDay > 0 && <div>{t('calculator.summary.driverCost', 'Driver cost')}: {formatCurrency(vehicle.driverCostPerDay)}/{t('calculator.summary.perDay', 'per day')}</div>}
                                  </div>
                                )}
                                {formData.specialServices?.airportTransfer && (
                                  <div className="text-xs text-success font-medium mt-1">
                                    <CheckCircle2 className="inline-block mr-1 h-3 w-3" />
                                    {t('calculator.specialServices.includedAirportTransfer', 'Includes airport transfer service')}
                                  </div>
                                )}
                              </>
                            ) 
                            : <span className="text-amber-600">{t('calculator.summary.noVehicleSelected', 'No vehicle selected')}</span>
                          }
                        </div>
                      </li>
                      
                      <li className="flex items-start">
                        <HotelIcon className="mr-2 h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          {hotel && hotel.name
                            ? (
                              <>
                                <div className="font-medium">{hotel.name} - {hotel.stars} {t('calculator.summary.stars', 'stars')}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  <div>{getRoomTypeLabel() || t('calculator.summary.noRoomSelected', 'No room selected')}</div>
                                  <div>{formData.stayingNights || calculateDuration() - 1} {t('calculator.summary.nights', 'nights')}</div>
                                  <div className="mt-1">
                                    {hotel.singleRoomPrice > 0 && <span className="mr-2">{t('calculator.summary.singleRoom', 'Single room')}: {formatCurrency(hotel.singleRoomPrice)}/{t('calculator.summary.perNight', 'per night')}</span>}
                                    {hotel.doubleRoomPrice > 0 && <span className="mr-2">{t('calculator.summary.doubleRoom', 'Double room')}: {formatCurrency(hotel.doubleRoomPrice)}/{t('calculator.summary.perNight', 'per night')}</span>}
                                    {hotel.tripleRoomPrice > 0 && <span>{t('calculator.summary.tripleRoom', 'Triple room')}: {formatCurrency(hotel.tripleRoomPrice)}/{t('calculator.summary.perNight', 'per night')}</span>}
                                  </div>
                                  {hotel.breakfastPrice > 0 && <div>{t('calculator.summary.breakfast', 'Breakfast')}: {formatCurrency(hotel.breakfastPrice)}/{t('calculator.summary.perPerson', 'per person')}</div>}
                                </div>
                              </>
                            ) 
                            : formData.hotelStars 
                              ? (
                                <>
                                  <div className="font-medium">{t('calculator.summary.hotel', 'Hotel')} {formData.hotelStars} {t('calculator.summary.stars', 'stars')}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    <div>{getRoomTypeLabel() || t('calculator.summary.noRoomSelected', 'No room selected')}</div>
                                    <div>{formData.stayingNights || calculateDuration() - 1} {t('calculator.summary.nights', 'nights')}</div>
                                  </div>
                                </>
                              )
                              : <span className="text-amber-600">{t('calculator.summary.noHotelSelected', 'No hotel selected')}</span>
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
                                    {guide.experience && <span className="mr-2">{guide.experience} {t('calculator.summary.yearsExperience', 'years experience')}</span>}
                                    {guide.hasInternationalLicense && <span className="mr-2">{t('calculator.summary.hasInternationalLicense', 'Has international license')}</span>}
                                    {guide.gender && <span className="mr-2">{guide.gender}</span>}
                                    {guide.age && <span>{guide.age} {t('calculator.summary.yearsOld', 'years old')}</span>}
                                  </div>
                                )}
                                {guide.personality && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {t('calculator.summary.personality', 'Personality')}: {guide.personality}
                                  </div>
                                )}
                              </>)
                              : <span className="text-amber-600">{t('calculator.summary.guideSelectedButNotSpecific', 'Guide service included, but no specific guide selected')}</span>
                            : <span className="text-muted-foreground">{t('calculator.summary.noGuideSelected', 'No guide included')}</span>
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

                      {/* Flight information details */}
                      <li className="mt-4">
                        <h4 className="font-medium mb-2">{t('calculator.summary.flightInfo', 'Flight Information')}</h4>
                        <ul className="space-y-1 pl-4">
                          <li className="flex items-center">
                            <PlaneLanding className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{t('calculator.summary.arrivalTimeDetail', 'Arrival Time')}: {(() => {
                              switch(formData.arrivalTime) {
                                case 'morning': return t('calculator.summary.morningTime', 'Morning (before 12PM)');
                                case 'afternoon': return t('calculator.summary.afternoonTime', 'Afternoon (after 12PM)');
                                default: return t('calculator.summary.undefinedTime', 'Not specified');
                              }
                            })()}</span>
                          </li>
                          <li className="flex items-center">
                            <PlaneTakeoff className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{t('calculator.summary.departureTimeDetail', 'Departure Time')}: {(() => {
                              switch(formData.departureTime) {
                                case 'morning': return t('calculator.summary.morningTime', 'Morning (before 12PM)');
                                case 'afternoon': return t('calculator.summary.afternoonTime', 'Afternoon (after 12PM)');
                                default: return t('calculator.summary.undefinedTime', 'Not specified');
                              }
                            })()}</span>
                          </li>
                        </ul>
                      </li>
                      
                      {/* Special Services section */}
                      {formData.specialServices && (
                        <li className="mt-4">
                          <h4 className="font-medium mb-2">{t('calculator.summary.specialServices', 'Special Services')}</h4>
                          <ul className="space-y-1 pl-4">
                            {formData.specialServices.geishaShow && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.geishaShow', 'Geisha Show')}</span>
                              </li>
                            )}
                            {formData.specialServices.kimonoExperience && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.kimonoExperience', 'Kimono Experience')}</span>
                              </li>
                            )}
                            {formData.specialServices.teaCeremony && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.teaCeremony', 'Traditional Tea Ceremony')}</span>
                              </li>
                            )}
                            {formData.specialServices.wagyuDinner && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.wagyuDinner', 'Wagyu Beef Dinner')}</span>
                              </li>
                            )}
                            {formData.specialServices.sumoShow && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.sumoShow', 'Sumo Wrestling Show')}</span>
                              </li>
                            )}
                            {formData.specialServices.disneylandTickets && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.disneylandTickets', 'Disneyland Tickets')}</span>
                              </li>
                            )}
                            {formData.specialServices.universalStudioTickets && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.universalStudioTickets', 'Universal Studio Tickets')}</span>
                              </li>
                            )}
                            {formData.specialServices.airportTransfer && (
                              <li className="flex items-center">
                                <CheckCircle2 className="mr-2 h-3 w-3 text-success" />
                                <span className="text-sm">{t('calculator.specialServices.airportTransfer', 'Airport Transfer Service')}</span>
                              </li>
                            )}
                            {formData.specialServices.notes && (
                              <li className="text-sm text-muted-foreground mt-1">
                                <strong>{t('calculator.specialServices.notes', 'Notes')}:</strong> {formData.specialServices.notes}
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
                                {t('calculator.summary.noSpecialServices', 'No special services')}
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
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.baseCost))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {vehicle ? `${t('calculator.summary.vehicleCost')} (${formData.vehicleCount || 1}x ${vehicle.name})` : t('calculator.summary.vehicleCost')}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.vehicleCost))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {t('calculator.summary.driverCost')} {formData.vehicleCount && formData.vehicleCount > 1 ? `(${formData.vehicleCount} drivers)` : ''}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.driverCost))}</TableCell>
                    </TableRow>
                    {calculation.costs.hotelCost > 0 && (
                      <TableRow>
                        <TableCell>{t('calculator.summary.accommodationCost')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.hotelCost))}</TableCell>
                      </TableRow>
                    )}
                    {calculation.costs.mealsCost > 0 && (
                      <TableRow>
                        <TableCell>{t('calculator.summary.mealsCost')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.mealsCost))}</TableCell>
                      </TableRow>
                    )}
                    {calculation.costs.guideCost > 0 && (
                      <TableRow>
                        <TableCell>{t('calculator.summary.guideCost')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.guideCost))}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>{t('calculator.summary.subtotal')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.subtotal))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {t('calculator.summary.serviceFee', { rate: profitMargin })}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.profitAmount))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        {t('calculator.summary.tax', { rate: taxRate })}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(convertCost(calculation.costs.taxAmount))}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-bold">{t('calculator.summary.totalPrice')}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(calculation.costs.totalAmount)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              ) : (
                /* For regular users, only show the final price */
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">{t('calculator.summary.totalPrice')}</h3>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(calculation.costs.totalAmount)}
                  </div>
                  
                  {calculation.calculationDetails.participants > 1 && (
                    <div className="mt-3 text-lg font-semibold">
                      <span className="mr-2">{t('calculator.summary.pricePerPerson', 'Price per person:')}</span>
                      {formatCurrency(calculation.costs.totalAmount / calculation.calculationDetails.participants)}
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="p-3 border rounded-md bg-muted/20">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{t('calculator.summary.tourForPeople', 'Tour for')} {calculation.calculationDetails.participants} {t('calculator.summary.people', 'people')}</span>
                        <span className="font-semibold">{formatCurrency(calculation.costs.totalAmount)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        {calculation.tourDetails.durationDays} {t('calculator.summary.days', 'days')}, {calculation.tourDetails.name}, {calculation.tourDetails.location}
                      </div>
                      <div className="text-xs text-muted-foreground text-left mt-1">
                        {t('calculator.summary.from', 'From')} {formatDate(formData.startDate)} {t('calculator.summary.to', 'to')} {formatDate(formData.endDate)}
                      </div>
                      {vehicle && (
                        <div className="text-xs text-muted-foreground text-left mt-1">
                          {t('calculator.summary.transport', 'Transport')}: {formData.vehicleCount || 1}x {vehicle.name} ({vehicle.seats} {t('calculator.summary.seats', 'seats')}, {t('calculator.summary.luggage', 'luggage')}: {vehicle.luggageCapacity} {t('calculator.summary.pieces', 'pieces')})
                        </div>
                      )}
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium text-left mb-2">{t('calculator.summary.preferredLocations', 'Preferred Locations')}</h4>
                      <textarea 
                        className="w-full border rounded-md h-20 p-2 text-sm"
                        placeholder={t('calculator.summary.preferredLocationsPlaceholder', 'Please enter the locations you would like to visit during this tour...')}
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
                          {t('calculator.summary.daysExceeded', 'The number of days you selected')} ({calculateDuration()} {t('calculator.summary.days', 'days')}) {t('calculator.summary.exceedsTourDays', 'exceeds the standard duration of the tour')} ({tour?.durationDays} {t('calculator.summary.days', 'days')}). 
                          {t('calculator.summary.pleaseEnterLocations', 'Please enter the locations you would like to visit in the "Preferred Locations" section.')}
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
                  <Alert className="mt-3 bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800 font-medium">
                      {t('calculator.payment.paymentNotice', 'Payment Notice')}
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      {t('calculator.payment.pleaseFollowInstructions', 'Please make payment according to AsahiVietLife instructions.')} 
                      {t('calculator.payment.contactDetailsEmail', 'For details, contact via email:')} asahivietlifejapantours@gmail.com
                    </AlertDescription>
                  </Alert>
                  
                  {/* Payment information with QR code */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">{t('calculator.payment.transferInformation', 'Transfer Information')}</h4>
                    <PaymentInformation 
                      formatCurrency={formatCurrency}
                      totalAmount={calculation.costs.totalAmount} 
                      participants={formData.participants} 
                      currency={'JPY'} 
                      showQR={true} 
                    />
                  </div>
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
