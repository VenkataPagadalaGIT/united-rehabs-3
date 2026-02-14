import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Scale, FileText } from "lucide-react";

const CONSENT_KEY = "unitedrehabs_disclaimer_consent";
const CONSENT_VERSION = "1.0"; // Increment to re-show consent after major changes

export function DisclaimerConsent() {
  const [showModal, setShowModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent || JSON.parse(consent).version !== CONSENT_VERSION) {
      setShowModal(true);
    }
  }, []);

  const handleAccept = () => {
    if (agreed && understood) {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        agreed: true
      }));
      setShowModal(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary/10 p-6 border-b">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Important Legal Notice</h2>
              <p className="text-muted-foreground text-sm">Please read before continuing</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Medical Disclaimer */}
          <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Not Medical Advice</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This website provides <strong>general information only</strong>. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.
              </p>
            </div>
          </div>

          {/* Data Disclaimer */}
          <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <FileText className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">Data & Statistics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Statistics are compiled from official sources but may contain errors, be outdated, or use estimates. Data is for <strong>informational purposes only</strong> and should not be used for medical, legal, or policy decisions without independent verification.
              </p>
            </div>
          </div>

          {/* No Endorsement */}
          <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <Scale className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">No Endorsement</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Any treatment facilities or resources mentioned are for informational purposes only. We do <strong>NOT endorse, recommend, or guarantee</strong> the quality of any facility or service.
              </p>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="agree" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-1"
              />
              <label htmlFor="agree" className="text-sm text-foreground cursor-pointer">
                I have read and agree to the{" "}
                <a href="/legal-disclaimer" target="_blank" className="text-primary hover:underline">Legal Disclaimer</a>,{" "}
                <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">Terms of Service</a>, and{" "}
                <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox 
                id="understand" 
                checked={understood} 
                onCheckedChange={(checked) => setUnderstood(checked === true)}
                className="mt-1"
              />
              <label htmlFor="understand" className="text-sm text-foreground cursor-pointer">
                I understand this website does <strong>NOT provide medical advice</strong> and I will consult healthcare professionals for any treatment decisions.
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30">
          <Button 
            onClick={handleAccept} 
            disabled={!agreed || !understood}
            className="w-full"
            size="lg"
          >
            I Understand - Continue to Website
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            By clicking continue, you acknowledge that you have read and understood these disclaimers.
          </p>
        </div>
      </div>
    </div>
  );
}
