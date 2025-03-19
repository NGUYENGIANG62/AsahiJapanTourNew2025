import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import TourCalculator from '@/components/calculator/TourCalculator';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const Calculator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto my-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          {t('common.not_authenticated')}
        </AlertDescription>
      </Alert>
    );
  }

  return <TourCalculator />;
};

export default Calculator;
