import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Info } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "unitedrehabs_disclaimer_consent";
const CONSENT_VERSION = "1.0";

export function DisclaimerConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();

  // Don't show on admin pages
  const isAdminPage = location.pathname.startsWith("/you-are-the-admin");

  useEffect(() => {
    if (isAdminPage) {
      setShowBanner(false);
      return;
    }
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent || JSON.parse(consent).version !== CONSENT_VERSION) {
      // Small delay to let page render first - better for SEO
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAdminPage]);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      agreed: true
    }));
    setShowBanner(false);
  };

  const handleDismiss = () => {
    // Allow dismissing without full acceptance, but show again next visit
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg animate-in slide-in-from-bottom duration-300"
      role="alert"
      aria-label="Legal disclaimer"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon and Message */}
          <div className="flex items-start gap-3 flex-1">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground">
                <strong>Important:</strong> This website provides general information only and is not a substitute for professional medical advice.
                Statistics are for informational purposes only.
              </p>
              <p className="text-muted-foreground mt-1">
                By using this site, you agree to our{" "}
                <Link to="/legal-disclaimer" className="text-primary hover:underline">Legal Disclaimer</Link>,{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>, and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button 
              onClick={handleAccept}
              size="sm"
              className="flex-1 md:flex-none"
            >
              I Understand
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="px-2"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
