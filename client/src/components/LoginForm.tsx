import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import LanguageSelector from '@/components/LanguageSelector';

const LoginForm = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogin = async () => {
    if (!userId || !password) {
      setError(t('common.login_error'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await login(userId, password);
      
      if (success) {
        toast({
          title: t('common.success'),
          description: t('common.login_success'),
          duration: 2000,
        });
        
        // Redirect based on user role
        // This will happen in the auth context after login
      } else {
        setError(t('common.login_error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('common.login_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-muted-foreground">
            {t('auth.enterCredentials')}
          </p>
        </div>
        
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector />
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div className="mb-6">
            <Label htmlFor="user-id" className="block mb-2">
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
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="password" className="block mb-2">
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
            />
          </div>
          
          <div className="mt-8">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.login')}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 text-destructive text-sm">
              {error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
