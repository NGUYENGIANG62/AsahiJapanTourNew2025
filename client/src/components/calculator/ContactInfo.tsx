import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Facebook, 
  Instagram, 
  MessageCircle
} from 'lucide-react';

interface ContactInfoProps {
  showQR?: boolean;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ showQR = true }) => {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden mb-6">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center font-heading">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          {t('contact.contactUs', 'Liên hệ với chúng tôi')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Contact details */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">+8170-2794-4770</p>
                <p className="text-xs text-muted-foreground">
                  {t('contact.operationHours', 'Giờ làm việc: 9:00 - 18:00 (JP)')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">asahivietlifejapantours@gmail.com</p>
                <p className="text-xs text-muted-foreground">
                  {t('contact.emailResponse', 'Phản hồi trong vòng 24 giờ')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">AsahiJapanTours.com</p>
                <p className="text-xs text-muted-foreground">
                  {t('contact.website', 'Website chính thức')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <Facebook className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">facebook.com/AsahiJapanTours</p>
                <p className="text-xs text-muted-foreground">
                  {t('contact.socialMedia', 'Cập nhật tin tức và ưu đãi')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Tokyo, Japan</p>
                <p className="text-xs text-muted-foreground">
                  {t('contact.address', 'Văn phòng chính')}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - QR Code */}
          {showQR && (
            <div className="flex flex-col items-center justify-center">
              <div className="border rounded-lg p-2 bg-white">
                <img 
                  src="attached_assets/IMG_2419.jpeg" 
                  alt="Contact QR Code" 
                  className="h-32 w-32 object-contain"
                />
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {t('contact.scanQR', 'Quét mã QR để liên hệ')}
              </p>
            </div>
          )}
        </div>

        {/* Company information */}
        <div className="mt-6 pt-4 border-t text-sm text-center text-muted-foreground">
          <p className="font-medium text-foreground">ASAHI VIET LIFE JSC</p>
          <p>{t('contact.trustMessage', 'Đối tác du lịch đáng tin cậy của bạn tại Nhật Bản')}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;