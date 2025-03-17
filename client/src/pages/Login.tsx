import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Redirect based on authentication status
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (isAdmin) {
        setLocation('/admin');
      } else {
        setLocation('/calculator');
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent p-4">
      <LoginForm />
    </div>
  );
};

export default Login;
