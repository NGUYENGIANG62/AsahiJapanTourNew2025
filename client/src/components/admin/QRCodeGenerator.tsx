import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const QRCodeGenerator = () => {
  const [url, setUrl] = useState<string>('');
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string | null>(null);
  const [qrCodeType, setQRCodeType] = useState<'app' | 'custom'>('app');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize QR code when component mounts
    if (canvasRef.current) {
      const appUrl = window.location.origin;
      QRCode.toCanvas(
        canvasRef.current,
        appUrl,
        { width: 300, margin: 1, color: { dark: '#000', light: '#fff' } },
        (error) => {
          if (error) {
            console.error('Error initializing QR code:', error);
          } else {
            setQRCodeDataURL(canvasRef.current?.toDataURL() || null);
          }
        }
      );
    }
  }, []);

  const generateQRCode = async () => {
    try {
      // Determine the URL to encode
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
        QRCode.toCanvas(
          canvasRef.current,
          qrUrl,
          { width: 300, margin: 1, color: { dark: '#000', light: '#fff' } },
          (error) => {
            if (error) {
              throw error;
            }
            setQRCodeDataURL(canvasRef.current?.toDataURL() || null);
            toast({
              title: 'Thành công',
              description: 'Mã QR đã được tạo.',
            });
          }
        );
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

    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = 'asahi-japan-tours-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Tải xuống thành công',
      description: 'Mã QR đã được tải xuống.',
    });
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

    // Create a temporary image and then copy it
    const img = new Image();
    img.src = qrCodeDataURL;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]).then(() => {
              toast({
                title: 'Sao chép thành công',
                description: 'Mã QR đã được sao chép vào clipboard.',
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
      }
    };
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

        <div className="flex flex-col items-center mt-4">
          <canvas ref={canvasRef} className="border border-gray-200 rounded-md"></canvas>
          
          {qrCodeDataURL && (
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Quét mã QR này để truy cập ứng dụng</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        <Button onClick={generateQRCode}>Tạo mã QR</Button>
        <Button variant="outline" onClick={downloadQRCode} disabled={!qrCodeDataURL}>Tải xuống</Button>
        <Button variant="outline" onClick={copyToClipboard} disabled={!qrCodeDataURL}>Sao chép</Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeGenerator;