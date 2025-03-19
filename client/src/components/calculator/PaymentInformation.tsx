import React from 'react';
import { useTranslation } from 'react-i18next';
import CurrencySelector from './CurrencySelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calculator, 
  CreditCard, 
  Building2, 
  BadgeJapaneseYen, 
  DollarSign,
  Receipt,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PaymentInformationProps {
  formatCurrency?: (amount: number) => string;
  totalAmount?: number;
  participants?: number;
  currency?: string;
  showQR?: boolean;
}

const PaymentInformation: React.FC<PaymentInformationProps> = ({
  formatCurrency,
  totalAmount,
  participants,
  currency = 'JPY',
  showQR = true
}) => {
  const { t } = useTranslation();
  
  // Định dạng tiền tệ nếu không được cung cấp từ bên ngoài
  const formatCurrencyFallback = (amount: number = 0): string => {
    if (formatCurrency) return formatCurrency(amount);
    
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return formatter.format(amount);
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <CardTitle className="flex items-center font-heading">
          <Calculator className="mr-2 h-5 w-5 text-primary" />
          {t('calculator.summary.paymentInfo', 'Thông tin thanh toán')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          {/* Currency Selector - hiển thị khi ở trong bảng tính giá */}
          {totalAmount !== undefined && (
            <div className="pb-4 border-b">
              <CurrencySelector />
            </div>
          )}
          
          {/* Total Cost - chỉ hiển thị khi có dữ liệu */}
          {totalAmount !== undefined && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrencyFallback(totalAmount)}
              </div>
              
              {participants !== undefined && participants > 1 && (
                <div className="text-sm text-muted-foreground mt-2">
                  {t('calculator.summary.perPerson', 'Cho mỗi khách')}: {formatCurrencyFallback(totalAmount / participants)}
                </div>
              )}
            </div>
          )}
          
          {/* Payment Instructions */}
          <div className="mt-6 text-left rounded-md overflow-hidden border">
            <div className="bg-primary/10 p-3">
              <h4 className="font-semibold flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                {t('calculator.summary.paymentInstructions', 'Hướng dẫn thanh toán')}
              </h4>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Banking information */}
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Building2 className="mr-2 h-5 w-5 text-indigo-600" />
                    <h5 className="font-medium">{t('calculator.summary.bankTransfer', 'Chuyển khoản ngân hàng')}</h5>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Tên công ty:</span>
                      <span>ASAHI VIET LIFE JSC</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Ngân hàng:</span>
                      <span>Mitsubishi UFJ (MUFG)</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Mã ngân hàng:</span>
                      <span>195</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Tên tài khoản:</span>
                      <span>Kifushi Rina</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Chi nhánh:</span>
                      <span>Senju Chuo, Japan</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Số tài khoản:</span>
                      <span>0115737</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Swift Code:</span>
                      <span>BOTKJPJ</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">JP Bank Account:</span>
                      <span>10150-88796221</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">VN Bank Account:</span>
                      <span>VietinBank - 103869460710</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Chủ tài khoản:</span>
                      <span>NGUYEN TRUONG GIANG</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">Chi nhánh:</span>
                      <span>VietinBank CN DO THANH - HOI SO</span>
                    </li>
                  </ul>
                </div>
                
                {/* QR Code for payment - chỉ hiển thị khi được yêu cầu */}
                {showQR && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="border rounded-lg p-2 bg-white">
                      <img 
                        src={currency === 'VND' ? "attached_assets/IMG_2421.png" : "attached_assets/871dfb8adbcd32936bdc.jpeg"} 
                        alt="Payment QR Code" 
                        className="h-32 w-32 object-contain"
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-muted-foreground flex items-center justify-center">
                      <QrCode className="h-3 w-3 mr-1" />
                      {t('calculator.summary.scanQR', 'Quét mã QR để thanh toán')} 
                      {currency === 'VND' ? ' (VietinBank)' : ' (JP)'}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{t('calculator.summary.importantNote', 'Lưu ý quan trọng')}:</span>{' '}
                  {t('calculator.summary.paymentNotes', 'Giá trên là ước tính, chúng tôi sẽ liên hệ để xác nhận chi tiết sau khi nhận được yêu cầu đặt tour. Vui lòng ghi rõ tên và ngày tour khi thanh toán.')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInformation;