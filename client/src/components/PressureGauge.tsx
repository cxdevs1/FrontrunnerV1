import { useEffect, useState } from "react";

interface PressureGaugeProps {
  value: number;
  maxValue?: number;
  intensity: string;
}

export function PressureGauge({ value, maxValue = 5.0, intensity }: PressureGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = animatedValue;
    const targetValue = Math.min(value, maxValue);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOut;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, maxValue]);

  const percentage = (animatedValue / maxValue) * 100;
  const needleAngle = -90 + (percentage * 1.8);
  
  const getGaugeColors = () => {
    switch (intensity) {
      case "EXTREME":
        return {
          arc: "stroke-red-500",
          needle: "fill-red-600",
          text: "text-red-600 dark:text-red-400",
          glow: "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        };
      case "HIGH":
        return {
          arc: "stroke-amber-500",
          needle: "fill-amber-600",
          text: "text-amber-600 dark:text-amber-400",
          glow: "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        };
      default:
        return {
          arc: "stroke-emerald-500",
          needle: "fill-emerald-600",
          text: "text-emerald-600 dark:text-emerald-400",
          glow: "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        };
    }
  };

  const colors = getGaugeColors();
  
  const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const cx = 100;
    const cy = 90;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const tickMarks = [0, 1, 2, 3, 4, 5];
  
  return (
    <div className="flex flex-col items-center" data-testid="pressure-gauge">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
        <path
          d={createArcPath(-180, 0, 70)}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        <path
          d={createArcPath(-180, -180 + (percentage * 1.8), 70)}
          fill="none"
          className={`${colors.arc} ${colors.glow} transition-all duration-300`}
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {tickMarks.map((tick) => {
          const angle = -180 + (tick / maxValue) * 180;
          const rad = (angle * Math.PI) / 180;
          const innerRadius = 55;
          const outerRadius = 62;
          const x1 = 100 + innerRadius * Math.cos(rad);
          const y1 = 90 + innerRadius * Math.sin(rad);
          const x2 = 100 + outerRadius * Math.cos(rad);
          const y2 = 90 + outerRadius * Math.sin(rad);
          
          const labelRadius = 48;
          const lx = 100 + labelRadius * Math.cos(rad);
          const ly = 90 + labelRadius * Math.sin(rad);
          
          return (
            <g key={tick}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="stroke-slate-400 dark:stroke-slate-500"
                strokeWidth="2"
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[10px] font-medium"
              >
                {tick}
              </text>
            </g>
          );
        })}
        
        <g 
          transform={`rotate(${needleAngle}, 100, 90)`}
          className="transition-transform duration-100"
        >
          <polygon
            points="100,30 96,90 100,95 104,90"
            className={`${colors.needle} ${colors.glow}`}
          />
          <circle
            cx="100"
            cy="90"
            r="8"
            className={colors.needle}
          />
          <circle
            cx="100"
            cy="90"
            r="4"
            className="fill-white dark:fill-slate-900"
          />
        </g>
      </svg>
      
      <div className={`-mt-2 text-2xl font-bold ${colors.text}`} data-testid="text-pressure-score">
        {animatedValue.toFixed(2)}x
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Pressure Score
      </div>
    </div>
  );
}
