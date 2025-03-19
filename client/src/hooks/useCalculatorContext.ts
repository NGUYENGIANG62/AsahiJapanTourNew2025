import { useContext } from 'react';
import { CalculatorContext } from '@/context/CalculatorContext';

export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
}