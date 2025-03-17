import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Hotel } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Search, Plus, Edit, Trash, Star } from 'lucide-react';

// Form schema
const hotelSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  stars: z.coerce.number().min(3).max(5, 'Stars must be between 3 and 5'),
  singleRoomPrice: z.coerce.number().min(1, 'Price must be at least 1'),
  doubleRoomPrice: z.coerce.number().min(1, 'Price must be at least 1'),
  tripleRoomPrice: z.coerce.number().min(1, 'Price must be at least 1'),
  breakfastPrice: z.coerce.number().min(0, 'Price must be at least 0'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

const HotelManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Get all hotels
  const { data: hotels = [], isLoading } = useQuery<Hotel[]>({
    queryKey: ['/api/hotels'],
  });
  
  // Filter hotels by search term
  const filteredHotels = hotels.filter(hotel => 
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Form
  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: '',
      location: '',
      stars: 3,
      singleRoomPrice: 0,
      doubleRoomPrice: 0,
      tripleRoomPrice: 0,
      breakfastPrice: 0,
      imageUrl: '',
    },
  });
  
  // Create hotel mutation
  const createHotelMutation = useMutation({
    mutationFn: async (values: HotelFormValues) => {
      const response = await apiRequest('POST', '/api/hotels', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Hotel created successfully',
      });
      setIsFormDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create hotel',
        variant: 'destructive',
      });
    },
  });
  
  // Update hotel mutation
  const updateHotelMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: HotelFormValues }) => {
      const response = await apiRequest('PUT', `/api/hotels/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Hotel updated successfully',
      });
      setIsFormDialogOpen(false);
      setSelectedHotel(null);
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update hotel',
        variant: 'destructive',
      });
    },
  });
  
  // Delete hotel mutation
  const deleteHotelMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/hotels/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Hotel deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedHotel(null);
      queryClient.invalidateQueries({ queryKey: ['/api/hotels'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete hotel',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: HotelFormValues) => {
    if (selectedHotel) {
      updateHotelMutation.mutate({ id: selectedHotel.id, values });
    } else {
      createHotelMutation.mutate(values);
    }
  };
  
  // Handle edit hotel
  const handleEditHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    form.reset({
      name: hotel.name,
      location: hotel.location,
      stars: hotel.stars,
      singleRoomPrice: hotel.singleRoomPrice,
      doubleRoomPrice: hotel.doubleRoomPrice,
      tripleRoomPrice: hotel.tripleRoomPrice,
      breakfastPrice: hotel.breakfastPrice,
      imageUrl: hotel.imageUrl || '',
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle delete hotel
  const handleDeleteHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add new hotel
  const handleAddHotel = () => {
    setSelectedHotel(null);
    form.reset({
      name: '',
      location: '',
      stars: 3,
      singleRoomPrice: 0,
      doubleRoomPrice: 0,
      tripleRoomPrice: 0,
      breakfastPrice: 0,
      imageUrl: '',
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedHotel) {
      deleteHotelMutation.mutate(selectedHotel.id);
    }
  };
  
  // Render stars
  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 inline" />);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('admin.hotelManagement')}</CardTitle>
          <Button onClick={handleAddHotel}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.addNewHotel')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} ${t('admin.hotelManagement').toLowerCase()}...`}
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
                <TableHead>{t('admin.hotelName')}</TableHead>
                <TableHead>{t('admin.location')}</TableHead>
                <TableHead>{t('admin.stars')}</TableHead>
                <TableHead>{t('admin.singleRoomPrice')} (JPY)</TableHead>
                <TableHead>{t('admin.doubleRoomPrice')} (JPY)</TableHead>
                <TableHead>{t('admin.breakfastPrice')} (JPY)</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredHotels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No hotels found
                  </TableCell>
                </TableRow>
              ) : (
                filteredHotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>{hotel.name}</TableCell>
                    <TableCell>{hotel.location}</TableCell>
                    <TableCell>{renderStars(hotel.stars)}</TableCell>
                    <TableCell>{hotel.singleRoomPrice.toLocaleString()}</TableCell>
                    <TableCell>{hotel.doubleRoomPrice.toLocaleString()}</TableCell>
                    <TableCell>{hotel.breakfastPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditHotel(hotel)}>
                          <Edit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteHotel(hotel)}>
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
        
        {/* Add/Edit Hotel Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedHotel ? t('common.edit') : t('common.add')} {t('admin.hotelManagement')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.hotelName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Tokyo Plaza Hotel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="stars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.stars')}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select star rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3">3 {renderStars(3)}</SelectItem>
                          <SelectItem value="4">4 {renderStars(4)}</SelectItem>
                          <SelectItem value="5">5 {renderStars(5)}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="singleRoomPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.singleRoomPrice')} (JPY)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="doubleRoomPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.doubleRoomPrice')} (JPY)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tripleRoomPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.tripleRoomPrice')} (JPY)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="breakfastPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.breakfastPrice')} (JPY)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                    disabled={createHotelMutation.isPending || updateHotelMutation.isPending}
                  >
                    {createHotelMutation.isPending || updateHotelMutation.isPending
                      ? t('common.loading')
                      : selectedHotel 
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
              <DialogTitle>{t('common.delete')} {t('admin.hotelManagement')}</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the hotel "{selectedHotel?.name}"? This action cannot be undone.
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
                disabled={deleteHotelMutation.isPending}
              >
                {deleteHotelMutation.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default HotelManagement;
