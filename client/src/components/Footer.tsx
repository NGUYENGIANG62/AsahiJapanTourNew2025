import { useTranslation } from 'react-i18next';
import { Facebook, Mail, Phone } from 'lucide-react';
import { Link } from 'wouter';
import asahiLogo from '../assets/asahi-vietlife-logo.jpg';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/">
              <a className="flex items-center mb-4">
                <img 
                  src={asahiLogo} 
                  alt="Asahi VietLife Logo" 
                  className="h-10 w-auto mr-2"
                />
                <span className="font-heading text-xl font-bold text-primary">
                  {t('common.appName')}
                </span>
              </a>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {t('common.companyDescription')}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61566880418544" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="mailto:hoangtucuoirong@gmail.com" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="tel:0366754977" 
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-medium text-lg mb-4">
              {t('common.contactUs')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Phone className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <div>Hotline: 03-6675-4977</div>
                  <div>070-2813-6693 (Mrs. Rina - Japanese)</div>
                  <div>070-2794-4770 (Mr. Truong Giang - Vietnamese)</div>
                  <div>English Guide: 07091881073 (Mr. Linh)</div>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="h-4 w-4 mt-0.5 mr-2 text-muted-foreground" />
                <div>
                  <div>hoangtucuoirong@gmail.com</div>
                  <div>asahivietlife@outlook.com</div>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-medium text-lg mb-4">
              {t('common.quickLinks')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    {t('common.homePage')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/calculator">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    {t('common.tourCalculator')}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    {t('common.login')}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-200 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Asahi VietLife Japan Tour. {t('common.allRightsReserved')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <span>{t('common.address')}: </span>
            1-35 Adachi, Adachi-ku, Tokyo, Japan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;