import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Hotel, Guide, RoomType } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Hotel as HotelIcon,
  Utensils, 
  User, 
  Languages, 
  Star,
  Coffee,
  LucideUtensilsCrossed
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Step4Accommodation = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Fetch hotels
  const { data: hotels = [], isLoading: isLoadingHotels } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
  });

  // Fetch guides
  const { data: guides = [], isLoading: isLoadingGuides } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });

  // Get selected hotel and guide
  const selectedHotel = formData.hotelId 
    ? hotels.find(hotel => hotel.id === formData.hotelId) 
    : null;
  
  const selectedGuide = formData.guideId 
    ? guides.find(guide => guide.id === formData.guideId) 
    : null;

  // Handle hotel change
  const handleHotelChange = (value: string) => {
    if (value === "none") {
      // If no hotel is selected, reset hotel-related fields
      updateFormData({ 
        hotelId: undefined, 
        roomType: undefined, 
        includeBreakfast: false 
      });
    } else {
      updateFormData({ hotelId: parseInt(value) });
    }
  };

  // Handle room type change
  const handleRoomTypeChange = (value: string) => {
    updateFormData({ roomType: value as RoomType });
  };

  // Handle breakfast checkbox
  const handleBreakfastChange = (checked: boolean) => {
    updateFormData({ includeBreakfast: checked });
  };

  // Handle meal selections
  const handleLunchChange = (checked: boolean) => {
    updateFormData({ includeLunch: checked });
  };

  const handleDinnerChange = (checked: boolean) => {
    updateFormData({ includeDinner: checked });
  };

  // Handle guide selection
  const handleIncludeGuideChange = (checked: boolean) => {
    updateFormData({ includeGuide: checked });
    if (!checked) {
      updateFormData({ guideId: undefined });
    }
  };

  const handleGuideChange = (value: string) => {
    updateFormData({ guideId: parseInt(value) });
  };

  // Render stars
  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 inline" />);
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.steps.accommodation')}
      </h2>
      
      <Tabs defaultValue="hotel" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="hotel">
            <HotelIcon className="h-4 w-4 mr-2" />
            {t('calculator.hotelSelection')}
          </TabsTrigger>
          <TabsTrigger value="meals">
            <Utensils className="h-4 w-4 mr-2" />
            {t('calculator.mealSelection')}
          </TabsTrigger>
          <TabsTrigger value="guide">
            <User className="h-4 w-4 mr-2" />
            {t('calculator.guideSelection')}
          </TabsTrigger>
        </TabsList>
        
        {/* Hotel Selection Tab */}
        <TabsContent value="hotel">
          <Card>
            <CardHeader>
              <CardTitle>{t('calculator.hotelSelection')}</CardTitle>
              <CardDescription>
                Select your accommodation type and options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="block text-sm font-medium text-neutral mb-2">
                  {t('calculator.selectHotel')}
                </Label>
                
                {isLoadingHotels ? (
                  <Skeleton className="w-full h-10" />
                ) : (
                  <Select 
                    value={formData.hotelId ? formData.hotelId.toString() : "none"}
                    onValueChange={handleHotelChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No hotel required</SelectItem>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                          {hotel.name} ({renderStars(hotel.stars)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {selectedHotel && (
                  <div className="mt-4 rounded-md border p-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="font-medium">{selectedHotel.name}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>{selectedHotel.location}</div>
                          <div className="mt-1">{renderStars(selectedHotel.stars)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {formData.hotelId && (
                <>
                  <div>
                    <Label className="block text-sm font-medium text-neutral mb-2">
                      {t('calculator.roomType')}
                    </Label>
                    <Select 
                      value={formData.roomType || ""}
                      onValueChange={handleRoomTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t('calculator.singleRoom')} ({selectedHotel?.singleRoomPrice.toLocaleString()} JPY)</SelectItem>
                        <SelectItem value="double">{t('calculator.doubleRoom')} ({selectedHotel?.doubleRoomPrice.toLocaleString()} JPY)</SelectItem>
                        <SelectItem value="triple">{t('calculator.tripleRoom')} ({selectedHotel?.tripleRoomPrice.toLocaleString()} JPY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="breakfast" 
                      checked={formData.includeBreakfast || false} 
                      onCheckedChange={handleBreakfastChange}
                    />
                    <Label htmlFor="breakfast" className="cursor-pointer">
                      {t('calculator.includeBreakfast')} ({selectedHotel?.breakfastPrice.toLocaleString()} JPY per person)
                    </Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Meals Selection Tab */}
        <TabsContent value="meals">
          <Card>
            <CardHeader>
              <CardTitle>{t('calculator.mealSelection')}</CardTitle>
              <CardDescription>
                Select which meals to include in your tour package
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lunch" 
                  checked={formData.includeLunch || false} 
                  onCheckedChange={handleLunchChange}
                />
                <div className="grid gap-1">
                  <Label htmlFor="lunch" className="cursor-pointer flex items-center">
                    <LucideUtensilsCrossed className="mr-2 h-4 w-4" />
                    {t('calculator.includeLunch')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Lunch will be arranged at selected restaurants during the tour.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dinner" 
                  checked={formData.includeDinner || false} 
                  onCheckedChange={handleDinnerChange}
                />
                <div className="grid gap-1">
                  <Label htmlFor="dinner" className="cursor-pointer flex items-center">
                    <Utensils className="mr-2 h-4 w-4" />
                    {t('calculator.includeDinner')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Dinner will be arranged at selected restaurants during the tour.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Guide Selection Tab */}
        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>{t('calculator.guideSelection')}</CardTitle>
              <CardDescription>
                Choose if you want a tour guide to accompany your group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-guide" 
                  checked={formData.includeGuide || false} 
                  onCheckedChange={handleIncludeGuideChange}
                />
                <Label htmlFor="include-guide" className="cursor-pointer">
                  {t('calculator.includeGuide')}
                </Label>
              </div>
              
              {formData.includeGuide && (
                <div className="mt-4">
                  <Label className="block text-sm font-medium text-neutral mb-2">
                    {t('calculator.selectGuide')}
                  </Label>
                  
                  {isLoadingGuides ? (
                    <Skeleton className="w-full h-10" />
                  ) : (
                    <Select 
                      value={formData.guideId ? formData.guideId.toString() : ""}
                      onValueChange={handleGuideChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a guide" />
                      </SelectTrigger>
                      <SelectContent>
                        {guides.map((guide) => (
                          <SelectItem key={guide.id} value={guide.id.toString()}>
                            {guide.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  
                  {selectedGuide && (
                    <div className="mt-4 rounded-md border p-4">
                      <h3 className="font-medium">{selectedGuide.name}</h3>
                      <div className="flex items-center mt-2">
                        <Languages className="h-4 w-4 mr-2 text-secondary" />
                        <div className="flex flex-wrap gap-1">
                          {selectedGuide.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang === 'english' ? t('languages.en') : 
                               lang === 'japanese' ? t('languages.ja') :
                               lang === 'chinese' ? t('languages.zh') :
                               lang === 'korean' ? t('languages.ko') :
                               lang === 'vietnamese' ? t('languages.vi') : lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Price per day:</span>
                        <span className="ml-2 font-medium">{selectedGuide.pricePerDay.toLocaleString()} JPY</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        The guide will accompany your group throughout the tour, helping with translations,
                        cultural context, and local information.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Step4Accommodation;
