import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch'; 
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState<string>('');
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string | null>(null);
  const [qrCodeType, setQRCodeType] = useState<'app' | 'custom'>('app');
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [logoUrl, setLogoUrl] = useState<string>('/assets/logo/default-logo.svg');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Tạo QR code và thêm logo vào giữa
  const createQRCodeWithLogo = async (canvas: HTMLCanvasElement, qrText: string) => {
    try {
      // Tạo QR code trước
      await new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(
          canvas,
          qrText,
          { 
            width: Math.min(250, window.innerWidth - 40), 
            margin: 1,
            scale: 6,
            errorCorrectionLevel: 'H', // Highest error correction for better scanning
            color: { dark: '#000', light: '#fff' } 
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      // Thêm logo nếu được chọn
      if (showLogo) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
          // Tải logo
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous'; // Cho phép tải từ các nguồn khác nhau
          
          await new Promise<void>((resolve, reject) => {
            // Thiết lập xử lý sự kiện trước khi gán src
            logoImg.onload = () => {
              try {
                // Kích thước logo không quá 25% của QR code để đảm bảo khả năng đọc
                const logoSize = canvas.width * 0.25;
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = (canvas.height - logoSize) / 2;
                
                // Vẽ nền trắng hình tròn để logo hiển thị rõ hơn
                ctx.beginPath();
                ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 2, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                
                // Vẽ logo
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                resolve();
              } catch (error) {
                console.error('Lỗi khi vẽ logo:', error);
                reject(error);
              }
            };
            
            logoImg.onerror = (error) => {
              console.error('Không thể tải logo:', error);
              reject(new Error('Không thể tải logo'));
            };

            // Gán src sau khi đã thiết lập xử lý sự kiện
            if (logoUrl.includes('data:') || logoUrl.startsWith('/')) {
              // Nếu là data URL hoặc đường dẫn nội bộ
              logoImg.src = logoUrl;
            } else {
              // Nếu là URL bên ngoài, thêm timestamp để tránh cache
              logoImg.src = `${logoUrl}?t=${Date.now()}`;
            }
          });
        } catch (error) {
          console.error('Lỗi khi xử lý logo:', error);
          // Vẫn tiếp tục và trả về QR không có logo
        }
      }

      // Cập nhật data URL
      setQRCodeDataURL(canvas.toDataURL('image/png') || null);
    } catch (error) {
      console.error('Lỗi tạo QR code:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Initialize QR code when component mounts
    if (canvasRef.current) {
      // Use direct URL for compatibility
      const appUrl = window.location.origin;
      createQRCodeWithLogo(canvasRef.current, appUrl).catch(error => {
        console.error('Error initializing QR code:', error);
      });
    }
  }, [showLogo, logoUrl]); // Tạo lại khi thay đổi cài đặt logo

  const generateQRCode = async () => {
    try {
      // Determine the URL to encode (direct URL for compatibility)
      const qrUrl = qrCodeType === 'app' 
        ? window.location.origin
        : url;
      
      if (qrCodeType === 'custom' && !url.trim()) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập URL.',
          variant: 'destructive',
        });
        return;
      }

      // Generate QR code as data URL
      if (canvasRef.current) {
        await createQRCodeWithLogo(canvasRef.current, qrUrl);
        toast({
          title: 'Thành công',
          description: 'Mã QR đã được tạo với logo công ty.',
        });
      } else {
        throw new Error('Canvas not available');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo mã QR.',
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataURL) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng tạo mã QR trước.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Tạo canvas mới để vẽ toàn bộ QR code với header và footer
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Không thể tạo canvas context');

      // Thiết lập kích thước canvas
      canvas.width = 300;
      canvas.height = 340;

      // Vẽ nền
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ header
      ctx.fillStyle = '#2563eb'; // bg-blue-600
      ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ASAHI VIETLIFE JAPAN TOURS', canvas.width / 2, 20);

      // Vẽ QR code image
      const img = new Image();
      img.src = qrCodeDataURL;
      
      // Đợi image tải xong
      img.onload = () => {
        // Vẽ QR code vào giữa canvas
        ctx.drawImage(img, 25, 40, 250, 250);
        
        // Vẽ footer
        ctx.fillStyle = '#2563eb'; // bg-blue-600
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to visit us', canvas.width / 2, canvas.height - 12);
        
        // Tạo URL từ canvas
        const finalDataURL = canvas.toDataURL('image/png');
        
        // Tạo link download
        const link = document.createElement('a');
        link.href = finalDataURL;
        link.download = 'asahi-japan-tours-qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Tải xuống thành công',
          description: 'Mã QR đã được tải xuống với logo và thông tin.',
        });
      };
    } catch (error) {
      console.error('Error generating QR code for download:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo file tải xuống.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    if (!qrCodeDataURL) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng tạo mã QR trước.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Tạo canvas mới để vẽ toàn bộ QR code với header và footer
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Không thể tạo canvas context');

      // Thiết lập kích thước canvas
      canvas.width = 300;
      canvas.height = 340;

      // Vẽ nền
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ header
      ctx.fillStyle = '#2563eb'; // bg-blue-600
      ctx.fillRect(0, 0, canvas.width, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ASAHI VIETLIFE JAPAN TOURS', canvas.width / 2, 20);

      // Vẽ QR code image
      const img = new Image();
      img.src = qrCodeDataURL;
      
      // Đợi image tải xong
      img.onload = () => {
        // Vẽ QR code vào giữa canvas
        ctx.drawImage(img, 25, 40, 250, 250);
        
        // Vẽ footer
        ctx.fillStyle = '#2563eb'; // bg-blue-600
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to visit us', canvas.width / 2, canvas.height - 12);
        
        // Tạo URL từ canvas và copy
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]).then(() => {
              toast({
                title: 'Sao chép thành công',
                description: 'Mã QR đã được sao chép vào clipboard với đầy đủ thông tin.',
              });
            }).catch(err => {
              console.error('Error copying to clipboard:', err);
              toast({
                title: 'Lỗi',
                description: 'Không thể sao chép mã QR.',
                variant: 'destructive',
              });
            });
          }
        });
      };
    } catch (error) {
      console.error('Error copying QR code to clipboard:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép mã QR.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tạo mã QR</CardTitle>
        <CardDescription>
          Tạo mã QR để dễ dàng truy cập ứng dụng từ thiết bị di động.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="app" onValueChange={(value) => setQRCodeType(value as 'app' | 'custom')}>
          <TabsList className="mb-4">
            <TabsTrigger value="app">URL Ứng dụng</TabsTrigger>
            <TabsTrigger value="custom">URL Tùy chỉnh</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app">
            <Alert className="mb-4">
              <AlertDescription>
                Tạo mã QR sử dụng URL hiện tại của ứng dụng: <strong>{window.location.origin}</strong>
              </AlertDescription>
            </Alert>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
              <h4 className="font-semibold text-amber-800 mb-1">Lưu ý:</h4>
              <p className="text-sm text-amber-700">
                Nếu phiên bản Replit này hết hạn, hãy triển khai ứng dụng trên máy chủ riêng và sử dụng 
                tùy chọn "URL Tùy chỉnh" để tạo mã QR mới cho domain của bạn.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="mb-4">
              <Label htmlFor="url">URL tùy chỉnh</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-4">
              <h4 className="font-semibold text-blue-800 mb-1">Gợi ý:</h4>
              <p className="text-sm text-blue-700">
                Sử dụng tùy chọn này khi bạn đã triển khai ứng dụng trên máy chủ riêng hoặc 
                domain tùy chỉnh, ví dụ như: <strong>https://tour.asahivietlife.com</strong>
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Tùy chọn Logo */}
        <div className="mt-4 mb-4 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">Thêm Logo vào mã QR</h3>
              <p className="text-sm text-muted-foreground">Hiển thị logo công ty trong mã QR</p>
            </div>
            <Switch 
              checked={showLogo} 
              onCheckedChange={setShowLogo}
              id="logo-toggle"
            />
          </div>
          
          {showLogo && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center">Không có logo</div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setLogoUrl(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full mb-1"
                  >
                    Tải lên Logo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl('/assets/logo/default-logo.svg')}
                    className="w-full"
                  >
                    Khôi phục mặc định
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-amber-700">
                <p>Logo sẽ được đặt ở giữa mã QR và tự động điều chỉnh kích thước để đảm bảo khả năng quét.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mt-4">
          <div className="w-full max-w-[280px] mx-auto relative bg-white p-4 pb-6 rounded-lg shadow-sm">
            {/* Tiêu đề trên QR code */}
            <div className="absolute left-0 right-0 top-0 text-center bg-blue-600 text-white py-1 font-medium text-xs rounded-t-lg">
              ASAHI VIETLIFE JAPAN TOURS
            </div>
            
            <canvas 
              ref={canvasRef} 
              className="border border-gray-200 rounded-md w-full h-auto max-w-full mt-4"
              width="250" 
              height="250"
            ></canvas>
            
            {/* Chữ dưới mã QR */}
            <div className="absolute left-0 right-0 bottom-0 text-center bg-blue-600 text-white py-1 text-xs rounded-b-lg">
              Scan to visit us
            </div>
          </div>
          
          {qrCodeDataURL && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Quét mã QR này để mở <strong>AsahiVietLifeJapanTours</strong></p>
              <p className="text-xs mt-1">Mã QR sẽ đưa người dùng trực tiếp đến trang web, không hiển thị URL khả nghi</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center flex-wrap gap-2">
        <Button 
          onClick={generateQRCode} 
          className="w-full sm:w-auto"
        >
          Tạo mã QR
        </Button>
        <Button 
          variant="outline" 
          onClick={downloadQRCode} 
          disabled={!qrCodeDataURL}
          className="w-full sm:w-auto"
        >
          Tải xuống
        </Button>
        <Button 
          variant="outline" 
          onClick={copyToClipboard} 
          disabled={!qrCodeDataURL}
          className="w-full sm:w-auto"
        >
          Sao chép
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator;