import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CloudCog, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

type SyncStatus = {
  lastSync: string | null;
  status: string;
};

const SyncManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [syncType, setSyncType] = useState<'from-sheets' | 'to-sheets' | null>(null);

  // Fetch current sync status
  const { data: syncStatus, isLoading: isLoadingStatus, error: statusError } = useQuery<SyncStatus>({
    queryKey: ['/api/sync/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Sync from Google Sheets to application
  const syncFromSheetsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/from-sheets');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('admin.syncSuccess'),
        description: t('admin.syncFromSheetsSuccess'),
        variant: 'default',
      });
      // Invalidate all data queries
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status'] });
      setSyncType(null);
    },
    onError: (error) => {
      toast({
        title: t('admin.syncError'),
        description: t('admin.syncFromSheetsError'),
        variant: 'destructive',
      });
      console.error('Sync error:', error);
      setSyncType(null);
    }
  });

  // Sync from application to Google Sheets
  const syncToSheetsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/to-sheets');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('admin.syncSuccess'),
        description: t('admin.syncToSheetsSuccess'),
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status'] });
      setSyncType(null);
    },
    onError: (error) => {
      toast({
        title: t('admin.syncError'),
        description: t('admin.syncToSheetsError'),
        variant: 'destructive',
      });
      console.error('Sync error:', error);
      setSyncType(null);
    }
  });

  const isSyncing = syncFromSheetsMutation.isPending || syncToSheetsMutation.isPending;
  const errorMessage = statusError ? String(statusError) : '';

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('admin.never');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSyncFromSheets = () => {
    setSyncType('from-sheets');
    syncFromSheetsMutation.mutate();
  };

  const handleSyncToSheets = () => {
    setSyncType('to-sheets');
    syncToSheetsMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('admin.googleSheetsSync')}</CardTitle>
            <CardDescription>
              {t('admin.googleSheetsSyncDescription')}
            </CardDescription>
          </div>
          <CloudCog className="h-8 w-8 text-primary opacity-80" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Information */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium">{t('admin.lastSyncTime')}:</span>
            {isLoadingStatus ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-500">{t('admin.loading')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {syncStatus ? formatDate(syncStatus.lastSync) : t('admin.never')}
                </Badge>
                {syncStatus?.lastSync && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            )}
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('admin.error')}</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Sync Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t('admin.syncFromSheets')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('admin.syncFromSheetsDescription')}
            </p>
            <Button
              variant="outline"
              className="w-full justify-center mt-2"
              onClick={handleSyncFromSheets}
              disabled={isSyncing}
            >
              {syncType === 'from-sheets' && isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('admin.syncing')}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {t('admin.importFromSheets')}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t('admin.syncToSheets')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('admin.syncToSheetsDescription')}
            </p>
            <Button
              variant="outline"
              className="w-full justify-center mt-2"
              onClick={handleSyncToSheets}
              disabled={isSyncing}
            >
              {syncType === 'to-sheets' && isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('admin.syncing')}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('admin.exportToSheets')}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-sm text-gray-500">
        {t('admin.syncNote')}
      </CardFooter>
    </Card>
  );
};

export default SyncManagement;