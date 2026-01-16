import { Link } from "react-router-dom";
import { Info } from "lucide-react";

interface AffiliateDisclosureBannerProps {
  compact?: boolean;
}

export function AffiliateDisclosureBanner({ compact = false }: AffiliateDisclosureBannerProps) {
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2 px-4 bg-muted/50 border-b border-border">
        <span className="inline-flex items-center gap-1">
          <Info className="h-3 w-3" aria-hidden="true" />
          <span>
            We may receive compensation from treatment centers.{" "}
            <Link 
              to="/affiliate-disclosure" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded"
            >
              Learn more
            </Link>
          </span>
        </span>
      </div>
    );
  }

  return (
    <div 
      className="bg-muted/50 border border-border rounded-lg p-4 mb-6"
      role="note"
      aria-label="Affiliate disclosure"
    >
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Advertising Disclosure:</strong> United Rehabs may receive compensation when you contact treatment centers through our site. 
            This may influence placement but does not affect our statistics or editorial content.{" "}
            <Link 
              to="/affiliate-disclosure" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              Read our full disclosure
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
