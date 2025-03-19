import { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorContext } from '@/context/CalculatorContext';
import Step1DateSelection from './Step1DateSelection';
import Step2ServiceSelection from './Step2ServiceSelection';
import Step3Participants from './Step3Participants';
import Step4Accommodation from './Step4Accommodation';
import Step5Summary from './Step5Summary';
import SpecialServicesStep from './SpecialServicesStep';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Hotel, 
  FileText,
  ArrowLeft,
  ArrowRight,
  Calculator
} from 'lucide-react';

const TourCalculator = () => {
  const { t } = useTranslation();
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    isValid,
    calculatePrice,
    isCalculating 
  } = useContext(CalculatorContext);

  // Define the steps
  const steps = [
    { id: 1, name: t('calculator.steps.dates'), icon: <CalendarDays className="w-4 h-4" /> },
    { id: 2, name: t('calculator.steps.services'), icon: <MapPin className="w-4 h-4" /> },
    { id: 3, name: t('calculator.steps.participants'), icon: <Users className="w-4 h-4" /> },
    { id: 4, name: t('calculator.steps.accommodation'), icon: <Hotel className="w-4 h-4" /> },
    { id: 5, name: t('calculator.specialServices.title', 'Optional Services'), icon: <MapPin className="w-4 h-4" /> },
    { id: 6, name: t('calculator.steps.summary'), icon: <FileText className="w-4 h-4" /> },
  ];

  // Handle next button click
  const handleNext = () => {
    if (currentStep === 5) {
      // Khi chuyển từ bước 5 (Optional Services) sang bước 6 (Summary), tính giá
      calculatePrice();
      nextStep();
    } else if (currentStep === 6) {
      // Đã ở bước cuối, khi nhấn nút tính toán lại giá
      calculatePrice();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.id === currentStep 
                    ? 'bg-secondary text-white' 
                    : step.id < currentStep 
                      ? 'bg-success text-white' 
                      : 'bg-gray-300 text-white'
                }`}
              >
                {step.id < currentStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              <span className={`mt-2 text-sm ${
                step.id <= currentStep ? 'text-neutral' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className={`h-1 absolute w-full top-5 left-1/2 ${
                  step.id < currentStep ? 'bg-success' : 'bg-gray-200'
                }`} style={{ width: '100%', zIndex: -1 }} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step Content */}
          {currentStep === 1 && <Step1DateSelection />}
          {currentStep === 2 && <Step2ServiceSelection />}
          {currentStep === 3 && <Step3Participants />}
          {currentStep === 4 && <Step4Accommodation />}
          {currentStep === 5 && <SpecialServicesStep />}
          {currentStep === 6 && <Step5Summary />}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <Button 
                variant="outline" 
                onClick={prevStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.previous')}
              </Button>
            ) : (
              <div /> // Empty div to maintain spacing
            )}
            
            <Button
              onClick={handleNext}
              disabled={!isValid || isCalculating}
              className={currentStep === 6 ? 'bg-primary' : ''}
            >
              {isCalculating ? (
                t('common.loading')
              ) : currentStep === 6 ? (
                <>
                  {t('common.calculate')} <Calculator className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {t('common.next')} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TourCalculator;
