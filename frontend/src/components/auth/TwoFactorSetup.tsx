import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export const TwoFactorSetup = ({ onComplete }: TwoFactorSetupProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Two-factor authentication is not yet implemented in this version.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This feature will be available in a future update.
        </p>
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
