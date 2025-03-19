import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Clock,
  ExternalLink
} from 'lucide-react';
import asahiLogo from '../assets/asahi-vietlife-logo.jpg';

type ContactInfoProps = {
  compact?: boolean;
};

const ContactInfo = ({ compact = false }: ContactInfoProps) => {
  const { t } = useTranslation();

  return (
    <Card className={compact ? "border-0 shadow-none" : ""}>
      {!compact && (
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <img 
              src={asahiLogo} 
              alt="Asahi VietLife Logo" 
              className="h-8 w-auto mr-2"
            />
            <span>Asahi VietLife</span>
          </CardTitle>
          <CardDescription>
            {t('common.contactDescription')}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : ""}>
        <div className={`space-y-3 ${compact ? 'text-sm' : ''}`}>
          <div className="flex items-start">
            <MapPin className={`${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} mr-2 text-muted-foreground`} />
            <span>1-35 Adachi, Adachi-ku, Tokyo, Japan</span>
          </div>
          <div className="flex items-start">
            <Mail className={`${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} mr-2 text-muted-foreground`} />
            <div>
              <div>asahivietlifejapantours@gmail.com</div>
              <div>asahivietlife@outlook.com</div>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className={`${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} mr-2 text-muted-foreground`} />
            <div>
              <div>Hotline: 03-6675-4977</div>
              <div>070-2813-6693 (Mrs. Rina - 日本語)</div>
              <div>+8170-2794-4770 (Mr. Truong Giang - Tiếng Việt)</div>
              <div>Zalo/WhatsApp/Line: +8170-2794-4770 (Mr. Truong Giang)</div>
              <div>Mr. Linh - English Guide: 07091881073</div>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className={`${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} mr-2 text-muted-foreground`} />
            <span>9:00 - 18:00 (Mon - Sat)</span>
          </div>
          
          {/* Social Media Links */}
          <div className="pt-2">
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://www.facebook.com/profile.php?id=61566880418544" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Facebook className="h-4 w-4" />
                  <span className="hidden sm:inline">Du Lịch Asahi VietLife - Japan Travel</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;