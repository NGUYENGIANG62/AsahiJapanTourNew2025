import { useTranslation } from 'react-i18next';
import { Currency } from '@/types';
import { useState, useContext } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CalculatorContext } from '@/context/CalculatorContext';
import { Link } from 'wouter';

const Footer = () => {
  const { t } = useTranslation();
  const { currency, setCurrency } = useContext(CalculatorContext);
  
  const handleCurrencyChange = (value: string) => {
    setCurrency(value as Currency);
  };

  return (
    <footer className="bg-neutral text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-heading text-xl font-bold">{t('common.appName')}</h2>
            <p className="text-sm text-white/70 mt-1">by Asahi VietLife</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="text-sm text-white/70">
              <span>{t('common.currency')}: </span>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-24 bg-neutral text-white border border-white/30 rounded">
                  <SelectValue placeholder={currency} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Link href="/privacy">
                <a className="text-white/70 hover:text-white text-sm">
                  Privacy Policy
                </a>
              </Link>
            </div>
            
            <div>
              <Link href="/terms">
                <a className="text-white/70 hover:text-white text-sm">
                  Terms of Service
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
