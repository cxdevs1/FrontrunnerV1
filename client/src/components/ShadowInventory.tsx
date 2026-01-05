import { useState } from "react";
import { 
  TrendingUp, 
  ChevronUp, 
  ChevronDown,
  Star,
  AlertCircle,
  Filter,
  HelpCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WatchlistStock {
  id: number;
  ticker: string;
  companyName: string;
  sector: string;
  marketCap: number;
  currentPrice: number;
  avgVolume30d: number;
  consecutivePositiveQuarters: number;
  latestEps: number;
  priceChange24h: number;
  eligibilityScore: number;
}

const MOCK_WATCHLIST: WatchlistStock[] = [
  {
    id: 1,
    ticker: "PLTR",
    companyName: "Palantir Technologies",
    sector: "Technology",
    marketCap: 18500000000,
    currentPrice: 24.50,
    avgVolume30d: 45000000,
    consecutivePositiveQuarters: 5,
    latestEps: 0.08,
    priceChange24h: 2.4,
    eligibilityScore: 92
  },
  {
    id: 2,
    ticker: "RBLX",
    companyName: "Roblox Corporation",
    sector: "Technology",
    marketCap: 22300000000,
    currentPrice: 38.75,
    avgVolume30d: 12000000,
    consecutivePositiveQuarters: 4,
    latestEps: 0.12,
    priceChange24h: -1.2,
    eligibilityScore: 88
  },
  {
    id: 3,
    ticker: "DASH",
    companyName: "DoorDash Inc",
    sector: "Consumer Discretionary",
    marketCap: 19800000000,
    currentPrice: 48.20,
    avgVolume30d: 8500000,
    consecutivePositiveQuarters: 4,
    latestEps: 0.22,
    priceChange24h: 0.8,
    eligibilityScore: 85
  },
  {
    id: 4,
    ticker: "SNAP",
    companyName: "Snap Inc",
    sector: "Communication Services",
    marketCap: 17200000000,
    currentPrice: 10.85,
    avgVolume30d: 32000000,
    consecutivePositiveQuarters: 4,
    latestEps: 0.05,
    priceChange24h: -0.5,
    eligibilityScore: 78
  },
  {
    id: 5,
    ticker: "COIN",
    companyName: "Coinbase Global",
    sector: "Financials",
    marketCap: 24100000000,
    currentPrice: 98.50,
    avgVolume30d: 15000000,
    consecutivePositiveQuarters: 5,
    latestEps: 1.04,
    priceChange24h: 4.2,
    eligibilityScore: 94
  },
  {
    id: 6,
    ticker: "RIVN",
    companyName: "Rivian Automotive",
    sector: "Consumer Discretionary",
    marketCap: 16500000000,
    currentPrice: 16.80,
    avgVolume30d: 28000000,
    consecutivePositiveQuarters: 4,
    latestEps: 0.02,
    priceChange24h: 1.1,
    eligibilityScore: 72
  }
];

interface IndexVacancy {
  id: number;
  index: string;
  spots: number;
  reason: string;
  company: string;
  date: string;
}

const MOCK_VACANCIES: IndexVacancy[] = [
  {
    id: 1,
    index: "S&P 500",
    spots: 1,
    reason: "Merger",
    company: "Discover Financial",
    date: "2026-01-03"
  },
  {
    id: 2,
    index: "S&P 400",
    spots: 2,
    reason: "Promoted to S&P 500",
    company: "Palantir, AppLovin",
    date: "2026-01-02"
  }
];

type SortField = "ticker" | "marketCap" | "eligibilityScore" | "priceChange24h" | "consecutivePositiveQuarters";
type SortDirection = "asc" | "desc";

export function ShadowInventory() {
  const [sortField, setSortField] = useState<SortField>("eligibilityScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [watchlist] = useState<WatchlistStock[]>(MOCK_WATCHLIST);

  const formatMarketCap = (cap: number) => {
    return `$${(cap / 1_000_000_000).toFixed(1)}B`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
    return vol.toLocaleString();
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedWatchlist = [...watchlist].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "ticker") {
      return multiplier * a.ticker.localeCompare(b.ticker);
    }
    return multiplier * ((a[sortField] as number) - (b[sortField] as number));
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" 
      ? <ChevronUp className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "tag-emerald";
    if (score >= 80) return "tag-cyan";
    if (score >= 70) return "tag-amber";
    return "tag-slate";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm" data-testid="shadow-inventory">
      {/* Header Strip */}
      <div className="card-header-gradient-indigo px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            S&P 500 Eligibility Watchlist
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2">
                <p className="text-sm"><strong>The Waiting Room.</strong> These are healthy, profitable companies that meet all the S&P rules and are the most likely candidates to be added next.</p>
              </TooltipContent>
            </Tooltip>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg tag-indigo font-semibold whitespace-nowrap">
            $15B - $25B Market Cap
          </span>
          <span className="px-2 py-0.5 rounded-lg tag-emerald font-semibold whitespace-nowrap">
            4+ Positive Qtrs
          </span>
        </div>
      </div>

      {/* Active Vacancies Banner */}
      {MOCK_VACANCIES.length > 0 && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/50" data-testid="vacancies-banner">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Active Vacancies</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-amber-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2">
                <p className="text-sm"><strong>Open Spots.</strong> When a company leaves an index (merger, bankruptcy, etc.), one of the stocks below will be chosen to fill the vacancy. These are your Sniper targets.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-1.5">
            {MOCK_VACANCIES.map((vacancy) => (
              <div key={vacancy.id} className="flex items-center gap-2 text-sm">
                <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                  {vacancy.index}
                </span>
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  {vacancy.spots} Spot{vacancy.spots > 1 ? "s" : ""} Open
                </span>
                <ArrowRight className="w-3 h-3 text-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {vacancy.reason} of {vacancy.company}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-500 dark:text-slate-400">
            Stocks meeting S&P 500 eligibility criteria based on market cap and earnings consistency.
          </p>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5" data-testid="button-filter">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th 
                  className="text-left py-2 px-3 label-uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => handleSort("ticker")}
                  data-testid="header-ticker"
                >
                  Ticker <SortIcon field="ticker" />
                </th>
                <th className="text-left py-2 px-3 label-uppercase">Company</th>
                <th className="text-left py-2 px-3 label-uppercase">Sector</th>
                <th 
                  className="text-left py-2 px-3 label-uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => handleSort("marketCap")}
                  data-testid="header-market-cap"
                >
                  Market Cap <SortIcon field="marketCap" />
                </th>
                <th className="text-left py-2 px-3 label-uppercase">Price</th>
                <th 
                  className="text-left py-2 px-3 label-uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => handleSort("priceChange24h")}
                  data-testid="header-change"
                >
                  24h <SortIcon field="priceChange24h" />
                </th>
                <th className="text-left py-2 px-3 label-uppercase">Avg Vol</th>
                <th 
                  className="text-left py-2 px-3 label-uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => handleSort("consecutivePositiveQuarters")}
                  data-testid="header-quarters"
                >
                  + Qtrs <SortIcon field="consecutivePositiveQuarters" />
                </th>
                <th className="text-left py-2 px-3 label-uppercase">EPS</th>
                <th 
                  className="text-left py-2 px-3 label-uppercase cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  onClick={() => handleSort("eligibilityScore")}
                  data-testid="header-score"
                >
                  Score <SortIcon field="eligibilityScore" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedWatchlist.map((stock) => (
                <tr 
                  key={stock.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  data-testid={`row-stock-${stock.id}`}
                >
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{stock.ticker}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[150px] truncate">
                    {stock.companyName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg tag-slate font-medium whitespace-nowrap text-xs">
                      {stock.sector}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-slate-100">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    ${stock.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      stock.priceChange24h >= 0 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {stock.priceChange24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {stock.priceChange24h >= 0 ? "+" : ""}{stock.priceChange24h.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {formatVolume(stock.avgVolume30d)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-lg tag-emerald font-semibold">
                      {stock.consecutivePositiveQuarters}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium">
                    ${stock.latestEps.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-lg font-bold ${getScoreColor(stock.eligibilityScore)}`}>
                      {stock.eligibilityScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            Showing {sortedWatchlist.length} stocks meeting eligibility criteria
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded tag-emerald">90+</span> High
            <span className="px-2 py-0.5 rounded tag-cyan">80-89</span> Medium
            <span className="px-2 py-0.5 rounded tag-amber">70-79</span> Low
          </div>
        </div>
      </div>
    </div>
  );
}
