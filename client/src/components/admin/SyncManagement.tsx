import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CloudCog, CloudOff, CheckCircle, AlertCircle, RefreshCw, Cloud, Languages, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types';

type SyncStatus = {
  lastSync: string | null;
  status: string;
  dataSource?: string;
  dataSourceName?: string;
  userRole?: string;
};

type DataSourceOption = {
  id: string;
  name: string;
  description: string;
};

const SyncManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('default');
  
  // Predefined data sources
  const dataSources: DataSourceOption[] = [
    { id: 'default', name: 'AsahiJapanTours', description: 'Default data source for regular customers' },
    { id: '1Z7o-i4dfVlXKp599OGDOZCgxwSS3epxgMLi57-t3r6A', name: 'AsahiJapanTours_NamA', description: 'Data source for Nam A Travel Agency' }
  ];

  // Fetch last sync timestamp
  const { data: syncStatus, isLoading, error, refetch } = useQuery<SyncStatus>({
    queryKey: ['/api/sync/status'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  // Mutation to sync data from Google Sheets to local storage
  const syncFromSheetsMutation = useMutation({
    mutationFn: async () => {
      const payload = syncStatus?.userRole === 'admin' ? { dataSource: selectedDataSource } : {};
      const res = await apiRequest('POST', '/api/sync/from-sheets', payload);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('sync.fromSheetsSuccess') + 
          (data.dataSource && data.dataSource !== 'default' 
            ? ` (Agency: ${data.dataSource})` 
            : ''),
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
    mutationFn: async (params: { language: Language, dataSource?: string }) => {
      const res = await apiRequest('POST', '/api/sync/to-sheets', params);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('sync.toSheetsSuccess') + 
          (data.language && data.language !== 'en' 
            ? ` (${t(`languages.${data.language}`)})` 
            : '') +
          (data.dataSource && data.dataSource !== 'default' 
            ? ` [Agency: ${data.dataSource}]` 
            : ''),
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
    syncToSheetsMutation.mutate({
      language: selectedLanguage,
      dataSource: syncStatus?.userRole === 'admin' ? selectedDataSource : undefined
    });
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
                    {syncStatus?.status === 'synced' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-green-600 font-medium">Synchronized</span>
                      </>
                    ) : syncStatus?.status === 'error' ? (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-600 font-medium">Synchronization Error</span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="text-orange-600 font-medium">Not Synchronized</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Data Source Information */}
                {syncStatus?.dataSource && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Current Data Source</p>
                    <div className="mt-1 flex items-center">
                      <Cloud className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="font-semibold text-blue-700">
                        {syncStatus.dataSourceName || 
                          (syncStatus.dataSource === 'default' 
                            ? 'Default Spreadsheet' 
                            : `Agency Spreadsheet: ${syncStatus.dataSource}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-blue-600">
                      {syncStatus.dataSource !== 'default' && syncStatus.dataSource && 
                        <span className="block">Spreadsheet ID: {syncStatus.dataSource}</span>
                      }
                      {syncStatus.userRole && (
                        <span>User role: {syncStatus.userRole}</span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Admin-only data source selector */}
                {syncStatus?.userRole === 'admin' && (
                  <div>
                    <p className="text-sm font-medium">Select Data Source</p>
                    <div className="mt-2">
                      <Select value={selectedDataSource} onValueChange={(value: string) => setSelectedDataSource(value)}>
                        <SelectTrigger className="w-full md:w-[240px]">
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Data Sources</SelectLabel>
                            {dataSources.map(source => (
                              <SelectItem key={source.id} value={source.id}>
                                {source.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        As an admin, you can select which data source to sync with.
                      </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium">{t('sync.exportLanguage')}</p>
                  <div className="mt-2">
                    <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
                      <SelectTrigger className="w-full md:w-[240px]">
                        <SelectValue placeholder={t('common.selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t('common.languages')}</SelectLabel>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t('sync.exportLanguageHelp')}
                    </p>
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
              title={t('sync.exportWithLanguage', { language: t(`languages.${selectedLanguage}`) })}
            >
              {syncToSheetsMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
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
            
            {/* Agency Data Source Information */}
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
              <h3 className="flex items-center font-semibold text-blue-800 mb-1">
                <Database className="h-4 w-4 mr-1" />
                Multi-Source Data Handling
              </h3>
              <p className="text-sm text-blue-700">
                The system now supports multiple data sources for different user roles. 
                Admins can view and sync data from the default spreadsheet, while agency users 
                work with their own dedicated spreadsheets.
              </p>
              {syncStatus?.dataSource && syncStatus.dataSource !== 'default' && (
                <p className="mt-2 text-sm text-blue-800 font-medium">
                  You are currently working with an agency-specific data source: <span className="font-bold">{syncStatus.dataSource}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SyncManagement;