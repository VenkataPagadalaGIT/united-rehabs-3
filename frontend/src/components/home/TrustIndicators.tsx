import { Database, Globe, BarChart3, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface NationalStats {
  total_affected?: number;
  total_overdose_deaths?: number;
  total_treatment_centers?: number;
  total_treatment_admissions?: number;
  avg_recovery_rate?: number;
  total_economic_cost?: number;
}

interface TrustIndicatorsProps {
  nationalStats?: NationalStats;
  isLoading?: boolean;
}

// Show EXACT numbers - NO rounding to K/M
const formatNumber = (num: number | undefined): string => {
  if (!num && num !== 0) return "---";
  return num.toLocaleString(); // Shows exact numbers
};

export function TrustIndicators({ nationalStats, isLoading }: TrustIndicatorsProps) {
  const { t } = useTranslation();
  
  // Dynamic stats from backend - focused on data/statistics
  const dynamicStats = [
    {
      icon: AlertTriangle,
      value: formatNumber(nationalStats?.total_affected),
      label: "People Affected",
      description: "Impacted by substance use disorders",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: TrendingUp,
      value: nationalStats?.avg_recovery_rate ? `${nationalStats.avg_recovery_rate.toFixed(1)}%` : "---",
      label: "Recovery Rate",
      description: "Successful treatment outcomes",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: BarChart3,
      value: formatNumber(nationalStats?.total_overdose_deaths),
      label: "Annual Deaths",
      description: "Overdose fatalities reported",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Database,
      value: "195+",
      label: "Countries",
      description: "Global data coverage",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  // Static trust indicators - focused on data quality
  const staticIndicators = [
    {
      icon: FileText,
      title: "Verified Data Sources",
      description: "Statistics compiled from WHO, UNODC, SAMHSA, CDC, and national health ministries",
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Comprehensive addiction data for 195 countries and all 51 US states",
    },
  ];

  if (isLoading) {
    return (
      <section className="py-12 bg-background" data-testid="trust-indicators-loading">
        <div className="container mx-auto px-4">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border bg-card">
                <Skeleton className="h-10 w-10 rounded-full mb-3" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background" data-testid="trust-indicators-section">
      <div className="container mx-auto px-4">
        {/* Section Header with Data Scope */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Key Statistics at a Glance
            </h2>
            <p className="text-muted-foreground">
              Data from verified official sources
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm">
              🇺🇸 USA Data
            </span>
            <span className="text-muted-foreground">|</span>
            <a href="/compare" className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-full text-sm transition-colors">
              🌍 View Worldwide
            </a>
          </div>
        </div>

        {/* Dynamic National Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {dynamicStats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-4 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-sm font-medium text-foreground mt-1">
                {stat.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </span>
            </div>
          ))}
        </div>

        {/* Static Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {staticIndicators.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <item.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
