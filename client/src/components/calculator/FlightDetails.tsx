import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalculatorContext } from "@/context/CalculatorContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const FlightDetails = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Đã thêm giá trị mặc định là 'unknown' nếu không có giá trị
  const arrivalTime = formData.arrivalTime || 'unknown';
  const departureTime = formData.departureTime || 'unknown';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("flight_details")}</CardTitle>
        <CardDescription>{t("flight_details_description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {t("flight_time_note")}
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="text-lg font-medium mb-3">{t("arrival_time")}</h3>
          <div className="mb-2 text-sm text-muted-foreground">
            {t("arrival_time_help")}
          </div>
          <RadioGroup
            value={arrivalTime}
            onValueChange={(value) => updateFormData({ arrivalTime: value as 'morning' | 'afternoon' | 'unknown' })}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="morning" id="arrival-morning" />
              <Label htmlFor="arrival-morning" className="font-normal">
                {t("morning_arrival")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("morning_arrival_description")}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="afternoon" id="arrival-afternoon" />
              <Label htmlFor="arrival-afternoon" className="font-normal">
                {t("afternoon_arrival")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("afternoon_arrival_description")}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="arrival-unknown" />
              <Label htmlFor="arrival-unknown" className="font-normal">
                {t("unknown_arrival")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("unknown_arrival_description")}
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">{t("departure_time")}</h3>
          <div className="mb-2 text-sm text-muted-foreground">
            {t("departure_time_help")}
          </div>
          <RadioGroup
            value={departureTime}
            onValueChange={(value) => updateFormData({ departureTime: value as 'morning' | 'afternoon' | 'unknown' })}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="morning" id="departure-morning" />
              <Label htmlFor="departure-morning" className="font-normal">
                {t("morning_departure")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("morning_departure_description")}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="afternoon" id="departure-afternoon" />
              <Label htmlFor="departure-afternoon" className="font-normal">
                {t("afternoon_departure")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("afternoon_departure_description")}
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="departure-unknown" />
              <Label htmlFor="departure-unknown" className="font-normal">
                {t("unknown_departure")}
                <span className="block text-sm text-muted-foreground mt-1">
                  {t("unknown_departure_description")}
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;