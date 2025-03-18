import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';
import { AlertCircle, UserCircle2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginForm = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Clear error when language changes
  useEffect(() => {
    if (error) setError(null);
  }, [i18n.language]);
  
  const handleLogin = async () => {
    // Validate form
    if (!userId || !password) {
      setError(t('auth.fieldRequired'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { success, errorMessage } = await login(userId, password);
      
      if (success) {
        toast({
          title: t('common.success'),
          description: t('common.login_success'),
          duration: 2000,
        });
        // Redirect based on user role happens in the auth context
      } else {
        setAttemptCount(prev => prev + 1);
        
        // Show appropriate error message based on attempt count
        if (errorMessage) {
          setError(errorMessage);
        } else if (attemptCount >= 2) {
          // After 3 failed attempts, show a more helpful message
          setError(t('auth.loginHelpText'));
        } else {
          setError(t('common.login_error'));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setAttemptCount(prev => prev + 1);
      setError(t('auth.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth.enterCredentials')}
          </p>
        </div>
        
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="mb-5">
            <Label htmlFor="user-id" className="flex items-center gap-2 mb-2">
              <UserCircle2 className="h-4 w-4" />
              {t('auth.id')}
            </Label>
            <Input 
              id="user-id" 
              type="text"
              placeholder={t('auth.enterId')}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="username"
              className={error && !userId ? "border-red-500" : ""}
            />
          </div>
          
          <div className="mb-5">
            <Label htmlFor="password" className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4" />
              {t('auth.password')}
            </Label>
            <Input 
              id="password" 
              type="password"
              placeholder={t('auth.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
              className={error && !password ? "border-red-500" : ""}
            />
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full py-6 text-base" 
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.login')}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mt-1">
                {error}
                {attemptCount >= 2 && (
                  <div className="mt-2 text-xs bg-black/5 p-2 rounded">
                    <p className="flex items-center gap-1 mb-1">
                      <strong>{t('auth.adminCredentials')}:</strong> 
                      <span className="font-mono">AsahiVietLifeJapanTour</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <strong>{t('auth.customerCredentials')}:</strong>
                      <span className="font-mono">customer</span>
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
