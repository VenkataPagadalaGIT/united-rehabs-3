import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Phone, Shield } from "lucide-react";

const insuranceProviders = [
  "Aetna",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "UnitedHealthcare",
  "Medicare",
  "Medicaid",
  "Other",
];

export function InsuranceForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    insurance: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-2xl border border-border/50 w-full max-w-md">
      <h3 className="text-xl font-bold text-foreground mb-2">
        Verify Your Insurance
      </h3>
      <p className="text-muted-foreground text-sm mb-6">
        Check your coverage in under 5 minutes
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="pl-10 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="pl-10 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="relative">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Select
            value={formData.insurance}
            onValueChange={(value) =>
              setFormData({ ...formData, insurance: value })
            }
          >
            <SelectTrigger className="pl-10 h-12 bg-background border-border text-foreground">
              <SelectValue placeholder="Select Insurance" />
            </SelectTrigger>
            <SelectContent>
              {insuranceProviders.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
        >
          Verify Coverage
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Your information is 100% confidential
      </p>
    </div>
  );
}
