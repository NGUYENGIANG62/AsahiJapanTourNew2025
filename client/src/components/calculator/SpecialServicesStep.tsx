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
          <CardTitle>{t('Dịch vụ đặc biệt (tùy chọn)')}</CardTitle>
          <CardDescription>
            {t('Chọn các dịch vụ đặc biệt bạn muốn thêm vào tour của mình. Chi phí cho các dịch vụ này không bao gồm trong báo giá và sẽ được thông báo riêng.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2 text-destructive">Lưu ý quan trọng:</p>
              <p className="text-sm">
                Tất cả các dịch vụ dưới đây <span className="font-bold">không bao gồm trong báo giá tour</span>. 
                Công ty sẽ liên hệ trực tiếp để tư vấn và báo giá cho các dịch vụ bổ sung này.
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
                <Label htmlFor="geishaShow">Show Geisha</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="kimonoExperience"
                  checked={specialServices.kimonoExperience}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('kimonoExperience', Boolean(checked))
                  }
                />
                <Label htmlFor="kimonoExperience">Trải nghiệm mặc Kimono</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="teaCeremony"
                  checked={specialServices.teaCeremony}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('teaCeremony', Boolean(checked))
                  }
                />
                <Label htmlFor="teaCeremony">Trà đạo truyền thống</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="wagyuDinner"
                  checked={specialServices.wagyuDinner}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('wagyuDinner', Boolean(checked))
                  }
                />
                <Label htmlFor="wagyuDinner">Ăn tối với bò Wagyu</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="sumoShow"
                  checked={specialServices.sumoShow}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('sumoShow', Boolean(checked))
                  }
                />
                <Label htmlFor="sumoShow">Xem đấu Sumo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="disneylandTickets"
                  checked={specialServices.disneylandTickets}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('disneylandTickets', Boolean(checked))
                  }
                />
                <Label htmlFor="disneylandTickets">Vé Disneyland</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="universalStudioTickets"
                  checked={specialServices.universalStudioTickets}
                  onCheckedChange={(checked) => 
                    handleSpecialServiceChange('universalStudioTickets', Boolean(checked))
                  }
                />
                <Label htmlFor="universalStudioTickets">Vé Universal Studio</Label>
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
                  <Plane className="h-4 w-4 mr-1" /> Dịch vụ đưa đón sân bay
                </Label>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Textarea 
                id="notes"
                placeholder="Thêm yêu cầu đặc biệt hoặc câu hỏi về các dịch vụ bổ sung..."
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