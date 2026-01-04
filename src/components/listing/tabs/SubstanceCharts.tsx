import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Wine, Pill, Cannabis, Syringe, AlertTriangle, Activity } from "lucide-react";

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

const CHART_COLORS = {
  alcohol: "#8b5cf6",
  opioid: "#ef4444",
  fentanyl: "#dc2626",
  cocaine: "#f97316",
  meth: "#eab308",
  marijuana: "#22c55e",
  prescription: "#3b82f6",
  treatment: "#06b6d4",
};

const formatNumber = (num: number | null) => {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-US").format(num);
};

const formatCompactNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toString();
};

export const SubstanceCharts = ({ data, selectedYear, stateName }: SubstanceChartsProps) => {
  const currentYearData = data?.find((s) => s.year === parseInt(selectedYear));

  if (!data?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Detailed substance statistics coming soon. Data will be populated from official government sources.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare drug-related deaths comparison data
  const deathsComparisonData = data.map((s) => ({
    year: s.year.toString(),
    Fentanyl: s.fentanyl_deaths || 0,
    Cocaine: s.cocaine_related_deaths || 0,
    Meth: s.meth_related_deaths || 0,
    Alcohol: s.alcohol_related_deaths || 0,
  }));

  // Substance use prevalence data (percentages)
  const prevalenceData = currentYearData
    ? [
        { name: "Alcohol (Monthly)", value: currentYearData.alcohol_use_past_month_percent || 0, fill: CHART_COLORS.alcohol },
        { name: "Binge Drinking", value: currentYearData.alcohol_binge_drinking_percent || 0, fill: "#a78bfa" },
        { name: "Heavy Alcohol", value: currentYearData.alcohol_heavy_use_percent || 0, fill: "#7c3aed" },
      ]
    : [];

  // Opioid breakdown data
  const opioidBreakdownData = currentYearData
    ? [
        { name: "Prescription Opioids", value: currentYearData.prescription_opioid_misuse || 0, fill: CHART_COLORS.opioid },
        { name: "Heroin", value: currentYearData.heroin_use || 0, fill: "#b91c1c" },
        { name: "Opioid Use Disorder", value: currentYearData.opioid_use_disorder || 0, fill: "#fca5a5" },
      ]
    : [];

  // Stimulant comparison data
  const stimulantData = data.map((s) => ({
    year: s.year.toString(),
    Cocaine: s.cocaine_use_past_year || 0,
    Meth: s.meth_use_past_year || 0,
    PrescriptionStimulants: s.prescription_stimulant_misuse || 0,
  }));

  // Marijuana trends
  const marijuanaData = data.map((s) => ({
    year: s.year.toString(),
    Monthly: s.marijuana_use_past_month || 0,
    Yearly: s.marijuana_use_past_year || 0,
    Disorder: s.marijuana_use_disorder || 0,
  }));

  // Treatment gap data
  const treatmentGapData = currentYearData
    ? [
        { name: "Received Treatment", value: currentYearData.treatment_received || 0, fill: CHART_COLORS.treatment },
        { name: "Needed but Didn't Receive", value: currentYearData.treatment_needed_not_received || 0, fill: "#94a3b8" },
      ]
    : [];

  // Mental health co-occurring data
  const mentalHealthData = currentYearData
    ? [
        { name: "Mental Illness with SUD", value: currentYearData.mental_illness_with_sud || 0 },
        { name: "Serious Mental Illness with SUD", value: currentYearData.serious_mental_illness_with_sud || 0 },
        { name: "MAT Recipients", value: currentYearData.mat_recipients || 0 },
      ]
    : [];

  // Prescription drug misuse radar data
  const prescriptionData = currentYearData
    ? [
        { subject: "Opioids", value: currentYearData.prescription_opioid_misuse || 0 },
        { subject: "Stimulants", value: currentYearData.prescription_stimulant_misuse || 0 },
        { subject: "Sedatives", value: currentYearData.prescription_sedative_misuse || 0 },
        { subject: "Tranquilizers", value: currentYearData.prescription_tranquilizer_misuse || 0 },
      ]
    : [];

  // Drug type breakdown summary data
  const drugTypeSummary = currentYearData
    ? [
        { 
          name: "Alcohol", 
          icon: "🍺", 
          users: currentYearData.alcohol_use_disorder || 0,
          deaths: currentYearData.alcohol_related_deaths || 0,
          color: CHART_COLORS.alcohol,
          description: "Alcohol Use Disorder"
        },
        { 
          name: "Opioids", 
          icon: "💊", 
          users: currentYearData.opioid_use_disorder || 0,
          deaths: currentYearData.fentanyl_deaths || 0,
          color: CHART_COLORS.opioid,
          description: "Opioid Use Disorder (incl. Fentanyl, Heroin, Rx)"
        },
        { 
          name: "Fentanyl", 
          icon: "⚠️", 
          users: currentYearData.fentanyl_involved_overdoses || 0,
          deaths: currentYearData.fentanyl_deaths || 0,
          color: CHART_COLORS.fentanyl,
          description: "Synthetic Opioid - Primary Driver of Overdose Deaths"
        },
        { 
          name: "Cocaine", 
          icon: "❄️", 
          users: currentYearData.cocaine_use_past_year || 0,
          deaths: currentYearData.cocaine_related_deaths || 0,
          color: CHART_COLORS.cocaine,
          description: "Past Year Cocaine Use"
        },
        { 
          name: "Methamphetamine", 
          icon: "⚡", 
          users: currentYearData.meth_use_past_year || 0,
          deaths: currentYearData.meth_related_deaths || 0,
          color: CHART_COLORS.meth,
          description: "Psychostimulant with Abuse Potential"
        },
        { 
          name: "Cannabis", 
          icon: "🌿", 
          users: currentYearData.marijuana_use_past_year || 0,
          deaths: 0, // Cannabis rarely causes direct overdose deaths
          color: CHART_COLORS.marijuana,
          description: "Past Year Marijuana/Cannabis Use"
        },
        { 
          name: "Rx Opioids", 
          icon: "💉", 
          users: currentYearData.prescription_opioid_misuse || 0,
          deaths: 0,
          color: "#f87171",
          description: "Prescription Opioid Misuse"
        },
        { 
          name: "Heroin", 
          icon: "🔴", 
          users: currentYearData.heroin_use || 0,
          deaths: 0,
          color: "#b91c1c",
          description: "Heroin Use"
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <Pill className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold">Substance-Specific Statistics</h3>
        <Badge variant="secondary">{selectedYear}</Badge>
      </div>

      {/* Drug Type Breakdown Summary Grid */}
      {currentYearData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {drugTypeSummary.map((drug) => (
            <Card key={drug.name} className="relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-1 h-full" 
                style={{ backgroundColor: drug.color }} 
              />
              <CardContent className="p-4 pl-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{drug.icon}</span>
                  <span className="font-semibold text-sm">{drug.name}</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <p className="text-xl font-bold">{formatCompactNumber(drug.users)}</p>
                    <p className="text-xs text-muted-foreground">Affected</p>
                  </div>
                  {drug.deaths > 0 && (
                    <div className="pt-1 border-t">
                      <p className="text-sm font-semibold text-destructive">{formatNumber(drug.deaths)}</p>
                      <p className="text-xs text-muted-foreground">Deaths</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drug-Related Deaths Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Drug-Related Deaths by Substance Type
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Source: CDC WONDER Multiple Cause of Death Database
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deathsComparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis tickFormatter={formatCompactNumber} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => [formatNumber(value), `${name} Deaths`]}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend />
              <Bar dataKey="Fentanyl" fill={CHART_COLORS.fentanyl} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cocaine" fill={CHART_COLORS.cocaine} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Meth" fill={CHART_COLORS.meth} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Alcohol" fill={CHART_COLORS.alcohol} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alcohol & Opioid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alcohol Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wine className="h-5 w-5 text-purple-500" />
              Alcohol Use Patterns ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Source: SAMHSA NSDUH</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={prevalenceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" unit="%" className="text-xs" />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Rate"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {prevalenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {currentYearData?.alcohol_use_disorder && (
              <div className="mt-4 p-3 bg-purple-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(currentYearData.alcohol_use_disorder)}</p>
                <p className="text-sm text-muted-foreground">People with Alcohol Use Disorder</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opioid Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Syringe className="h-5 w-5 text-red-500" />
              Opioid Crisis Breakdown ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Source: SAMHSA NSDUH & CDC</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={opioidBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCompactNumber(value)}`}
                >
                  {opioidBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "People"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {currentYearData?.fentanyl_deaths && (
              <div className="mt-2 p-3 bg-red-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{formatNumber(currentYearData.fentanyl_deaths)}</p>
                <p className="text-sm text-muted-foreground">Fentanyl-Related Deaths</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stimulants Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-orange-500" />
            Stimulant Use Trends Over Time
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cocaine, Methamphetamine & Prescription Stimulants - Source: SAMHSA NSDUH
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stimulantData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis tickFormatter={formatCompactNumber} className="text-xs" />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    Cocaine: "Cocaine Use",
                    Meth: "Methamphetamine Use",
                    PrescriptionStimulants: "Rx Stimulant Misuse",
                  };
                  return [formatNumber(value), labels[name] || name];
                }}
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Cocaine"
                stroke={CHART_COLORS.cocaine}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.cocaine }}
              />
              <Line
                type="monotone"
                dataKey="Meth"
                stroke={CHART_COLORS.meth}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.meth }}
              />
              <Line
                type="monotone"
                dataKey="PrescriptionStimulants"
                name="Rx Stimulants"
                stroke={CHART_COLORS.prescription}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.prescription }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Marijuana & Prescription Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marijuana Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cannabis className="h-5 w-5 text-green-500" />
              Cannabis/Marijuana Use Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground">Source: SAMHSA NSDUH</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={marijuanaData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="year" className="text-xs" />
                <YAxis tickFormatter={formatCompactNumber} className="text-xs" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      Monthly: "Past Month Use",
                      Yearly: "Past Year Use",
                      Disorder: "Use Disorder",
                    };
                    return [formatNumber(value), labels[name] || name];
                  }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Line type="monotone" dataKey="Yearly" name="Past Year" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="Monthly" name="Past Month" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="Disorder" name="Use Disorder" stroke="#15803d" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prescription Drug Misuse Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5 text-blue-500" />
              Prescription Drug Misuse ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Source: SAMHSA NSDUH</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={prescriptionData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" className="text-xs" />
                <PolarRadiusAxis tickFormatter={formatCompactNumber} className="text-xs" />
                <Radar
                  name="Misuse"
                  dataKey="value"
                  stroke={CHART_COLORS.prescription}
                  fill={CHART_COLORS.prescription}
                  fillOpacity={0.5}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), "People"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Gap & Mental Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Gap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Treatment Access Gap ({selectedYear})</CardTitle>
            <p className="text-sm text-muted-foreground">Source: SAMHSA NSDUH</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={treatmentGapData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {treatmentGapData.map((entry, index) => (
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
            {currentYearData?.mat_recipients && (
              <div className="mt-2 text-center">
                <p className="text-lg font-semibold">{formatNumber(currentYearData.mat_recipients)}</p>
                <p className="text-xs text-muted-foreground">Medication-Assisted Treatment Recipients</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mental Health Co-occurring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mental Health & Substance Use ({selectedYear})</CardTitle>
            <p className="text-sm text-muted-foreground">Co-occurring Disorders - Source: SAMHSA NSDUH</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mentalHealthData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{formatNumber(item.value)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${Math.min((item.value / (mentalHealthData[0]?.value || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
