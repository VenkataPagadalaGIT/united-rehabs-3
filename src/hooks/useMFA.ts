import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type MFAStatus = "none" | "pending" | "verified";

export function useMFA() {
  const [mfaStatus, setMFAStatus] = useState<MFAStatus>("none");
  const [hasMFAEnabled, setHasMFAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkMFAStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check current assurance level
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (aalError) {
        console.error("Error checking AAL:", aalError);
        setMFAStatus("none");
        setHasMFAEnabled(false);
        return;
      }

      // Check if user has MFA factors enrolled
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error("Error listing factors:", factorsError);
        setMFAStatus("none");
        setHasMFAEnabled(false);
        return;
      }

      const hasVerifiedFactor = factorsData.totp?.some(f => f.status === "verified") || false;
      setHasMFAEnabled(hasVerifiedFactor);

      if (!hasVerifiedFactor) {
        // No MFA set up
        setMFAStatus("none");
      } else if (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal2") {
        // MFA is set up but not verified this session
        setMFAStatus("pending");
      } else if (aalData.currentLevel === "aal2") {
        // MFA verified
        setMFAStatus("verified");
      } else {
        setMFAStatus("none");
      }
    } catch (err) {
      console.error("MFA check error:", err);
      setMFAStatus("none");
      setHasMFAEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkMFAStatus();

    // Re-check on auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkMFAStatus();
    });

    return () => subscription.unsubscribe();
  }, [checkMFAStatus]);

  return {
    mfaStatus,
    hasMFAEnabled,
    isLoading,
    refreshMFAStatus: checkMFAStatus,
  };
}
