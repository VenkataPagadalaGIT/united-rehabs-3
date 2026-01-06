import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldCheck, ShieldOff, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TwoFactorSetup } from "./TwoFactorSetup";

interface Factor {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at: string;
}

export function TwoFactorManage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [factorToDisable, setFactorToDisable] = useState<string | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);

  const loadFactors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      // Combine all factor types
      const allFactors: Factor[] = [
        ...(data.totp || []),
        ...(data.phone || []),
      ];
      setFactors(allFactors);
    } catch (err) {
      console.error("Failed to load MFA factors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const handleDisable = async () => {
    if (!factorToDisable) return;

    setIsDisabling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorToDisable,
      });

      if (error) throw error;

      toast.success("Two-factor authentication disabled");
      loadFactors();
    } catch (err: any) {
      toast.error(err.message || "Failed to disable 2FA");
    } finally {
      setIsDisabling(false);
      setDisableDialogOpen(false);
      setFactorToDisable(null);
    }
  };

  const hasActiveFactor = factors.some((f) => f.status === "verified");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasActiveFactor ? (
            <>
              <Alert className="border-green-500/50 bg-green-500/10">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  Two-factor authentication is enabled
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {factors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">
                          {factor.friendly_name || "Authenticator App"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(factor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setFactorToDisable(factor.id);
                        setDisableDialogOpen(true);
                      }}
                    >
                      <ShieldOff className="h-4 w-4 mr-1" />
                      Disable
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your account is not protected by two-factor authentication
                </AlertDescription>
              </Alert>

              <Button onClick={() => setSetupOpen(true)} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetup
        open={setupOpen}
        onOpenChange={setSetupOpen}
        onSetupComplete={loadFactors}
      />

      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the extra security layer from your account. You can always enable it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisabling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={isDisabling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisabling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
