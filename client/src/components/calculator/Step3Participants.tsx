import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorContext } from '@/context/CalculatorContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users } from 'lucide-react';

const PARTICIPANT_OPTIONS = [...Array(20)].map((_, i) => i + 1);

const Step3Participants = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Handle participants change
  const handleParticipantsChange = (value: string) => {
    updateFormData({ participants: parseInt(value) });
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
            Select the number of people participating in the tour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label htmlFor="participants" className="block mb-2">
              Number of participants
            </Label>
            <Select
              value={formData.participants.toString()}
              onValueChange={handleParticipantsChange}
            >
              <SelectTrigger id="participants">
                <SelectValue placeholder="Select number of participants" />
              </SelectTrigger>
              <SelectContent>
                {PARTICIPANT_OPTIONS.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'person' : 'people'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
