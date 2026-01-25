import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Calendar, CheckCircle, AlertTriangle, Clock, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return response.json();
};

export default function SERPValidationAdmin() {
  const queryClient = useQueryClient();
  const [queryLimit, setQueryLimit] = useState(100);

  // Fetch schedule settings
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["serp-schedule"],
    queryFn: () => fetchWithAuth("/api/qa/serp/schedule"),
  });

  // Fetch current status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["serp-status"],
    queryFn: () => fetchWithAuth("/api/qa/dataforseo/status"),
    refetchInterval: 10000, // Refresh every 10 seconds when running
  });

  // Fetch discrepancies
  const { data: discrepancies } = useQuery({
    queryKey: ["serp-discrepancies"],
    queryFn: () => fetchWithAuth("/api/qa/dataforseo/discrepancies"),
  });

  // Fetch history
  const { data: history } = useQuery({
    queryKey: ["serp-history"],
    queryFn: () => fetchWithAuth("/api/qa/serp/history"),
  });

  // Fetch cost estimate
  const { data: costEstimate } = useQuery({
    queryKey: ["serp-cost", queryLimit],
    queryFn: () => fetchWithAuth(`/api/qa/dataforseo/cost-estimate?num_queries=${queryLimit}`),
  });

  // Start validation mutation
  const startValidation = useMutation({
    mutationFn: (limit: number) => 
      fetchWithAuth(`/api/qa/dataforseo/start-verification?limit=${limit}`, { method: "POST" }),
    onSuccess: () => {
      toast.success("SERP validation started!");
      queryClient.invalidateQueries({ queryKey: ["serp-status"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to start: ${error.message}`);
    },
  });

  // Update schedule mutation
  const updateSchedule = useMutation({
    mutationFn: (settings: { enabled: boolean; frequency: string; query_limit: number }) =>
      fetchWithAuth("/api/qa/serp/schedule", { method: "POST", body: JSON.stringify(settings) }),
    onSuccess: () => {
      toast.success("Schedule updated!");
      queryClient.invalidateQueries({ queryKey: ["serp-schedule"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });

  const handleStartValidation = () => {
    if (window.confirm(`This will submit ${queryLimit} queries to DataForSEO. Estimated cost: ${costEstimate?.estimated_cost || "calculating..."}. Continue?`)) {
      startValidation.mutate(queryLimit);
    }
  };

  const handleToggleSchedule = (enabled: boolean) => {
    updateSchedule.mutate({
      enabled,
      frequency: schedule?.frequency || "monthly",
      query_limit: schedule?.query_limit || 500,
    });
  };

  const handleFrequencyChange = (frequency: string) => {
    updateSchedule.mutate({
      enabled: schedule?.enabled || false,
      frequency,
      query_limit: schedule?.query_limit || 500,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" data-testid="serp-validation-title">SERP Validation</h2>
        <p className="text-muted-foreground">
          Verify data accuracy against Google Search results using DataForSEO API
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Manual Validation Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Manual Validation
            </CardTitle>
            <CardDescription>Run SERP validation on demand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Number of Queries</Label>
              <Input
                type="number"
                value={queryLimit}
                onChange={(e) => setQueryLimit(Number(e.target.value))}
                min={10}
                max={5000}
              />
              <p className="text-xs text-muted-foreground">
                Estimated cost: {costEstimate?.estimated_cost || "..."}
              </p>
            </div>
            <Button 
              onClick={handleStartValidation}
              disabled={startValidation.isPending}
              className="w-full"
              data-testid="start-validation-btn"
            >
              {startValidation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Validation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Schedule Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Auto Schedule
            </CardTitle>
            <CardDescription>Schedule automatic monthly validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Schedule</Label>
              <Switch
                checked={schedule?.enabled || false}
                onCheckedChange={handleToggleSchedule}
                disabled={updateSchedule.isPending}
                data-testid="schedule-toggle"
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={schedule?.frequency || "monthly"}
                onValueChange={handleFrequencyChange}
                disabled={!schedule?.enabled || updateSchedule.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {schedule?.next_run && (
              <div className="text-sm">
                <span className="text-muted-foreground">Next run: </span>
                <span className="font-medium">
                  {new Date(schedule.next_run).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Current Status
            </CardTitle>
            <CardDescription>Latest validation run status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : status?.no_report_yet ? (
              <p className="text-sm text-muted-foreground">No validation runs yet</p>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks Submitted:</span>
                  <span className="font-medium">{status?.tasks_submitted || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks Completed:</span>
                  <span className="font-medium">{status?.tasks_completed || 0}</span>
                </div>
                {status?.status && (
                  <Badge variant={status.status === "completed" ? "default" : "secondary"}>
                    {status.status}
                  </Badge>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discrepancies Section */}
      {discrepancies && discrepancies.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Discrepancies Found ({discrepancies.total})
            </CardTitle>
            <CardDescription>Data differences detected between database and Google SERP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {discrepancies.discrepancies.map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{d.country_code}</span>
                    <span className="text-muted-foreground"> - {d.year} - {d.metric}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      DB: <span className="font-mono">{d.db_value?.toLocaleString()}</span>
                    </span>
                    <span className="text-sm">
                      SERP: <span className="font-mono text-primary">{d.serp_value?.toLocaleString()}</span>
                    </span>
                    <Badge variant="destructive">{d.diff_percent?.toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Section */}
      {history && history.runs?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Validation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.runs.map((run: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {run.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {new Date(run.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{run.queries_submitted || 0} queries</span>
                    <span>{run.discrepancies_found || 0} discrepancies</span>
                    <Badge variant={run.status === "completed" ? "default" : "secondary"}>
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            DataForSEO Cost Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cost per query:</span>
              <p className="font-medium">$0.0015</p>
            </div>
            <div>
              <span className="text-muted-foreground">100 queries:</span>
              <p className="font-medium">$0.15</p>
            </div>
            <div>
              <span className="text-muted-foreground">500 queries:</span>
              <p className="font-medium">$0.75</p>
            </div>
            <div>
              <span className="text-muted-foreground">Full verification (~5000):</span>
              <p className="font-medium">~$7.50</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
