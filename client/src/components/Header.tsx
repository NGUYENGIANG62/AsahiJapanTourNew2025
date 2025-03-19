import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import LanguageSelector from './LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Facebook, Clock, Crown, User, Briefcase } from 'lucide-react';
import asahiLogo from '../assets/asahi-vietlife-logo.jpg';

const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img 
                src={asahiLogo} 
                alt="Asahi VietLife Logo" 
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-bold text-primary hidden sm:inline">
                Asahi VietLife
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector minimal={true} />
          
          {/* User Info */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isAdmin ? "destructive" : user?.role === 'agent' ? "outline" : "secondary"}
                className={`px-2 py-0.5 text-xs rounded-full flex items-center ${
                  user?.role === 'agent' ? 'border-2 border-blue-500 text-blue-600' : ''
                }`}
              >
                {isAdmin ? (
                  <><Crown className="h-3 w-3 mr-1" /> {t('common.admin')}</>
                ) : user?.role === 'agent' ? (
                  <><Briefcase className="h-3 w-3 mr-1" /> {t('common.agency')}</>
                ) : (
                  <><User className="h-3 w-3 mr-1" /> {t('common.customer')}</>
                )}
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
