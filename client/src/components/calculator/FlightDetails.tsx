import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalculatorContext } from "@/context/CalculatorContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, PlaneTakeoff, PlaneLanding } from "lucide-react";

const FlightDetails = () => {
  const { t } = useTranslation();
  const { formData, updateFormData } = useContext(CalculatorContext);

  // Đã thêm giá trị mặc định là 'unknown' nếu không có giá trị
  const arrivalTime = formData.arrivalTime || 'unknown';
  const departureTime = formData.departureTime || 'unknown';

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-slate-50 border-b py-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="text-primary">{t("flight_details")}</span>
        </CardTitle>
        <CardDescription className="text-sm">
          {t("flight_details_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <Alert className="bg-blue-50 border-blue-200 shadow-sm mb-5">
          <InfoIcon className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-800 font-medium">
            {t("flight_time_note")}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Arrival Time Section */}
          <div className="border rounded-md p-4 bg-slate-50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PlaneLanding className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-primary">{t("arrival_time")}</h3>
            </div>
            <div className="mb-3 text-sm text-slate-600 font-medium">
              {t("arrival_time_help")}
            </div>
            <RadioGroup
              value={arrivalTime}
              onValueChange={(value) => updateFormData({ arrivalTime: value as 'morning' | 'afternoon' | 'unknown' })}
              className="flex flex-col gap-2"
            >
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="morning" id="arrival-morning" className="mt-1" />
                <Label htmlFor="arrival-morning" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("morning_arrival")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("morning_arrival_description")}
                  </span>
                </Label>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="afternoon" id="arrival-afternoon" className="mt-1" />
                <Label htmlFor="arrival-afternoon" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("afternoon_arrival")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("afternoon_arrival_description")}
                  </span>
                </Label>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="unknown" id="arrival-unknown" className="mt-1" />
                <Label htmlFor="arrival-unknown" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("unknown_arrival")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("unknown_arrival_description")}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Departure Time Section */}
          <div className="border rounded-md p-4 bg-slate-50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <PlaneTakeoff className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-primary">{t("departure_time")}</h3>
            </div>
            <div className="mb-3 text-sm text-slate-600 font-medium">
              {t("departure_time_help")}
            </div>
            <RadioGroup
              value={departureTime}
              onValueChange={(value) => updateFormData({ departureTime: value as 'morning' | 'afternoon' | 'unknown' })}
              className="flex flex-col gap-2"
            >
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="morning" id="departure-morning" className="mt-1" />
                <Label htmlFor="departure-morning" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("morning_departure")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("morning_departure_description")}
                  </span>
                </Label>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="afternoon" id="departure-afternoon" className="mt-1" />
                <Label htmlFor="departure-afternoon" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("afternoon_departure")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("afternoon_departure_description")}
                  </span>
                </Label>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <RadioGroupItem value="unknown" id="departure-unknown" className="mt-1" />
                <Label htmlFor="departure-unknown" className="font-semibold cursor-pointer text-slate-700 text-sm">
                  {t("unknown_departure")}
                  <span className="block text-xs font-normal text-slate-600 mt-1">
                    {t("unknown_departure_description")}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;