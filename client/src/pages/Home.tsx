import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Flame, 
  Zap, 
  CheckCircle,
  Target,
  Clock,
  Bell,
  BellRing,
  HelpCircle
} from "lucide-react";
import { PressureGauge } from "@/components/PressureGauge";
import { ShadowInventory } from "@/components/ShadowInventory";
import type { AnalysisResult, DailyMetric } from "@shared/schema";

const INDICES = ["SP500", "SP400", "SP600"] as const;

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ticker: "",
    indexTarget: "SP500" as typeof INDICES[number],
    marketCap: "",
    price: "",
    avgVolume30d: "",
    morningVolume: "",
    typicalMorningVolume: "",
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<DailyMetric[]>({
    queryKey: ["/api/daily-metrics"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: {
      ticker: string;
      indexTarget: string;
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
        description: `${result.ticker} (${result.indexTarget}): ${result.pressureScoreDisplay}`,
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
      indexTarget: formData.indexTarget,
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

  const getIntensityConfig = (intensity: string) => {
    switch (intensity) {
      case "EXTREME":
        return { 
          icon: <Flame className="w-4 h-4" />, 
          gradient: "card-header-gradient-red",
          tag: "tag-red",
          label: "EXTREME PRESSURE"
        };
      case "HIGH":
        return { 
          icon: <Zap className="w-4 h-4" />, 
          gradient: "card-header-gradient-amber",
          tag: "tag-amber",
          label: "HIGH PRESSURE"
        };
      default:
        return { 
          icon: <CheckCircle className="w-4 h-4" />, 
          gradient: "card-header-gradient-emerald",
          tag: "tag-emerald",
          label: "NORMAL PRESSURE"
        };
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-slate-100" data-testid="text-page-title">
                Index Inclusion Sniper
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                S&P 500 / MidCap 400 / SmallCap 600 Mechanical Pressure Calculator
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`relative px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              alertEnabled 
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
            data-testid="button-alert-toggle"
          >
            {alertEnabled && (
              <div className="absolute inset-0 bg-white rounded-lg blur-sm opacity-40 animate-pulse" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {alertEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span className="font-semibold">{alertEnabled ? "Alert Active" : "Enable Alert"}</span>
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis Input Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            {/* Header Strip */}
            <div className="card-header-gradient-indigo px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-100">Analyze New Addition</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-300 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-700 font-semibold whitespace-nowrap">
                Calculator
              </span>
            </div>
            
            {/* Main Content */}
            <div className="p-4">
              <p className="text-slate-500 dark:text-slate-400 mb-5">
                Enter stock data to calculate mechanical buying pressure from index funds.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="label-uppercase flex items-center gap-1.5">
                      Ticker Symbol
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </label>
                    <Input
                      data-testid="input-ticker"
                      placeholder="e.g. PATH"
                      value={formData.ticker}
                      onChange={(e) => handleChange("ticker", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="label-uppercase">Target Index</label>
                    <RadioGroup
                      value={formData.indexTarget}
                      onValueChange={(value) => handleChange("indexTarget", value)}
                      className="flex gap-2"
                      data-testid="radio-index"
                    >
                      {INDICES.map((idx) => (
                        <label
                          key={idx}
                          className={`flex-1 px-3 py-2 rounded-lg border text-center cursor-pointer transition-all ${
                            formData.indexTarget === idx
                              ? "bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-300"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <RadioGroupItem value={idx} id={idx} className="sr-only" />
                          <span className="font-semibold whitespace-nowrap">{idx}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="label-uppercase">Market Cap ($)</label>
                    <Input
                      data-testid="input-market-cap"
                      type="number"
                      placeholder="15000000000"
                      value={formData.marketCap}
                      onChange={(e) => handleChange("marketCap", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="label-uppercase">Current Price ($)</label>
                    <Input
                      data-testid="input-price"
                      type="number"
                      step="0.01"
                      placeholder="20.00"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="label-uppercase flex items-center gap-1.5">
                    Avg 30-Day Volume
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </label>
                  <Input
                    data-testid="input-avg-volume"
                    type="number"
                    placeholder="5000000"
                    value={formData.avgVolume30d}
                    onChange={(e) => handleChange("avgVolume30d", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="label-uppercase">
                      Morning Volume<br />(Today)
                    </label>
                    <Input
                      data-testid="input-morning-volume"
                      type="number"
                      placeholder="4000000"
                      value={formData.morningVolume}
                      onChange={(e) => handleChange("morningVolume", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="label-uppercase">
                      Typical Morning<br />Volume
                    </label>
                    <Input
                      data-testid="input-typical-morning-volume"
                      type="number"
                      placeholder="1000000"
                      value={formData.typicalMorningVolume}
                      onChange={(e) => handleChange("typicalMorningVolume", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    type="submit"
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    data-testid="button-analyze"
                    disabled={analyzeMutation.isPending}
                  >
                    <Activity className="w-4 h-4" />
                    {analyzeMutation.isPending ? "Analyzing..." : "Calculate Pressure Score"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Card */}
          {analysisResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Header Strip */}
              <div className={`${getIntensityConfig(analysisResult.intensity).gradient} px-4 py-2.5 flex items-center justify-between gap-2`}>
                <div className="flex items-center gap-2">
                  {getIntensityConfig(analysisResult.intensity).icon}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{analysisResult.ticker}</span>
                  <span className={`px-2 py-0.5 rounded-lg font-semibold whitespace-nowrap ${getIntensityConfig(analysisResult.intensity).tag}`}>
                    {analysisResult.indexTarget}
                  </span>
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100" data-testid="text-pressure-score-header">
                  {analysisResult.pressureScoreDisplay}
                </div>
              </div>
              
              {/* Main Content */}
              <div className="p-4">
                <p className="text-slate-500 dark:text-slate-400 mb-5">
                  {getIntensityConfig(analysisResult.intensity).label} - {analysisResult.action}
                </p>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <PressureGauge 
                      value={analysisResult.pressureScore} 
                      intensity={analysisResult.intensity}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2.5">
                      <label className="label-uppercase flex items-center gap-1.5">
                        Shares to Buy
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </label>
                      <div className="w-full px-3.5 py-2.5 rounded-lg text-center font-semibold tag-indigo whitespace-nowrap" data-testid="text-required-shares">
                        {analysisResult.requiredSharesDisplay}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2.5">
                    <label className="label-uppercase">Relative Volume</label>
                    <div className="w-full px-3.5 py-2.5 rounded-lg text-center font-semibold tag-cyan whitespace-nowrap" data-testid="text-relative-volume">
                      {analysisResult.relativeVolumeDisplay}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <label className="label-uppercase">Algo Detection</label>
                    <div className={`w-full px-3.5 py-2.5 rounded-lg text-center font-semibold whitespace-nowrap ${analysisResult.isAlgoActive ? "tag-red" : "tag-emerald"}`} data-testid="badge-algo-status">
                      {analysisResult.isAlgoActive ? "CAUTION" : "CLEAR"}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">
                      {analysisResult.algoAlert}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setAlertEnabled(true)}
                      className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700 font-semibold flex items-center gap-2 hover:shadow-md transition-all"
                      data-testid="button-set-alert"
                    >
                      <Bell className="w-4 h-4" />
                      Set Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex items-center justify-center p-12">
              <div className="text-center">
                <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Enter stock data and click "Calculate Pressure Score" to see results
                </p>
              </div>
            </div>
          )}
        </div>

        {/* History Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          {/* Header Strip */}
          <div className="card-header-gradient-cyan px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Analysis History</span>
            </div>
            <span className="px-2 py-1 rounded-lg bg-cyan-100 text-cyan-700 border border-cyan-300 dark:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-700 font-semibold">
              {metrics.length}
            </span>
          </div>
          
          {/* Main Content */}
          <div className="p-4">
            {metricsLoading ? (
              <div className="text-slate-500 dark:text-slate-400 animate-pulse">Loading history...</div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No analyses yet. Run your first analysis above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-3 label-uppercase">Ticker</th>
                      <th className="text-left py-2 px-3 label-uppercase">Index</th>
                      <th className="text-left py-2 px-3 label-uppercase">Date</th>
                      <th className="text-left py-2 px-3 label-uppercase">Pressure</th>
                      <th className="text-left py-2 px-3 label-uppercase">Intensity</th>
                      <th className="text-left py-2 px-3 label-uppercase">Rel. Vol</th>
                      <th className="text-left py-2 px-3 label-uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((metric) => {
                      const config = getIntensityConfig(metric.intensity || "NORMAL");
                      return (
                        <tr 
                          key={metric.id} 
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" 
                          data-testid={`row-metric-${metric.id}`}
                        >
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{metric.ticker}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-lg tag-slate font-semibold whitespace-nowrap">
                              {metric.indexTarget}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{metric.date}</td>
                          <td className="py-3 px-3 font-semibold">{metric.pressureScore}x</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold ${config.tag}`}>
                              {config.icon}
                              {metric.intensity}
                            </span>
                          </td>
                          <td className="py-3 px-3">{metric.relativeVolume}x</td>
                          <td className="py-3 px-3">
                            {metric.algoAlert?.includes("CAUTION") ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg tag-red font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                Alert
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg tag-emerald font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* S&P 500 Eligibility Watchlist */}
        <ShadowInventory />
      </div>
    </div>
  );
}
