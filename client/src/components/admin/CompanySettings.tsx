import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Percent, Coins } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
  suffix: string;
}

const CompanySettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<Setting[]>([
    { key: 'profit_margin', value: '', label: t('admin.profitMargin'), suffix: '%' },
    { key: 'tax_rate', value: '', label: t('admin.taxRate'), suffix: '%' },
    { key: 'meal_cost_lunch', value: '', label: t('admin.mealCostLunch'), suffix: 'JPY' },
    { key: 'meal_cost_dinner', value: '', label: t('admin.mealCostDinner'), suffix: 'JPY' },
    // Khách sạn 3 sao
    { key: 'hotel_3star_single', value: '', label: t('admin.hotel3StarSingle', 'Khách sạn 3 sao - Phòng đơn'), suffix: 'JPY' },
    { key: 'hotel_3star_double', value: '', label: t('admin.hotel3StarDouble', 'Khách sạn 3 sao - Phòng đôi'), suffix: 'JPY' },
    { key: 'hotel_3star_triple', value: '', label: t('admin.hotel3StarTriple', 'Khách sạn 3 sao - Phòng ba'), suffix: 'JPY' },
    { key: 'hotel_3star_breakfast', value: '', label: t('admin.hotel3StarBreakfast', 'Khách sạn 3 sao - Bữa sáng'), suffix: 'JPY' },
    // Khách sạn 4 sao
    { key: 'hotel_4star_single', value: '', label: t('admin.hotel4StarSingle', 'Khách sạn 4 sao - Phòng đơn'), suffix: 'JPY' },
    { key: 'hotel_4star_double', value: '', label: t('admin.hotel4StarDouble', 'Khách sạn 4 sao - Phòng đôi'), suffix: 'JPY' },
    { key: 'hotel_4star_triple', value: '', label: t('admin.hotel4StarTriple', 'Khách sạn 4 sao - Phòng ba'), suffix: 'JPY' },
    { key: 'hotel_4star_breakfast', value: '', label: t('admin.hotel4StarBreakfast', 'Khách sạn 4 sao - Bữa sáng'), suffix: 'JPY' },
    // Khách sạn 5 sao
    { key: 'hotel_5star_single', value: '', label: t('admin.hotel5StarSingle', 'Khách sạn 5 sao - Phòng đơn'), suffix: 'JPY' },
    { key: 'hotel_5star_double', value: '', label: t('admin.hotel5StarDouble', 'Khách sạn 5 sao - Phòng đôi'), suffix: 'JPY' },
    { key: 'hotel_5star_triple', value: '', label: t('admin.hotel5StarTriple', 'Khách sạn 5 sao - Phòng ba'), suffix: 'JPY' },
    { key: 'hotel_5star_breakfast', value: '', label: t('admin.hotel5StarBreakfast', 'Khách sạn 5 sao - Bữa sáng'), suffix: 'JPY' },
  ]);
  
  // Fetch settings
  const fetchSetting = async (key: string) => {
    const response = await fetch(`/api/settings/${key}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch setting: ${key}`);
    }
    
    return await response.json();
  };
  
  // Tạo các queries cho tất cả các cài đặt
  const createSettingQueries = () => {
    const settingKeys = settings.map(setting => setting.key);
    return settingKeys.map(key => {
      return useQuery({
        queryKey: [`/api/settings/${key}`],
        queryFn: () => fetchSetting(key),
      });
    });
  };
  
  const settingQueries = createSettingQueries();
  
  // Update settings when data is loaded
  useEffect(() => {
    // Xử lý các phản hồi từ các query
    settingQueries.forEach((query, index) => {
      if (query.data) {
        const settingKey = settings[index]?.key;
        if (settingKey) {
          updateSettingValue(settingKey, query.data.value);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingQueries]);
  
  // Update setting value
  const updateSettingValue = (key: string, value: string) => {
    setSettings(prevSettings => 
      prevSettings.map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    );
  };
  
  // Handle input change
  const handleInputChange = (key: string, value: string) => {
    updateSettingValue(key, value);
  };
  
  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const response = await apiRequest('PUT', `/api/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: t('common.success'),
        description: `${variables.key} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${variables.key}`] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update setting',
        variant: 'destructive',
      });
    },
  });
  
  // Handle save setting
  const handleSaveSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };
  
  // Check if any settings are loading
  const isLoading = settingQueries.some(query => query.isLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.companySettings')}</CardTitle>
        <CardDescription>
          Update company settings and pricing parameters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {settings.map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <Label htmlFor={setting.key}>
                    {setting.label} 
                    {setting.key.includes('profit') || setting.key.includes('tax') ? 
                      <Percent className="h-4 w-4 inline-block ml-1" /> : 
                      <Coins className="h-4 w-4 inline-block ml-1" />
                    }
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id={setting.key}
                      type="number"
                      min="0"
                      value={setting.value}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center px-3 rounded-md bg-muted text-muted-foreground">
                      {setting.suffix}
                    </div>
                    <Button
                      onClick={() => handleSaveSetting(setting.key, setting.value)}
                      disabled={updateSettingMutation.isPending}
                    >
                      {updateSettingMutation.isPending ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> :
                        t('common.save')
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanySettings;
