import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface TwoFactorManageProps {
  enabled?: boolean;
  onEnable?: () => void;
  onDisable?: () => void;
}

export const TwoFactorManage = ({ enabled = false, onEnable, onDisable }: TwoFactorManageProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <ShieldCheck className="h-5 w-5 text-green-500" /> : <ShieldAlert className="h-5 w-5" />}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {enabled ? "2FA is enabled on your account" : "2FA is not enabled"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Two-factor authentication is not yet implemented in this version.
        </p>
        <Button disabled variant="outline">
          {enabled ? "Disable 2FA" : "Enable 2FA"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TwoFactorManage;
