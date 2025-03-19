import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Vehicle } from '@/types';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Search, Plus, Edit, Trash } from 'lucide-react';

// Form schema
const vehicleSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  seats: z.coerce.number().min(1, 'Seats must be at least 1'),
  pricePerDay: z.coerce.number().min(1, 'Price must be at least 1'),
  driverCostPerDay: z.coerce.number().min(0, 'Driver cost must be at least 0'),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const VehicleManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  
  // Get all vehicles
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  // Filter vehicles by search term
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Form
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: '',
      seats: 5,
      pricePerDay: 0,
      driverCostPerDay: 5000,
    },
  });
  
  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const response = await apiRequest('POST', '/api/vehicles', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Vehicle created successfully',
      });
      setIsFormDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to create vehicle',
        variant: 'destructive',
      });
    },
  });
  
  // Update vehicle mutation
  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: VehicleFormValues }) => {
      const response = await apiRequest('PUT', `/api/vehicles/${id}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Vehicle updated successfully',
      });
      setIsFormDialogOpen(false);
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to update vehicle',
        variant: 'destructive',
      });
    },
  });
  
  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/vehicles/${id}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Vehicle deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message || 'Failed to delete vehicle',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: VehicleFormValues) => {
    if (selectedVehicle) {
      updateVehicleMutation.mutate({ id: selectedVehicle.id, values });
    } else {
      createVehicleMutation.mutate(values);
    }
  };
  
  // Handle edit vehicle
  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    form.reset({
      name: vehicle.name,
      seats: vehicle.seats,
      pricePerDay: vehicle.pricePerDay,
      driverCostPerDay: vehicle.driverCostPerDay,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle delete vehicle
  const handleDeleteVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle add new vehicle
  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    form.reset({
      name: '',
      seats: 5,
      pricePerDay: 0,
      driverCostPerDay: 5000,
    });
    setIsFormDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedVehicle) {
      deleteVehicleMutation.mutate(selectedVehicle.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('admin.vehicleManagement')}</CardTitle>
          <Button onClick={handleAddVehicle}>
            <Plus className="mr-2 h-4 w-4" /> {t('admin.addNewVehicle')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`${t('common.search')} ${t('admin.vehicleManagement').toLowerCase()}...`}
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
                <TableHead>{t('admin.vehicleName')}</TableHead>
                <TableHead>{t('admin.seats')}</TableHead>
                <TableHead>{t('admin.pricePerDay')} (JPY)</TableHead>
                <TableHead>{t('admin.driverCostPerDay')} (JPY)</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>{vehicle.seats}</TableCell>
                    <TableCell>{vehicle.pricePerDay.toLocaleString()}</TableCell>
                    <TableCell>{vehicle.driverCostPerDay.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditVehicle(vehicle)}>
                          <Edit className="h-4 w-4 text-secondary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
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
        
        {/* Add/Edit Vehicle Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedVehicle ? t('common.edit') : t('common.add')} {t('admin.vehicleManagement')}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.vehicleName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Small Van (5 seats)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.seats')}</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
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
                
                <FormField
                  control={form.control}
                  name="driverCostPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.driverCostPerDay')} (JPY)</FormLabel>
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
                    disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                  >
                    {createVehicleMutation.isPending || updateVehicleMutation.isPending
                      ? t('common.loading')
                      : selectedVehicle 
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
              <DialogTitle>{t('common.delete')} {t('admin.vehicleManagement')}</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete the vehicle "{selectedVehicle?.name}"? This action cannot be undone.
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
                disabled={deleteVehicleMutation.isPending}
              >
                {deleteVehicleMutation.isPending ? t('common.loading') : t('common.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VehicleManagement;
