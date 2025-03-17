import { useState, useEffect } from 'react';
import { Currency } from '@/types';
import { useQuery } from '@tanstack/react-query';

type CurrencyConversionResult = {
  convert: (amount: number, from?: Currency, to?: Currency) => number;
  loading: boolean;
  error: Error | null;
};

export const useCurrencyConverter = (defaultCurrency: Currency = 'JPY'): CurrencyConversionResult => {
  const [baseCurrency, setBaseCurrency] = useState<Currency>(defaultCurrency);
  
  // Fetch conversion rates
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/currency/convert'],
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // 1 hour
  });
  
  // Update base currency when defaultCurrency changes
  useEffect(() => {
    setBaseCurrency(defaultCurrency);
  }, [defaultCurrency]);
  
  const convert = (amount: number, from: Currency = baseCurrency, to: Currency = baseCurrency): number => {
    if (from === to) return amount;
    
    // If data is not loaded yet, return original amount
    if (!data) return amount;
    
    // Use API to convert
    const params = new URLSearchParams({
      amount: amount.toString(),
      from,
      to
    });
    
    const url = `/api/currency/convert?${params.toString()}`;
    
    // Make a request to get the converted amount
    // This is a simplified example, in a real implementation we would 
    // cache conversion rates and calculate locally when possible
    
    return amount; // Placeholder until actual API call is implemented
  };
  
  return {
    convert,
    loading: isLoading,
    error: error as Error | null,
  };
};
