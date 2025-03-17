import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Guide } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Search, Plus, Edit, Trash, Languages } from 'lucide-react';

// Form schema
const guideSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  pricePerDay: z.coerce.number().min(1, 'Price must be at least 1'),
});

type GuideFormValues = z.infer<typeof guideSchema>;

const GuideManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Available languages for guides
  const availableLanguages = [
    { id: 'english', label: t('languages.en') },
    { id: 'japanese', label: t('languages.ja') },
    { id: 'chinese', label: t('languages.zh') },
    { id: 'korean', label: t('languages.ko') },
    { id: 'vietnamese', label: t('languages.vi') },
  ];
  
  // Get all guides
  const { data: guides = [], isLoading } = useQuery<Guide[]>({
    queryKey: ['/api/guides'],
  });
  
  // Filter guides by search term
  const filteredGuides = guides.filter(guide => 
    guide.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Form
  const form = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: {
      name: '',
      languages: ['english'],
      pricePerDay: 0,
    },
  });
  
  // Create guide mutation
  const createGuideMutation = useMutation({
    mutationFn: async (values: GuideFormValues) => {
      const response = await apiRequest('POST', '/api/guides', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide created successfully',
      });
      setIsFormDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create guide',
        variant: 'destructive',
      });
    },
  });
  
  // Update guide mutation
  const updateGuideMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: GuideFormValues }) => {
      const response = await apiRequest('PUT', `/api/guides/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide updated successfully',
      });
      setIsFormDialogOpen(false);
      setSelectedGuide(null);
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update guide',
        variant: 'destructive',
      });
    },
  });
  
  // Delete guide mutation
  const deleteGuideMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/guides/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Guide deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete guide',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: GuideFormValues) => {
    if (selectedGuide) {
      updateGuideMutation.mutate({ id: selectedGuide.id, values });
    } else {
      createGuideMutation.mutate(values);
    }
  };
  
  // Handle edit guide
  const handleEditGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    form.reset({
      name: guide.name,
      languages: guide.languages,
      pricePerDay: guide.pricePerDay,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle delete guide
  const handleDeleteGuide = (guide: Guide) => {
    setSelectedGuide(guide);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add new guide
  const handleAddGuide = () => {
    setSelectedGuide(null);
    form.reset({
      name: '',
      languages: ['english'],
      pricePerDay: 0,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedGuide) {
      deleteGuideMutation.mutate(selectedGuide.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('admin.guideManagement')}</CardTitle>
          <Button onClick={handleAddGuide}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.addNewGuide')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} ${t('admin.guideManagement').toLowerCase()}...`}
              className="pl-10 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.guideName')}</TableHead>
                <TableHead>{t('admin.languages')}</TableHead>
                <TableHead>{t('admin.pricePerDay')} (JPY)</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredGuides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No guides found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuides.map((guide) => (
                  <TableRow key={guide.id}>
                    <TableCell>{guide.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang === 'english' ? t('languages.en') : 
                             lang === 'japanese' ? t('languages.ja') :
                             lang === 'chinese' ? t('languages.zh') :
                             lang === 'korean' ? t('languages.ko') :
                             lang === 'vietnamese' ? t('languages.vi') : lang}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{guide.pricePerDay.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditGuide(guide)}>
                          <Edit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGuide(guide)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Add/Edit Guide Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedGuide ? t('common.edit') : t('common.add')} {t('admin.guideManagement')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.guideName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Tanaka Yuki" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">{t('admin.languages')}</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {availableLanguages.map((language) => (
                          <FormItem
                            key={language.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={form.watch('languages').includes(language.id)}
                                onCheckedChange={(checked) => {
                                  const currentLanguages = form.getValues('languages');
                                  if (checked) {
                                    form.setValue('languages', [...currentLanguages, language.id]);
                                  } else {
                                    form.setValue(
                                      'languages',
                                      currentLanguages.filter((lang) => lang !== language.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {language.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pricePerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.pricePerDay')} (JPY)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsFormDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createGuideMutation.isPending || updateGuideMutation.isPending}
                  >
                    {createGuideMutation.isPending || updateGuideMutation.isPending
                      ? t('common.loading')
                      : selectedGuide 
                        ? t('common.save')
                        : t('common.add')
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.delete')} {t('admin.guideManagement')}</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the guide "{selectedGuide?.name}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteGuideMutation.isPending}
              >
                {deleteGuideMutation.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GuideManagement;
