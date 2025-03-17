import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { CalculatorContext } from '@/context/CalculatorContext';
import { useAuth } from '@/hooks/useAuth';
import { Tour, Vehicle } from '@/types';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Clock, 
  Car, 
  User, 
  Banknote 
} from 'lucide-react';

const Step2ServiceSelection = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Fetch tours
  const { data: tours = [], isLoading: isLoadingTours } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
  });

  // Fetch vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Get selected tour and vehicle details
  const selectedTour = tours.find(tour => tour.id === formData.tourId);
  const selectedVehicle = vehicles.find(vehicle => vehicle.id === formData.vehicleId);

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.selectServices')}
      </h2>
      
      <div className="space-y-6">
        {/* Tour Selection */}
        <div>
          <Label className="block text-sm font-medium text-neutral mb-2">
            {t('calculator.selectTour')}
          </Label>
          
          {isLoadingTours ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Select 
              value={formData.tourId ? formData.tourId.toString() : ""}
              onValueChange={(value) => updateFormData({ tourId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tour" />
              </SelectTrigger>
              <SelectContent>
                {tours.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id.toString()}>
                    {tour.name} - {tour.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Selected Tour Card */}
          {selectedTour && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>{selectedTour.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> {selectedTour.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{selectedTour.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {selectedTour.durationDays} {selectedTour.durationDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-2">
                <div className="text-sm font-medium flex items-center">
                  <Banknote className="h-4 w-4 mr-1 text-green-600" />
                  {isAdmin ? (
                    <>Base price: {selectedTour.basePrice.toLocaleString()} JPY per person</>
                  ) : (
                    <>Tour duration: {selectedTour.durationDays} {selectedTour.durationDays === 1 ? 'day' : 'days'}</>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Vehicle Selection */}
        <div className="pt-2">
          <Label className="block text-sm font-medium text-neutral mb-2">
            {t('calculator.selectVehicle')}
          </Label>
          
          {isLoadingVehicles ? (
            <Skeleton className="w-full h-10" />
          ) : (
            <Select 
              value={formData.vehicleId ? formData.vehicleId.toString() : ""}
              onValueChange={(value) => updateFormData({ vehicleId: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                    {vehicle.name} - {vehicle.seats} seats, {vehicle.luggageCapacity} suitcases
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Selected Vehicle Card */}
          {selectedVehicle && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle>{selectedVehicle.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <User className="h-4 w-4 mr-1" /> {selectedVehicle.seats} seats | {selectedVehicle.luggageCapacity} suitcases
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Vehicle Price:</span>
                      <div className="font-medium">{selectedVehicle.pricePerDay.toLocaleString()} JPY per day</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Driver Cost:</span>
                      <div className="font-medium">{selectedVehicle.driverCostPerDay.toLocaleString()} JPY per day</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-muted-foreground">Passenger Capacity:</span>
                      <div className="font-medium">{selectedVehicle.seats} people</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Luggage Capacity:</span>
                      <div className="font-medium">{selectedVehicle.luggageCapacity} suitcases</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2ServiceSelection;
