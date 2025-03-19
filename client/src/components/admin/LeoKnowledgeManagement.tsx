import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const LeoKnowledgeManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    checkKnowledgeBaseStatus();
  }, []);

  const checkKnowledgeBaseStatus = async () => {
    try {
      setKnowledgeBaseStatus('checking');
      const response = await fetch('/api/leo/status');
      const data = await response.json();
      
      if (data.success && data.available) {
        setKnowledgeBaseStatus('available');
      } else {
        setKnowledgeBaseStatus('unavailable');
      }
    } catch (error) {
      console.error('Error checking knowledge base status:', error);
      setKnowledgeBaseStatus('unavailable');
      toast({
        title: t('leoKnowledge.statusError'),
        description: t('leoKnowledge.statusErrorDesc'),
        variant: 'destructive',
      });
    }
  };

  const uploadSampleData = async () => {
    try {
      setIsUploading(true);
      const response = await fetch('/api/leo/upload-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: t('leoKnowledge.uploadSuccess'),
          description: t('leoKnowledge.uploadSuccessDesc'),
          variant: 'default',
        });
        checkKnowledgeBaseStatus();
      } else {
        toast({
          title: t('leoKnowledge.uploadError'),
          description: data.message || t('leoKnowledge.uploadErrorDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading sample data:', error);
      toast({
        title: t('leoKnowledge.uploadError'),
        description: t('leoKnowledge.uploadErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          <BookOpen className="inline-block mr-2 h-8 w-8" />
          {t('leoKnowledge.title')}
        </h2>
      </div>

      <p className="text-muted-foreground">
        {t('leoKnowledge.description')}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t('leoKnowledge.status')}</CardTitle>
          <CardDescription>
            {t('leoKnowledge.statusDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{t('leoKnowledge.currentStatus')}:</span>
              {knowledgeBaseStatus === 'checking' && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  {t('leoKnowledge.checking')}
                </Badge>
              )}
              {knowledgeBaseStatus === 'available' && (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {t('leoKnowledge.available')}
                </Badge>
              )}
              {knowledgeBaseStatus === 'unavailable' && (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {t('leoKnowledge.unavailable')}
                </Badge>
              )}
            </div>

            {knowledgeBaseStatus === 'unavailable' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('leoKnowledge.unavailableTitle')}</AlertTitle>
                <AlertDescription>
                  {t('leoKnowledge.unavailableDesc')}
                </AlertDescription>
              </Alert>
            )}

            {knowledgeBaseStatus === 'available' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>{t('leoKnowledge.availableTitle')}</AlertTitle>
                <AlertDescription>
                  {t('leoKnowledge.availableDesc')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={checkKnowledgeBaseStatus} disabled={knowledgeBaseStatus === 'checking'}>
            {knowledgeBaseStatus === 'checking' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('leoKnowledge.checking')}
              </>
            ) : (
              t('leoKnowledge.checkAgain')
            )}
          </Button>
          <Button onClick={uploadSampleData} disabled={isUploading || knowledgeBaseStatus === 'checking'}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('leoKnowledge.uploading')}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {t('leoKnowledge.uploadSampleData')}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('leoKnowledge.googleSheetInfo')}</CardTitle>
          <CardDescription>
            {t('leoKnowledge.googleSheetInfoDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {t('leoKnowledge.googleSheetUrl')}: 
            <a 
              href="https://docs.google.com/spreadsheets/d/1-y9g-Ye1h0vKN6mxV_irrkNNIqAVqNfWGnSRXZ1-6GA/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              https://docs.google.com/spreadsheets/d/1-y9g-Ye1h0vKN6mxV_irrkNNIqAVqNfWGnSRXZ1-6GA/
            </a>
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('leoKnowledge.faqSheet')}</h4>
              <p className="text-sm text-muted-foreground">{t('leoKnowledge.faqSheetDesc')}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('leoKnowledge.tourSheet')}</h4>
              <p className="text-sm text-muted-foreground">{t('leoKnowledge.tourSheetDesc')}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">{t('leoKnowledge.localInsightSheet')}</h4>
              <p className="text-sm text-muted-foreground">{t('leoKnowledge.localInsightSheetDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeoKnowledgeManagement;