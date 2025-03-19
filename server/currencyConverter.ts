import axios from 'axios';

// Conversion rates relative to JPY
let conversionRates: Record<string, number> = {
  JPY: 1,
  USD: 0.0067, // Default fallback rate
  VND: 161.83, // Default fallback rate
  CNY: 0.048,  // Default fallback rate for Chinese Yuan
  KRW: 9.05    // Default fallback rate for Korean Won
};

let lastUpdated: Date = new Date();

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  // Always make sure currencies are uppercase
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();
  
  // If the currencies are the same, return the original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Update rates if they're older than 1 hour
  if (new Date().getTime() - lastUpdated.getTime() > 60 * 60 * 1000) {
    await updateConversionRates();
  }
  
  // Perform the conversion
  if (fromCurrency === 'JPY') {
    // From JPY to target currency
    return amount * conversionRates[toCurrency];
  } else if (toCurrency === 'JPY') {
    // From source currency to JPY
    return amount / conversionRates[fromCurrency];
  } else {
    // First convert to JPY, then to target currency
    const amountInJPY = amount / conversionRates[fromCurrency];
    return amountInJPY * conversionRates[toCurrency];
  }
}

// Accessor function for current rates
export function getConversionRates(): Record<string, number> {
  return {...conversionRates}; // Return a copy to prevent direct modification
}

export async function updateConversionRates(): Promise<void> {
  try {
    // Using ExchangeRate-API for currency conversion
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/JPY');
    
    if (response.data && response.data.rates) {
      // Update all currency rates
      conversionRates.USD = response.data.rates.USD;
      conversionRates.VND = response.data.rates.VND;
      conversionRates.CNY = response.data.rates.CNY;
      conversionRates.KRW = response.data.rates.KRW;
      
      console.log('Currency rates updated:', {
        USD: conversionRates.USD,
        VND: conversionRates.VND,
        CNY: conversionRates.CNY,
        KRW: conversionRates.KRW
      });
      
      lastUpdated = new Date();
    }
  } catch (error) {
    console.error('Error updating currency rates:', error);
    // Continue with the existing rates if the API fails
  }
}

// Initialize rates
updateConversionRates();
