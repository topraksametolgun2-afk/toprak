import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  iconBgColor?: string;
}

export function StatsCard({ title, value, icon, trend, iconBgColor = "bg-primary/10" }: StatsCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border" data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground" data-testid="stats-title">{title}</p>
          <p className="text-2xl font-bold text-foreground" data-testid="stats-value">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`} data-testid="stats-icon">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center" data-testid="stats-trend">
          {trend.isPositive ? (
            <TrendingUp className="text-green-500 text-xs mr-1 w-3 h-3" />
          ) : (
            <TrendingDown className="text-red-500 text-xs mr-1 w-3 h-3" />
          )}
          <span className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.value}
          </span>
          <span className="text-sm text-muted-foreground ml-1">{trend.period}</span>
        </div>
      )}
    </div>
  );
}
