import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tour } from '@/types';
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Search, Plus, Edit, Trash } from 'lucide-react';

// Form schema
const tourSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  basePrice: z.coerce.number().min(1, 'Price must be at least 1'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  // i18n fields - optional
  nameJa: z.string().optional(),
  nameZh: z.string().optional(),
  nameKo: z.string().optional(),
  nameVi: z.string().optional(),
  descriptionJa: z.string().optional(),
  descriptionZh: z.string().optional(),
  descriptionKo: z.string().optional(),
  descriptionVi: z.string().optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

const TourManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Get all tours
  const { data: tours = [], isLoading } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });
  
  // Update AVF codes mutation
  const updateAvfCodesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tours/update-avf-codes', undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Đã cập nhật mã AVF cho tất cả tour thành công',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Không thể cập nhật mã AVF',
        variant: 'destructive',
      });
    },
  });
  
  // Filter tours by search term
  const filteredTours = tours.filter(tour => 
    tour.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tour.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Form
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: '',
      code: '',
      location: '',
      description: '',
      durationDays: 1,
      basePrice: 0,
      imageUrl: '',
    },
  });
  
  // Create tour mutation
  const createTourMutation = useMutation({
    mutationFn: async (values: TourFormValues) => {
      const response = await apiRequest('POST', '/api/tours', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tour created successfully',
      });
      setIsFormDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create tour',
        variant: 'destructive',
      });
    },
  });
  
  // Update tour mutation
  const updateTourMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: TourFormValues }) => {
      const response = await apiRequest('PUT', `/api/tours/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tour updated successfully',
      });
      setIsFormDialogOpen(false);
      setSelectedTour(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update tour',
        variant: 'destructive',
      });
    },
  });
  
  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/tours/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Tour deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedTour(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete tour',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: TourFormValues) => {
    if (selectedTour) {
      updateTourMutation.mutate({ id: selectedTour.id, values });
    } else {
      createTourMutation.mutate(values);
    }
  };
  
  // Handle edit tour
  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour);
    form.reset({
      name: tour.name,
      code: tour.code,
      location: tour.location,
      description: tour.description,
      durationDays: tour.durationDays,
      basePrice: tour.basePrice,
      imageUrl: tour.imageUrl || '',
      nameJa: tour.nameJa || '',
      nameZh: tour.nameZh || '',
      nameKo: tour.nameKo || '',
      nameVi: tour.nameVi || '',
      descriptionJa: tour.descriptionJa || '',
      descriptionZh: tour.descriptionZh || '',
      descriptionKo: tour.descriptionKo || '',
      descriptionVi: tour.descriptionVi || '',
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle delete tour
  const handleDeleteTour = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add new tour
  const handleAddTour = () => {
    setSelectedTour(null);
    form.reset({
      name: '',
      code: '',
      location: '',
      description: '',
      durationDays: 1,
      basePrice: 0,
      imageUrl: '',
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedTour) {
      deleteTourMutation.mutate(selectedTour.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('admin.tourManagement')}</CardTitle>
          <Button onClick={handleAddTour}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.addNewTour')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} ${t('admin.tourManagement').toLowerCase()}...`}
              className="pl-10 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => updateAvfCodesMutation.mutate()}
            disabled={updateAvfCodesMutation.isPending}
            variant="outline"
          >
            {updateAvfCodesMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật mã AVF'}
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.tourName')}</TableHead>
                <TableHead>{t('admin.code')}</TableHead>
                <TableHead>Mã AVF</TableHead>
                <TableHead>{t('admin.location')}</TableHead>
                <TableHead>{t('admin.duration')}</TableHead>
                <TableHead>{t('admin.basePrice')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No tours found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>{tour.name}</TableCell>
                    <TableCell>{tour.code}</TableCell>
                    <TableCell>{tour.avfCode || '-'}</TableCell>
                    <TableCell>{tour.location}</TableCell>
                    <TableCell>{tour.durationDays} {tour.durationDays === 1 ? 'day' : 'days'}</TableCell>
                    <TableCell>{tour.basePrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditTour(tour)}>
                          <Edit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTour(tour)}>
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
        
        {/* Add/Edit Tour Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTour ? t('common.edit') : t('common.add')} {t('admin.tourManagement')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.tourName')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Tokyo Highlights" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder="TYO-HL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.location')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Tokyo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="durationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.duration')} (days)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed description of the tour..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.basePrice')} (JPY)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.imageUrl')}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* i18n fields - collapsible for simplicity */}
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">
                    Translations (optional)
                  </summary>
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nameJa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Japanese)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameZh"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Chinese)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nameKo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Korean)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameVi"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Vietnamese)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Description translations */}
                    <FormField
                      control={form.control}
                      name="descriptionJa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Japanese)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descriptionZh"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Chinese)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descriptionKo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Korean)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="descriptionVi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Vietnamese)</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </details>
                
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
                    disabled={createTourMutation.isPending || updateTourMutation.isPending}
                  >
                    {createTourMutation.isPending || updateTourMutation.isPending
                      ? t('common.loading')
                      : selectedTour 
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
              <DialogTitle>{t('common.delete')} {t('admin.tourManagement')}</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the tour "{selectedTour?.name}"? This action cannot be undone.
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
                disabled={deleteTourMutation.isPending}
              >
                {deleteTourMutation.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TourManagement;
