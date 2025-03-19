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
  showQR = false
}) => {
  const { t } = useTranslation();
  
  // Format currency if not provided from outside
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
          {t('calculator.summary.paymentInfo', 'Payment Information')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="space-y-5">
          {/* Currency Selector - displayed when in the calculator */}
          {totalAmount !== undefined && (
            <div className="pb-4 border-b">
              <CurrencySelector />
            </div>
          )}
          
          {/* Total Cost - only displayed when data is available */}
          {totalAmount !== undefined && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formatCurrencyFallback(totalAmount)}
              </div>
              
              {participants !== undefined && participants > 1 && (
                <div className="text-sm text-muted-foreground mt-2">
                  {t('calculator.summary.perPerson', 'Per person')}: {formatCurrencyFallback(totalAmount / participants)}
                </div>
              )}
            </div>
          )}
          
          {/* Payment Instructions */}
          <div className="mt-6 text-left rounded-md overflow-hidden border">
            <div className="bg-primary/10 p-3">
              <h4 className="font-semibold flex items-center">
                <Receipt className="mr-2 h-4 w-4" />
                {t('calculator.summary.paymentInstructions', 'Payment Instructions')}
              </h4>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Banking information */}
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <Building2 className="mr-2 h-5 w-5 text-indigo-600" />
                    <h5 className="font-medium">{t('calculator.summary.bankTransfer', 'Bank Transfer')}</h5>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.companyName', 'Company Name')}:</span>
                      <span>ASAHI VIETLIFE</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.bank', 'Bank')}:</span>
                      <span>Mitsubishi UFJ (MUFG)</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.bankCode', 'Bank Code')}:</span>
                      <span>195</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.accountName', 'Account Name')}:</span>
                      <span>Kifushi Rina</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.branch', 'Branch')}:</span>
                      <span>Senju Chuo, Japan</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.accountNumber', 'Account Number')}:</span>
                      <span>0115737</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.swiftCode', 'Swift Code')}:</span>
                      <span>BOTKJPJ</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.jpBankAccount', 'JP Bank Account')}:</span>
                      <span>10150-88796221</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.vnBankAccount', 'VN Bank Account')}:</span>
                      <span>VietinBank - 103869460710</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.accountHolder', 'Account Holder')}:</span>
                      <span>NGUYEN TRUONG GIANG</span>
                    </li>
                    <li className="flex items-baseline">
                      <span className="font-medium w-32">{t('calculator.summary.branch', 'Branch')}:</span>
                      <span>VietinBank CN DO THANH - HOI SO</span>
                    </li>
                  </ul>
                </div>
                
                {/* QR Code for payment - only displayed when requested */}
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
                      {t('calculator.summary.scanQR', 'Scan QR code to pay')} 
                      {currency === 'VND' ? ' (VietinBank)' : ' (JP)'}
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">{t('calculator.summary.importantNote', 'Important Note')}:</span>{' '}
                  {t('calculator.summary.paymentNotes', 'The price above is an estimate. We will contact you to confirm details after receiving your tour booking request. Please include your name and tour date when making payment.')}
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