import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Plane } from 'lucide-react';
import { SpecialService } from '@/types';

const SpecialServicesStep = () => {
  const { t } = useTranslation();
  const { formData, updateFormData, nextStep, prevStep } = useContext(CalculatorContext);
  
  const specialServices = formData.specialServices || {
    geishaShow: false,
    kimonoExperience: false,
    teaCeremony: false,
    wagyuDinner: false,
    sumoShow: false,
    disneylandTickets: false,
    universalStudioTickets: false,
    airportTransfer: false,
    notes: '',
  };
  
  const handleSpecialServiceChange = (key: keyof SpecialService, value: boolean | string) => {
    const updatedServices = {
      ...specialServices,
      [key]: value,
    };
    
    updateFormData({
      specialServices: updatedServices,
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('calculator.specialServices.title', 'Special Services (optional)')}</CardTitle>
          <CardDescription>
            {t('calculator.specialServices.description', 'Select special services you would like to add to your tour. The cost for these services is not included in the quote and will be informed separately.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2 text-destructive">{t('calculator.specialServices.importantNote', 'Important Note')}:</p>
              <p className="text-sm">
                {t('calculator.specialServices.importantNoteText', 'All services below are not included in the tour quote. The company will contact you directly to advise and quote for these additional services.')}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="geishaShow"
                  checked={specialServices.geishaShow}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('geishaShow', Boolean(checked))
                  }
                />
                <Label htmlFor="geishaShow">{t('calculator.specialServices.geishaShow', 'Show Geisha')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="kimonoExperience"
                  checked={specialServices.kimonoExperience}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('kimonoExperience', Boolean(checked))
                  }
                />
                <Label htmlFor="kimonoExperience">{t('calculator.specialServices.kimonoExperience', 'Kimono Experience')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="teaCeremony"
                  checked={specialServices.teaCeremony}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('teaCeremony', Boolean(checked))
                  }
                />
                <Label htmlFor="teaCeremony">{t('calculator.specialServices.teaCeremony', 'Traditional Tea Ceremony')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="wagyuDinner"
                  checked={specialServices.wagyuDinner}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('wagyuDinner', Boolean(checked))
                  }
                />
                <Label htmlFor="wagyuDinner">{t('calculator.specialServices.wagyuDinner', 'Wagyu Beef Dinner')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sumoShow"
                  checked={specialServices.sumoShow}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('sumoShow', Boolean(checked))
                  }
                />
                <Label htmlFor="sumoShow">{t('calculator.specialServices.sumoShow', 'Sumo Wrestling Show')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="disneylandTickets"
                  checked={specialServices.disneylandTickets}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('disneylandTickets', Boolean(checked))
                  }
                />
                <Label htmlFor="disneylandTickets">{t('calculator.specialServices.disneylandTickets', 'Disneyland Tickets')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="universalStudioTickets"
                  checked={specialServices.universalStudioTickets}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('universalStudioTickets', Boolean(checked))
                  }
                />
                <Label htmlFor="universalStudioTickets">{t('calculator.specialServices.universalStudioTickets', 'Universal Studio Tickets')}</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="airportTransfer"
                  checked={specialServices.airportTransfer}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('airportTransfer', Boolean(checked))
                  }
                />
                <Label htmlFor="airportTransfer" className="flex items-center">
                  <Plane className="h-4 w-4 mr-1" /> {t('calculator.specialServices.airportTransfer', 'Airport Transfer Service')}
                </Label>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">{t('calculator.specialServices.notes', 'Additional Notes')}</Label>
              <Textarea 
                id="notes"
                placeholder={t('calculator.specialServices.notesPlaceholder', 'Add special requests or questions about additional services...')}
                value={specialServices.notes || ''}
                onChange={(e) => handleSpecialServiceChange('notes', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecialServicesStep;