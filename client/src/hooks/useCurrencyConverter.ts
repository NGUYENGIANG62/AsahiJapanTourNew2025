import { useState, useEffect } from 'react';
import { Currency } from '@/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type CurrencyConversionResult = {
  convert: (amount: number, from?: Currency, to?: Currency) => number;
  loading: boolean;
  error: Error | null;
};

// Conversion rates relative to JPY
interface ConversionRates {
  JPY: number;
  USD: number;
  VND: number;
  CNY: number;
  KRW: number;
}

export const useCurrencyConverter = (defaultCurrency: Currency = 'JPY'): CurrencyConversionResult => {
  const [baseCurrency, setBaseCurrency] = useState<Currency>(defaultCurrency);
  
  // Fetch conversion rates
  const { data: conversionRates, isLoading, error } = useQuery<ConversionRates>({
    queryKey: ['/api/currency/rates'],
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // 1 hour
    queryFn: async () => {
      try {
        const response = await axios.get('/api/currency/rates');
        return response.data;
      } catch (err) {
        // Fallback rates if API call fails
        return {
          JPY: 1,
          USD: 0.0067,
          VND: 161.83,
          CNY: 0.048,
          KRW: 9.05
        };
      }
    }
  });
  
  // Update base currency when defaultCurrency changes
  useEffect(() => {
    setBaseCurrency(defaultCurrency);
  }, [defaultCurrency]);
  
  const convert = (amount: number, from: Currency = baseCurrency, to: Currency = baseCurrency): number => {
    if (from === to) return amount;
    
    // If data is not loaded yet, return original amount
    if (!conversionRates) return amount;
    
    // Convert using the rates
    if (from === 'JPY') {
      // From JPY to target currency
      return parseFloat((amount * conversionRates[to]).toFixed(2));
    } else if (to === 'JPY') {
      // From source currency to JPY
      return parseFloat((amount / conversionRates[from]).toFixed(2));
    } else {
      // First convert to JPY, then to target currency
      const amountInJPY = amount / conversionRates[from];
      return parseFloat((amountInJPY * conversionRates[to]).toFixed(2));
    }
  };
  
  return {
    convert,
    loading: isLoading,
    error: error as Error | null,
  };
};
