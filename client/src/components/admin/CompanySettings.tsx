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
    { key: 'lunchPrice', value: '', label: t('admin.mealCostLunch'), suffix: 'JPY' },
    { key: 'dinnerPrice', value: '', label: t('admin.mealCostDinner'), suffix: 'JPY' },
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
  
  // Sử dụng API endpoint mới để lấy tất cả settings trong một lần gọi
  const { data: allSettingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/settings', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        // Chuyển đổi từ đối tượng key-value thành mảng { key, value }
        return Object.entries(data).map(([key, value]) => ({
          key,
          value: value as string
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
        
        // Nếu có lỗi, trả về giá trị mặc định cho tất cả settings
        return settings.map(setting => ({
          key: setting.key,
          value: '0'
        }));
      }
    },
    // Giảm thiểu số lần gọi API khi component re-render
    staleTime: 30000 // 30 seconds
  });
  
  // Update settings when data is loaded
  useEffect(() => {
    if (allSettingsData) {
      allSettingsData.forEach((item) => {
        if (item && item.key) {
          updateSettingValue(item.key, item.value);
        }
      });
    }
  }, [allSettingsData]);
  
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
      // Invalidate both the individual query and the main query
      queryClient.invalidateQueries({ queryKey: [`/api/settings/${variables.key}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
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
  
  // Use the loading state from our useQuery
  const isLoading = isSettingsLoading;

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
