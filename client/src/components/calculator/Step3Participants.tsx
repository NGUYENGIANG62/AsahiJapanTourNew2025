import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorContext } from '@/context/CalculatorContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

const Step3Participants = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Handle participants change
  const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateFormData({ participants: value });
    }
  };

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-neutral mb-6">
        {t('calculator.numberOfParticipants')}
      </h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-secondary" />
            {t('calculator.numberOfParticipants')}
          </CardTitle>
          <CardDescription>
            Enter the number of people participating in the tour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="participants" className="block mb-2">
              Number of participants
            </Label>
            <Input
              id="participants"
              type="number"
              min="1"
              value={formData.participants}
              onChange={handleParticipantsChange}
              className="w-full"
              placeholder="Enter number of participants"
            />
          </div>
          
          <div className="mt-6 bg-muted/30 p-4 rounded-md">
            <h3 className="font-medium mb-2">Information</h3>
            <p className="text-sm text-muted-foreground">
              The number of participants affects:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside mt-1">
              <li>Total tour base cost (per person)</li>
              <li>Number of rooms needed for accommodation</li>
              <li>Meal costs if included</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Step3Participants;
