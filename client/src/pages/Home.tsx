import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, AlertTriangle, Activity, BarChart3 } from "lucide-react";
import type { AnalysisResult, DailyMetric } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ticker: "",
    marketCap: "",
    price: "",
    avgVolume30d: "",
    morningVolume: "",
    typicalMorningVolume: "",
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<DailyMetric[]>({
    queryKey: ["/api/daily-metrics"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: {
      ticker: string;
      marketCap: number;
      price: number;
      avgVolume30d: number;
      morningVolume: number;
      typicalMorningVolume: number;
    }) => {
      const res = await apiRequest("POST", "/api/analyze", data);
      return res.json();
    },
    onSuccess: (result: AnalysisResult) => {
      setAnalysisResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/daily-metrics"] });
      toast({
        title: "Analysis Complete",
        description: `${result.ticker}: ${result.pressureScoreDisplay}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze ticker",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeMutation.mutate({
      ticker: formData.ticker.toUpperCase(),
      marketCap: parseFloat(formData.marketCap),
      price: parseFloat(formData.price),
      avgVolume30d: parseFloat(formData.avgVolume30d),
      morningVolume: parseFloat(formData.morningVolume),
      typicalMorningVolume: parseFloat(formData.typicalMorningVolume),
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Index Addition Analyzer
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analyze New Addition</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker Symbol</Label>
                  <Input
                    id="ticker"
                    data-testid="input-ticker"
                    placeholder="e.g. PATH"
                    value={formData.ticker}
                    onChange={(e) => handleChange("ticker", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marketCap">Market Cap ($)</Label>
                    <Input
                      id="marketCap"
                      data-testid="input-market-cap"
                      type="number"
                      placeholder="15000000000"
                      value={formData.marketCap}
                      onChange={(e) => handleChange("marketCap", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Current Price ($)</Label>
                    <Input
                      id="price"
                      data-testid="input-price"
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avgVolume30d">Avg 30-Day Volume</Label>
                  <Input
                    id="avgVolume30d"
                    data-testid="input-avg-volume"
                    type="number"
                    placeholder="5000000"
                    value={formData.avgVolume30d}
                    onChange={(e) => handleChange("avgVolume30d", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="morningVolume">Morning Volume (Today)</Label>
                    <Input
                      id="morningVolume"
                      data-testid="input-morning-volume"
                      type="number"
                      placeholder="4000000"
                      value={formData.morningVolume}
                      onChange={(e) => handleChange("morningVolume", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typicalMorningVolume">Typical Morning Vol</Label>
                    <Input
                      id="typicalMorningVolume"
                      data-testid="input-typical-morning-volume"
                      type="number"
                      placeholder="1000000"
                      value={formData.typicalMorningVolume}
                      onChange={(e) => handleChange("typicalMorningVolume", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-analyze"
                  disabled={analyzeMutation.isPending}
                >
                  {analyzeMutation.isPending ? "Analyzing..." : "Analyze Ticker"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Analysis Result: {analysisResult.ticker}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-sm text-muted-foreground">Pressure Score</div>
                    <div className="text-2xl font-bold" data-testid="text-pressure-score">
                      {analysisResult.pressureScoreDisplay}
                    </div>
                  </div>
                  <div className="p-4 rounded-md bg-muted">
                    <div className="text-sm text-muted-foreground">Relative Volume</div>
                    <div className="text-2xl font-bold" data-testid="text-relative-volume">
                      {analysisResult.relativeVolumeDisplay}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {analysisResult.isAlgoActive ? (
                    <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-algo-alert">
                      <AlertTriangle className="w-3 h-3" />
                      {analysisResult.algoAlert}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-algo-normal">
                      <TrendingUp className="w-3 h-3" />
                      {analysisResult.algoAlert}
                    </Badge>
                  )}
                </div>

                <div
                  className={`p-4 rounded-md border ${
                    analysisResult.action === "High Squeeze Potential"
                      ? "bg-green-500/10 border-green-500/30 dark:bg-green-900/20"
                      : "bg-amber-500/10 border-amber-500/30 dark:bg-amber-900/20"
                  }`}
                >
                  <div className="text-sm text-muted-foreground">Recommendation</div>
                  <div
                    className={`text-lg font-semibold ${
                      analysisResult.action === "High Squeeze Potential"
                        ? "text-green-600 dark:text-green-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                    data-testid="text-action"
                  >
                    {analysisResult.action}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : metrics.length === 0 ? (
              <div className="text-muted-foreground">No analyses yet. Run your first analysis above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Ticker</th>
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-left py-2 px-3 font-medium">Pressure</th>
                      <th className="text-left py-2 px-3 font-medium">Rel. Volume</th>
                      <th className="text-left py-2 px-3 font-medium">Status</th>
                      <th className="text-left py-2 px-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => (
                      <tr key={metric.id} className="border-b hover-elevate" data-testid={`row-metric-${metric.id}`}>
                        <td className="py-2 px-3 font-medium">{metric.ticker}</td>
                        <td className="py-2 px-3 text-muted-foreground">{metric.date}</td>
                        <td className="py-2 px-3">{metric.pressureScore}x</td>
                        <td className="py-2 px-3">{metric.relativeVolume}x</td>
                        <td className="py-2 px-3">
                          {metric.algoAlert?.includes("CAUTION") ? (
                            <Badge variant="destructive" size="sm">Alert</Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">Normal</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3">{metric.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
