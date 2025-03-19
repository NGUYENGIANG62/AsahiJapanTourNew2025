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

  // Chỉ hiển thị đơn vị Yên Nhật
  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'JPY', label: 'JPY - Yên Nhật', symbol: '¥' },
  ];

  return (
    <div className="space-y-2">
      <Label className="flex items-center text-sm font-medium text-neutral">
        <DollarSign className="h-4 w-4 mr-1" />
        {t('calculator.currency', 'Đơn vị tiền tệ')}
      </Label>
      <Select 
        value={'JPY'}
        onValueChange={(value) => {
          // Hiển thị thông báo nếu người dùng cố gắng chọn đơn vị tiền tệ khác
          if (value !== 'JPY') {
            alert('Chỉ hỗ trợ hiển thị giá tiền bằng Yên Nhật (JPY)');
          }
          // Luôn sử dụng JPY
          setCurrency('JPY');
        }}
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