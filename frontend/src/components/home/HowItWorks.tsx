import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const benefits = [
  {
    title: "Trusted By Thousands:",
    description: "Join over 50,000 users who have successfully found the right rehab centers through our platform.",
  },
  {
    title: "Comprehensive Listings:",
    description: "Access detailed profiles of hundreds of certified rehab facilities to find the perfect match for your needs.",
  },
  {
    title: "Personalized Matches:",
    description: "Our advanced matching system considers your unique circumstances, insurance coverage, and location preferences to connect you with the best treatment options.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div>
            <p className="text-primary font-medium mb-2">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Your Journey Starts Easy
            </h2>

            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">{benefit.title}</span>
                    <span className="text-muted-foreground"> {benefit.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-card rounded-xl border p-8 shadow-lg">
            <h3 className="text-xl font-bold text-foreground text-center mb-6">
              Find Your Way
            </h3>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">What Are You Looking to Overcome?</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alcohol">Alcohol Addiction</SelectItem>
                      <SelectItem value="drug">Drug Addiction</SelectItem>
                      <SelectItem value="mental">Mental Health</SelectItem>
                      <SelectItem value="behavioral">Behavioral Addiction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">2</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">What Type of Rehab Fits You?</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inpatient">Inpatient</SelectItem>
                      <SelectItem value="outpatient">Outpatient</SelectItem>
                      <SelectItem value="detox">Detox</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">What's Your Insurance Plan?</p>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aetna">Aetna</SelectItem>
                      <SelectItem value="cigna">Cigna</SelectItem>
                      <SelectItem value="bluecross">Blue Cross</SelectItem>
                      <SelectItem value="none">No Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                Find Rehab
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
