import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cookie-consent";

type ConsentType = "all" | "essential" | null;

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (type: ConsentType) => {
    if (type) {
      localStorage.setItem(COOKIE_CONSENT_KEY, type);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-4">
          <Cookie className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Cookie Preferences</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We use cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. 
              By clicking "Accept All", you consent to our use of cookies. 
              See our <Link to="/privacy-policy" className="underline hover:text-primary">Privacy Policy</Link> for more information.
            </p>

            {showDetails && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-foreground">Essential Cookies</h4>
                  <p className="text-muted-foreground">Required for basic site functionality. Cannot be disabled.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Analytics Cookies</h4>
                  <p className="text-muted-foreground">Help us understand how visitors interact with our website.</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Marketing Cookies</h4>
                  <p className="text-muted-foreground">Used to deliver relevant advertisements and track campaign performance.</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleConsent("all")} size="sm">
                Accept All
              </Button>
              <Button onClick={() => handleConsent("essential")} variant="outline" size="sm">
                Essential Only
              </Button>
              <Button 
                onClick={() => setShowDetails(!showDetails)} 
                variant="ghost" 
                size="sm"
              >
                {showDetails ? "Hide Details" : "Cookie Settings"}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => handleConsent("essential")}
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
