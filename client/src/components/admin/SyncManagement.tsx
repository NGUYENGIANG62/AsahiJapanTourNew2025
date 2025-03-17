import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CloudCog, CloudOff, CheckCircle, AlertCircle, RefreshCw, Cloud, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types';

type SyncStatus = {
  lastSync: string | null;
  status: string;
};

const SyncManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Fetch last sync timestamp
  const { data: syncStatus, isLoading, error, refetch } = useQuery<SyncStatus>({
    queryKey: ['/api/sync/status'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Mutation to sync data from Google Sheets to local storage
  const syncFromSheetsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/sync/from-sheets');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('sync.fromSheetsSuccess'),
        variant: 'default',
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seasons'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setSyncInProgress(false);
    }
  });

  // Mutation to sync data from local storage to Google Sheets
  const syncToSheetsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/sync/to-sheets');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('sync.toSheetsSuccess'),
        variant: 'default',
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setSyncInProgress(false);
    }
  });

  const handleSyncFromSheets = () => {
    setSyncInProgress(true);
    syncFromSheetsMutation.mutate();
  };

  const handleSyncToSheets = () => {
    setSyncInProgress(true);
    syncToSheetsMutation.mutate();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('sync.never');
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Add necessary sync translations to i18n.ts
  useEffect(() => {
    if (!t('sync.title', { ns: 'translation' })) {
      // These translations would normally be in i18n.ts
      // This is just a safeguard
      console.log('Sync translations not found in i18n');
    }
  }, [t]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.googleSheetsSync')}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading || syncInProgress}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : t('sync.errorFetchingStatus')}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudCog className="h-5 w-5" />
              {t('sync.status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{t('sync.lastSyncTime')}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {formatDate(syncStatus?.lastSync || null)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">{t('sync.connectionStatus')}</p>
                  <div className="mt-2 flex items-center">
                    {syncStatus?.status === 'connected' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-600 font-medium">{t('sync.connected')}</span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="text-orange-600 font-medium">{t('sync.notConnected')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 border-t pt-6">
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={handleSyncFromSheets}
              disabled={isLoading || syncInProgress || syncFromSheetsMutation.isPending}
            >
              {syncFromSheetsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CloudCog className="mr-2 h-4 w-4" />
              )}
              {t('sync.fromSheets')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={handleSyncToSheets}
              disabled={isLoading || syncInProgress || syncToSheetsMutation.isPending}
            >
              {syncToSheetsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cloud className="mr-2 h-4 w-4" />
              )}
              {t('sync.toSheets')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sync.help')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">{t('sync.fromSheetsTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('sync.fromSheetsDescription')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('sync.toSheetsTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('sync.toSheetsDescription')}</p>
            </div>
            <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
              <h3 className="font-semibold text-amber-800 mb-1">{t('sync.note')}</h3>
              <p className="text-sm text-amber-700">{t('sync.noteDescription')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SyncManagement;