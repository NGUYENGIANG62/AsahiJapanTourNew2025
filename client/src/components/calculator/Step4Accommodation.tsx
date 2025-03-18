import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Hotel, Guide, RoomType, HotelStarRating } from '@/types';
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
  LucideUtensilsCrossed,
  Plus,
  Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Step4Accommodation = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);
  
  // Initialize room counts from formData or set defaults
  const singleRoomCount = formData.singleRoomCount ?? 0;
  const doubleRoomCount = formData.doubleRoomCount ?? 0;
  const tripleRoomCount = formData.tripleRoomCount ?? 0;

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

  // Handle hotel stars change
  const handleHotelStarsChange = (value: string) => {
    if (value === "none") {
      // If no hotel is selected, reset hotel-related fields
      updateFormData({ 
        hotelId: undefined,
        hotelStars: undefined,
        roomType: undefined, 
        singleRoomCount: 0,
        doubleRoomCount: 0,
        tripleRoomCount: 0,
        includeBreakfast: false 
      });
    } else {
      // Chỉ lưu hạng sao được chọn, không cần tìm khách sạn cụ thể
      // Giá sẽ được tính trên server dựa theo cài đặt giá của từng hạng sao
      updateFormData({ 
        hotelStars: parseInt(value) as HotelStarRating,
        hotelId: undefined // Xóa tham chiếu đến khách sạn cụ thể
      });
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
  
  // Handle room quantity changes
  const handleSingleRoomChange = (value: number) => {
    updateFormData({ singleRoomCount: Math.max(0, value) });
  };
  
  const handleDoubleRoomChange = (value: number) => {
    updateFormData({ doubleRoomCount: Math.max(0, value) });
  };
  
  const handleTripleRoomChange = (value: number) => {
    updateFormData({ tripleRoomCount: Math.max(0, value) });
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
                    value={formData.hotelStars ? formData.hotelStars.toString() : "none"}
                    onValueChange={handleHotelStarsChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('calculator.selectHotelStars')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('calculator.noHotelRequired')}</SelectItem>
                      <SelectItem value="3">3 {t('calculator.stars')} {renderStars(3)}</SelectItem>
                      <SelectItem value="4">4 {t('calculator.stars')} {renderStars(4)}</SelectItem>
                      <SelectItem value="5">5 {t('calculator.stars')} {renderStars(5)}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                {formData.hotelStars && (
                  <div className="mt-4 rounded-md border p-4">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h3 className="font-medium">{formData.hotelStars}-{t('calculator.starHotel')}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="mt-1">{renderStars(formData.hotelStars)}</div>
                          <p className="mt-2">{t('calculator.hotelPrivacyNotice')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {formData.hotelStars && (
                <>
                  <div>
                    <Label className="block text-sm font-medium text-neutral mb-2">
                      {t('calculator.preferredRoomType', 'Loại phòng ưu tiên')}
                    </Label>
                    <Select 
                      value={formData.roomType || ""}
                      onValueChange={handleRoomTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">{t('calculator.singleRoom')}</SelectItem>
                        <SelectItem value="double">{t('calculator.doubleRoom')}</SelectItem>
                        <SelectItem value="triple">{t('calculator.tripleRoom')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Room Quantity Selection */}
                  <div className="mt-4 space-y-4">
                    <Label className="block text-sm font-medium text-neutral mb-2">
                      {t('calculator.roomQuantity')}
                    </Label>
                    
                    <div className="space-y-4">
                      {/* Single Room Selection */}
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <h4 className="font-medium">{t('calculator.singleRoom')}</h4>
                          <p className="text-sm text-muted-foreground">1 người</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleSingleRoomChange(singleRoomCount - 1)}
                            disabled={singleRoomCount === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{singleRoomCount}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleSingleRoomChange(singleRoomCount + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Double Room Selection */}
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <h4 className="font-medium">{t('calculator.doubleRoom')}</h4>
                          <p className="text-sm text-muted-foreground">2 người</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDoubleRoomChange(doubleRoomCount - 1)}
                            disabled={doubleRoomCount === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{doubleRoomCount}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDoubleRoomChange(doubleRoomCount + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Triple Room Selection */}
                      <div className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <h4 className="font-medium">{t('calculator.tripleRoom')}</h4>
                          <p className="text-sm text-muted-foreground">3 người</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleTripleRoomChange(tripleRoomCount - 1)}
                            disabled={tripleRoomCount === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{tripleRoomCount}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleTripleRoomChange(tripleRoomCount + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox 
                      id="breakfast" 
                      checked={formData.includeBreakfast || false} 
                      onCheckedChange={handleBreakfastChange}
                    />
                    <Label htmlFor="breakfast" className="cursor-pointer">
                      {t('calculator.includeBreakfast')}
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
                            {guide.name} {guide.languages && guide.languages.length > 0 ? 
                              `(${guide.languages.map(lang => {
                                return lang === 'english' ? t('languages.en') : 
                                       lang === 'japanese' ? t('languages.ja') :
                                       lang === 'chinese' ? t('languages.zh') :
                                       lang === 'korean' ? t('languages.ko') :
                                       lang === 'vietnamese' ? t('languages.vi') : lang
                              }).join(', ')})` 
                              : ''}
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
                      {selectedGuide.experience && selectedGuide.experience > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">{t('calculator.guide.experience')}:</span>
                          <span className="ml-2 font-medium">{selectedGuide.experience} {t('calculator.guide.years')}</span>
                        </div>
                      )}
                      
                      {selectedGuide.hasInternationalLicense !== undefined && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">{t('calculator.guide.license')}:</span>
                          <span className="ml-2 font-medium">
                            {selectedGuide.hasInternationalLicense ? 
                              t('calculator.guide.hasLicense') : 
                              t('calculator.guide.noLicense')}
                          </span>
                        </div>
                      )}
                      
                      {selectedGuide.personality && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">{t('calculator.guide.personality')}:</span>
                          <span className="ml-2 font-medium">{selectedGuide.personality}</span>
                        </div>
                      )}
                      
                      {selectedGuide.gender && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">{t('calculator.guide.gender')}:</span>
                          <span className="ml-2 font-medium">{selectedGuide.gender}</span>
                        </div>
                      )}
                      
                      {selectedGuide.age && selectedGuide.age > 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">{t('calculator.guide.age')}:</span>
                          <span className="ml-2 font-medium">{selectedGuide.age} {t('calculator.guide.yearsOld')}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('calculator.guide.description')}
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
