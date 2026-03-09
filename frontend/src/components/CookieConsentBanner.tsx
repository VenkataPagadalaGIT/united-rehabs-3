import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X, Info } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "unitedrehabs_consent";
const CONSENT_VERSION = "2.0";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/you-are-the-admin");

  useEffect(() => {
    if (isAdminPage) return;
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent || JSON.parse(consent).version !== CONSENT_VERSION) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isAdminPage]);

  const handleAccept = (cookieLevel: "all" | "essential") => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      cookies: cookieLevel,
      disclaimer: true,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300"
      role="alert"
    >
      <div className="container mx-auto max-w-4xl px-4 py-4">
        {/* Medical Disclaimer */}
        <div className="flex items-start gap-2 mb-3 pb-3 border-b border-border">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Important:</strong> This website provides general information only and is not a substitute for professional medical advice.
            By using this site, you agree to our{" "}
            <Link to="/legal-disclaimer" className="text-primary hover:underline">Legal Disclaimer</Link>,{" "}
            <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>, and{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        {/* Cookie Consent */}
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              We use cookies to enhance your experience and analyze site traffic.
              See our <Link to="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>

            {showDetails && (
              <div className="bg-muted/50 rounded-lg p-3 mt-3 mb-1 space-y-2 text-xs">
                <div>
                  <span className="font-medium text-foreground">Essential</span>
                  <span className="text-muted-foreground"> — Required for basic site functionality.</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Analytics</span>
                  <span className="text-muted-foreground"> — Help us understand how visitors use the site.</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Marketing</span>
                  <span className="text-muted-foreground"> — Used to deliver relevant ads and track campaigns.</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Button onClick={() => handleAccept("all")} size="sm">
                Accept All
              </Button>
              <Button onClick={() => handleAccept("essential")} variant="outline" size="sm">
                Essential Only
              </Button>
              <Button onClick={() => setShowDetails(!showDetails)} variant="ghost" size="sm">
                {showDetails ? "Hide Details" : "Cookie Settings"}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
