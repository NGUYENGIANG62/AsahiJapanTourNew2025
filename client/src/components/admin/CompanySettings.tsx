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
  
  // Queries for each setting
  const profitMarginQuery = useQuery({
    queryKey: ['/api/settings/profit_margin'],
    queryFn: () => fetchSetting('profit_margin'),
  });
  
  const taxRateQuery = useQuery({
    queryKey: ['/api/settings/tax_rate'],
    queryFn: () => fetchSetting('tax_rate'),
  });
  
  const mealLunchQuery = useQuery({
    queryKey: ['/api/settings/meal_cost_lunch'],
    queryFn: () => fetchSetting('meal_cost_lunch'),
  });
  
  const mealDinnerQuery = useQuery({
    queryKey: ['/api/settings/meal_cost_dinner'],
    queryFn: () => fetchSetting('meal_cost_dinner'),
  });
  
  // Update settings when data is loaded
  useEffect(() => {
    if (profitMarginQuery.data) {
      updateSettingValue('profit_margin', profitMarginQuery.data.value);
    }
    if (taxRateQuery.data) {
      updateSettingValue('tax_rate', taxRateQuery.data.value);
    }
    if (mealLunchQuery.data) {
      updateSettingValue('meal_cost_lunch', mealLunchQuery.data.value);
    }
    if (mealDinnerQuery.data) {
      updateSettingValue('meal_cost_dinner', mealDinnerQuery.data.value);
    }
  }, [
    profitMarginQuery.data,
    taxRateQuery.data,
    mealLunchQuery.data,
    mealDinnerQuery.data,
  ]);
  
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
  const isLoading = 
    profitMarginQuery.isLoading || 
    taxRateQuery.isLoading || 
    mealLunchQuery.isLoading || 
    mealDinnerQuery.isLoading;

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
