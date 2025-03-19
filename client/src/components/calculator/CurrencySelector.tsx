import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorContext } from '@/context/CalculatorContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Currency } from '@/types';
import { DollarSign } from 'lucide-react';

const CurrencySelector: React.FC = () => {
  const { t } = useTranslation();
  const { currency, setCurrency } = useContext(CalculatorContext);

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'JPY', label: 'JPY - Yên Nhật', symbol: '¥' },
    { value: 'USD', label: 'USD - Đô la Mỹ', symbol: '$' },
    { value: 'VND', label: 'VND - Việt Nam Đồng', symbol: '₫' },
    { value: 'CNY', label: 'CNY - Nhân dân tệ', symbol: '¥ (CNY)' },
    { value: 'KRW', label: 'KRW - Won Hàn Quốc', symbol: '₩' },
  ];

  return (
    <div className="space-y-2">
      <Label className="flex items-center text-sm font-medium text-neutral">
        <DollarSign className="h-4 w-4 mr-1" />
        {t('calculator.currency', 'Đơn vị tiền tệ')}
      </Label>
      <Select 
        value={currency}
        onValueChange={(value) => setCurrency(value as Currency)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('calculator.selectCurrency', 'Chọn đơn vị tiền tệ')} />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((curr) => (
            <SelectItem key={curr.value} value={curr.value}>
              {curr.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;