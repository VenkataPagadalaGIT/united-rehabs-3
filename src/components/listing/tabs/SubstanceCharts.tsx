import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  Wine, 
  Pill, 
  Syringe, 
  AlertTriangle, 
  Activity, 
  Heart,
  TrendingUp,
  Users,
  Skull,
  Brain,
  HelpCircle,
  Info
} from "lucide-react";

interface SubstanceStatistics {
  id: string;
  state_id: string;
  state_name: string;
  year: number;
  alcohol_use_disorder: number | null;
  alcohol_use_past_month_percent: number | null;
  alcohol_binge_drinking_percent: number | null;
  alcohol_heavy_use_percent: number | null;
  alcohol_related_deaths: number | null;
  opioid_use_disorder: number | null;
  opioid_misuse_past_year: number | null;
  prescription_opioid_misuse: number | null;
  heroin_use: number | null;
  fentanyl_deaths: number | null;
  fentanyl_involved_overdoses: number | null;
  cocaine_use_past_year: number | null;
  cocaine_use_disorder: number | null;
  cocaine_related_deaths: number | null;
  meth_use_past_year: number | null;
  meth_use_disorder: number | null;
  meth_related_deaths: number | null;
  marijuana_use_past_month: number | null;
  marijuana_use_past_year: number | null;
  marijuana_use_disorder: number | null;
  prescription_stimulant_misuse: number | null;
  prescription_sedative_misuse: number | null;
  prescription_tranquilizer_misuse: number | null;
  treatment_received: number | null;
  treatment_needed_not_received: number | null;
  mat_recipients: number | null;
  mental_illness_with_sud: number | null;
  serious_mental_illness_with_sud: number | null;
}

interface SubstanceChartsProps {
  data: SubstanceStatistics[];
  selectedYear: string;
  stateName: string;
}

// Harmonized color palette
const COLORS = {
  fentanyl: { main: "#dc2626", light: "#fecaca", bg: "bg-red-50 dark:bg-red-950" },
  opioid: { main: "#ef4444", light: "#fee2e2", bg: "bg-red-50 dark:bg-red-950" },
  alcohol: { main: "#7c3aed", light: "#ede9fe", bg: "bg-violet-50 dark:bg-violet-950" },
  cocaine: { main: "#f97316", light: "#ffedd5", bg: "bg-orange-50 dark:bg-orange-950" },
  meth: { main: "#eab308", light: "#fef9c3", bg: "bg-yellow-50 dark:bg-yellow-950" },
  marijuana: { main: "#22c55e", light: "#dcfce7", bg: "bg-green-50 dark:bg-green-950" },
  prescription: { main: "#3b82f6", light: "#dbeafe", bg: "bg-blue-50 dark:bg-blue-950" },
  treatment: { main: "#06b6d4", light: "#cffafe", bg: "bg-cyan-50 dark:bg-cyan-950" },
  mental: { main: "#8b5cf6", light: "#ede9fe", bg: "bg-purple-50 dark:bg-purple-950" },
};

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || num === 0) return "N/A";
  return new Intl.NumberFormat("en-US").format(num);
};

const formatCompact = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

const hasData = (value: number | null | undefined): boolean => {
  return value !== null && value !== undefined && value > 0;
};

// Section wrapper with summary
const Section = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor, 
  children,
  isEmpty = false
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  iconColor: string;
  children: React.ReactNode;
  isEmpty?: boolean;
}) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border">
      <div className={`p-2 rounded-lg ${iconColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
    {isEmpty ? (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">Data not yet available for this state.</p>
          <p className="text-xs text-muted-foreground mt-1">Check back as we continue adding official government data.</p>
        </CardContent>
      </Card>
    ) : children}
  </div>
);

// Stat card component
const StatCard = ({ 
  label, 
  value, 
  subLabel, 
  color, 
  icon: Icon 
}: { 
  label: string; 
  value: number | null; 
  subLabel?: string; 
  color: string;
  icon?: React.ElementType;
}) => (
  <div className="p-4 rounded-lg border bg-card">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="h-4 w-4" style={{ color }} />}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-2xl font-bold" style={{ color: hasData(value) ? color : undefined }}>
      {hasData(value) ? formatCompact(value!) : "—"}
    </p>
    {subLabel && <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>}
  </div>
);

export const SubstanceCharts = ({ data, selectedYear, stateName }: SubstanceChartsProps) => {
  const currentYearData = data?.find((s) => s.year === parseInt(selectedYear));
  const hasAnyData = data?.length > 0 && currentYearData;

  // No data state
  if (!hasAnyData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center">
          <Info className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Substance Statistics Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Detailed substance-specific data for {stateName} is being compiled from official 
            SAMHSA NSDUH and CDC WONDER sources. This includes statistics on alcohol, opioids, 
            fentanyl, cocaine, methamphetamine, and more.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const deathsData = data.map((s) => ({
    year: s.year.toString(),
    Fentanyl: s.fentanyl_deaths || 0,
    Alcohol: s.alcohol_related_deaths || 0,
    Meth: s.meth_related_deaths || 0,
    Cocaine: s.cocaine_related_deaths || 0,
  }));

  const opioidTrendData = data.map((s) => ({
    year: s.year.toString(),
    "Rx Opioids": s.prescription_opioid_misuse || 0,
    Heroin: s.heroin_use || 0,
    "Opioid Disorder": s.opioid_use_disorder || 0,
  }));

  const stimulantTrendData = data.map((s) => ({
    year: s.year.toString(),
    Cocaine: s.cocaine_use_past_year || 0,
    Meth: s.meth_use_past_year || 0,
  }));

  const treatmentData = [
    { name: "Received Treatment", value: currentYearData.treatment_received || 0, fill: COLORS.treatment.main },
    { name: "Needed, Not Received", value: currentYearData.treatment_needed_not_received || 0, fill: "#94a3b8" },
  ].filter(d => d.value > 0);

  // Check if sections have data
  const hasDeathsData = deathsData.some(d => d.Fentanyl > 0 || d.Alcohol > 0 || d.Meth > 0 || d.Cocaine > 0);
  const hasOpioidData = hasData(currentYearData.opioid_use_disorder) || hasData(currentYearData.fentanyl_deaths);
  const hasAlcoholData = hasData(currentYearData.alcohol_use_disorder) || hasData(currentYearData.alcohol_use_past_month_percent);
  const hasStimulantData = hasData(currentYearData.cocaine_use_past_year) || hasData(currentYearData.meth_use_past_year);
  const hasTreatmentData = hasData(currentYearData.treatment_received) || hasData(currentYearData.treatment_needed_not_received);

  return (
    <div className="space-y-8">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Substance-Specific Statistics</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown by drug type from official government sources
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {selectedYear}
        </Badge>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard 
          label="Fentanyl Deaths" 
          value={currentYearData.fentanyl_deaths} 
          subLabel="Synthetic Opioid"
          color={COLORS.fentanyl.main}
          icon={Skull}
        />
        <StatCard 
          label="Opioid Disorder" 
          value={currentYearData.opioid_use_disorder} 
          subLabel="Use Disorder"
          color={COLORS.opioid.main}
          icon={Syringe}
        />
        <StatCard 
          label="Alcohol Disorder" 
          value={currentYearData.alcohol_use_disorder} 
          subLabel="Use Disorder"
          color={COLORS.alcohol.main}
          icon={Wine}
        />
        <StatCard 
          label="Cocaine Use" 
          value={currentYearData.cocaine_use_past_year} 
          subLabel="Past Year"
          color={COLORS.cocaine.main}
          icon={Activity}
        />
        <StatCard 
          label="Meth Use" 
          value={currentYearData.meth_use_past_year} 
          subLabel="Past Year"
          color={COLORS.meth.main}
          icon={TrendingUp}
        />
        <StatCard 
          label="Cannabis Use" 
          value={currentYearData.marijuana_use_past_year} 
          subLabel="Past Year"
          color={COLORS.marijuana.main}
          icon={Users}
        />
      </div>

      {/* 1. OVERDOSE DEATHS - Most Critical */}
      <Section
        title="Drug Overdose Deaths by Substance"
        description="Fatal overdoses categorized by the primary substance involved. Fentanyl (synthetic opioid) is now the leading cause of drug overdose deaths in the United States, often mixed with other substances."
        icon={AlertTriangle}
        iconColor="bg-red-600"
        isEmpty={!hasDeathsData}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>Annual Deaths by Substance Type</span>
              <Badge variant="destructive" className="text-xs">Critical Data</Badge>
            </CardTitle>
            <CardDescription>Source: CDC WONDER Multiple Cause of Death Database</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deathsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis tickFormatter={formatCompact} className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => [formatNumber(value), `${name} Deaths`]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="Fentanyl" fill={COLORS.fentanyl.main} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Alcohol" fill={COLORS.alcohol.main} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meth" fill={COLORS.meth.main} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cocaine" fill={COLORS.cocaine.main} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Section>

      {/* 2. OPIOID CRISIS */}
      <Section
        title="The Opioid Crisis"
        description="Opioids include prescription pain relievers (oxycodone, hydrocodone), heroin, and synthetic opioids like fentanyl. The opioid epidemic has evolved from prescription drugs to illicit fentanyl as the primary driver of deaths."
        icon={Syringe}
        iconColor="bg-red-500"
        isEmpty={!hasOpioidData}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Opioid breakdown stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Opioid Use Breakdown ({selectedYear})</CardTitle>
              <CardDescription>People affected by different opioid types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg ${COLORS.opioid.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Rx Opioid Misuse</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.opioid.main }}>
                    {hasData(currentYearData.prescription_opioid_misuse) ? formatCompact(currentYearData.prescription_opioid_misuse!) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.opioid.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Heroin Use</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.opioid.main }}>
                    {hasData(currentYearData.heroin_use) ? formatCompact(currentYearData.heroin_use!) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.fentanyl.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Fentanyl Deaths</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.fentanyl.main }}>
                    {hasData(currentYearData.fentanyl_deaths) ? formatNumber(currentYearData.fentanyl_deaths) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.opioid.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Opioid Use Disorder</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.opioid.main }}>
                    {hasData(currentYearData.opioid_use_disorder) ? formatCompact(currentYearData.opioid_use_disorder!) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opioid trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Opioid Use Trends</CardTitle>
              <CardDescription>Year-over-year changes in opioid-related statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={opioidTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={formatCompact} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), "People"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Rx Opioids" stroke={COLORS.opioid.main} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Heroin" stroke="#b91c1c" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Opioid Disorder" stroke="#fca5a5" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 3. ALCOHOL */}
      <Section
        title="Alcohol Use & Disorder"
        description="Alcohol remains the most commonly used substance. Binge drinking is 5+ drinks for men or 4+ for women in about 2 hours. Heavy use is binge drinking 5+ days in the past month. Alcohol Use Disorder (AUD) is a medical condition."
        icon={Wine}
        iconColor="bg-violet-600"
        isEmpty={!hasAlcoholData}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alcohol Statistics ({selectedYear})</CardTitle>
            <CardDescription>Source: SAMHSA National Survey on Drug Use and Health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${COLORS.alcohol.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.alcohol.main }}>
                  {hasData(currentYearData.alcohol_use_past_month_percent) 
                    ? `${currentYearData.alcohol_use_past_month_percent?.toFixed(1)}%` 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Used Alcohol (Past Month)</p>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.alcohol.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.alcohol.main }}>
                  {hasData(currentYearData.alcohol_binge_drinking_percent) 
                    ? `${currentYearData.alcohol_binge_drinking_percent?.toFixed(1)}%` 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Binge Drinking</p>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.alcohol.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.alcohol.main }}>
                  {hasData(currentYearData.alcohol_use_disorder) 
                    ? formatCompact(currentYearData.alcohol_use_disorder!) 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Alcohol Use Disorder</p>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.alcohol.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.alcohol.main }}>
                  {hasData(currentYearData.alcohol_related_deaths) 
                    ? formatNumber(currentYearData.alcohol_related_deaths) 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Related Deaths</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* 4. STIMULANTS */}
      <Section
        title="Stimulants: Cocaine & Methamphetamine"
        description="Stimulants increase alertness and energy. Cocaine is derived from coca plants, while methamphetamine is synthetically produced. Both carry high overdose risks, especially when mixed with fentanyl."
        icon={Activity}
        iconColor="bg-orange-500"
        isEmpty={!hasStimulantData}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stimulant Use ({selectedYear})</CardTitle>
              <CardDescription>Past year use and related deaths</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg ${COLORS.cocaine.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Cocaine Use (Past Year)</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.cocaine.main }}>
                    {hasData(currentYearData.cocaine_use_past_year) ? formatCompact(currentYearData.cocaine_use_past_year!) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.cocaine.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Cocaine Deaths</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.cocaine.main }}>
                    {hasData(currentYearData.cocaine_related_deaths) ? formatNumber(currentYearData.cocaine_related_deaths) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.meth.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Meth Use (Past Year)</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.meth.main }}>
                    {hasData(currentYearData.meth_use_past_year) ? formatCompact(currentYearData.meth_use_past_year!) : "—"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${COLORS.meth.bg} border`}>
                  <p className="text-xs text-muted-foreground mb-1">Meth Deaths</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.meth.main }}>
                    {hasData(currentYearData.meth_related_deaths) ? formatNumber(currentYearData.meth_related_deaths) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stimulant Use Trends</CardTitle>
              <CardDescription>Cocaine vs Methamphetamine over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stimulantTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={formatCompact} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(value), "People"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Cocaine" stroke={COLORS.cocaine.main} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Meth" stroke={COLORS.meth.main} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 5. CANNABIS */}
      <Section
        title="Cannabis / Marijuana"
        description="Cannabis is the most commonly used federally illegal drug. Cannabis Use Disorder affects those who cannot stop using despite negative consequences. While rarely directly fatal, it can impact mental health and daily functioning."
        icon={Users}
        iconColor="bg-green-600"
        isEmpty={!hasData(currentYearData.marijuana_use_past_year)}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cannabis Statistics ({selectedYear})</CardTitle>
            <CardDescription>Source: SAMHSA NSDUH</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${COLORS.marijuana.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.marijuana.main }}>
                  {hasData(currentYearData.marijuana_use_past_year) 
                    ? formatCompact(currentYearData.marijuana_use_past_year!) 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Past Year Use</p>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.marijuana.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.marijuana.main }}>
                  {hasData(currentYearData.marijuana_use_past_month) 
                    ? formatCompact(currentYearData.marijuana_use_past_month!) 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Past Month Use</p>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.marijuana.bg} border text-center`}>
                <p className="text-3xl font-bold" style={{ color: COLORS.marijuana.main }}>
                  {hasData(currentYearData.marijuana_use_disorder) 
                    ? formatCompact(currentYearData.marijuana_use_disorder!) 
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Use Disorder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* 6. TREATMENT GAP */}
      <Section
        title="Treatment Access Gap"
        description="Many people who need substance use treatment do not receive it. Barriers include cost, stigma, lack of available programs, and not recognizing the need for help. MAT (Medication-Assisted Treatment) uses FDA-approved medications with counseling."
        icon={Heart}
        iconColor="bg-cyan-600"
        isEmpty={!hasTreatmentData}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Treatment Statistics ({selectedYear})</CardTitle>
              <CardDescription>Who received help vs who still needs it</CardDescription>
            </CardHeader>
            <CardContent>
              {treatmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={treatmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {treatmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), "People"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No treatment data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Treatment Metrics</CardTitle>
              <CardDescription>Detailed breakdown of treatment access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${COLORS.treatment.bg} border`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Received Treatment</span>
                  <span className="font-bold" style={{ color: COLORS.treatment.main }}>
                    {hasData(currentYearData.treatment_received) ? formatNumber(currentYearData.treatment_received) : "—"}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Needed But Did Not Receive</span>
                  <span className="font-bold text-muted-foreground">
                    {hasData(currentYearData.treatment_needed_not_received) ? formatNumber(currentYearData.treatment_needed_not_received) : "—"}
                  </span>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${COLORS.treatment.bg} border`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm">MAT Recipients</span>
                  <span className="font-bold" style={{ color: COLORS.treatment.main }}>
                    {hasData(currentYearData.mat_recipients) ? formatNumber(currentYearData.mat_recipients) : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 7. MENTAL HEALTH CO-OCCURRING */}
      <Section
        title="Mental Health & Co-Occurring Disorders"
        description="Many people with substance use disorders also have mental health conditions (co-occurring disorders). Treating both simultaneously leads to better outcomes. Serious Mental Illness (SMI) includes conditions like schizophrenia, bipolar disorder, and severe depression."
        icon={Brain}
        iconColor="bg-purple-600"
        isEmpty={!hasData(currentYearData.mental_illness_with_sud)}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Co-Occurring Disorders ({selectedYear})</CardTitle>
            <CardDescription>Substance use disorder combined with mental illness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-6 rounded-lg ${COLORS.mental.bg} border text-center`}>
                <p className="text-4xl font-bold" style={{ color: COLORS.mental.main }}>
                  {hasData(currentYearData.mental_illness_with_sud) 
                    ? formatCompact(currentYearData.mental_illness_with_sud!) 
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Any Mental Illness + SUD</p>
                <p className="text-xs text-muted-foreground">People with both conditions</p>
              </div>
              <div className={`p-6 rounded-lg ${COLORS.mental.bg} border text-center`}>
                <p className="text-4xl font-bold" style={{ color: COLORS.mental.main }}>
                  {hasData(currentYearData.serious_mental_illness_with_sud) 
                    ? formatCompact(currentYearData.serious_mental_illness_with_sud!) 
                    : "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Serious Mental Illness + SUD</p>
                <p className="text-xs text-muted-foreground">Severe cases requiring intensive care</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
};
