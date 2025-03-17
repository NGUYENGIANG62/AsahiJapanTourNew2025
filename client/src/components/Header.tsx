import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="font-heading text-xl font-bold text-primary">
              {t('common.appName')}
            </a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector minimal={true} />
          
          {/* User Info */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isAdmin ? "destructive" : "secondary"}
                className="px-2 py-0.5 text-xs rounded-full"
              >
                {isAdmin ? t('common.admin') : t('common.user')}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
