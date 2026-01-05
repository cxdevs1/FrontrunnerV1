import { Flag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TradeTimelineProps {
  announcementDate: string;
  effectiveDate: string;
}

type TimelinePhase = "announcement" | "leadup" | "moc" | "effective";

const TIMELINE_STAGES = [
  {
    id: "announcement" as TimelinePhase,
    label: "Announcement",
    description: "The 'Starting Gun' (Day 0)",
    icon: Flag,
  },
  {
    id: "leadup" as TimelinePhase,
    label: "Lead-up",
    description: "5-7 days institutions use to build positions",
    icon: TrendingUp,
  },
  {
    id: "moc" as TimelinePhase,
    label: "MOC Cross",
    description: "Final 15 min before inclusion (Max Liquidity)",
    icon: Clock,
  },
  {
    id: "effective" as TimelinePhase,
    label: "Effective Date",
    description: "The 'Flip' - officially in the index",
    icon: CheckCircle,
  },
];

function getCurrentPhase(announcementDate: string, effectiveDate: string): TimelinePhase {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const announcement = new Date(announcementDate);
  announcement.setHours(0, 0, 0, 0);
  
  const effective = new Date(effectiveDate);
  effective.setHours(0, 0, 0, 0);
  
  const daysSinceAnnouncement = Math.floor((today.getTime() - announcement.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilEffective = Math.floor((effective.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceAnnouncement <= 0) {
    return "announcement";
  } else if (daysUntilEffective > 1) {
    return "leadup";
  } else if (daysUntilEffective === 0 || daysUntilEffective === 1) {
    return "moc";
  } else {
    return "effective";
  }
}

export function TradeTimeline({ announcementDate, effectiveDate }: TradeTimelineProps) {
  const currentPhase = getCurrentPhase(announcementDate, effectiveDate);
  const currentIndex = TIMELINE_STAGES.findIndex(s => s.id === currentPhase);

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <span className="label-uppercase">Trade Timeline</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Effective: {new Date(effectiveDate).toLocaleDateString()}
        </span>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between">
          {TIMELINE_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stage.id === currentPhase;
            const isCompleted = index < currentIndex;
            const isPending = index > currentIndex;
            
            return (
              <div key={stage.id} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-help
                        ${isActive 
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg ring-4 ring-indigo-200 dark:ring-indigo-900" 
                          : isCompleted 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                        }
                      `}
                      data-testid={`timeline-stage-${stage.id}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2">
                    <p className="text-sm font-semibold">{stage.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stage.description}</p>
                  </TooltipContent>
                </Tooltip>
                
                <span className={`
                  mt-2 text-xs font-medium text-center whitespace-nowrap
                  ${isActive 
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold" 
                    : isCompleted 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-slate-400 dark:text-slate-500"
                  }
                `}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" style={{ marginLeft: '5%', marginRight: '5%' }}>
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (TIMELINE_STAGES.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
