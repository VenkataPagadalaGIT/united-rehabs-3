import { useState, useEffect } from "react";

export const useMFA = () => {
  const [mfaStatus, setMfaStatus] = useState<"none" | "enabled" | "pending">("none");
  const [isLoading, setIsLoading] = useState(false);

  const refreshMFAStatus = () => {
    // MFA is not implemented yet - placeholder
    setMfaStatus("none");
  };

  useEffect(() => {
    refreshMFAStatus();
  }, []);

  return {
    mfaStatus,
    isLoading,
    refreshMFAStatus,
  };
};
