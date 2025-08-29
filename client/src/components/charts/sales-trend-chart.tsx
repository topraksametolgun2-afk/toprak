import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import type { SalesData } from "@shared/schema";

interface SalesTrendChartProps {
  data: SalesData[] | undefined;
  isLoading: boolean;
}

export function SalesTrendChart({ data, isLoading }: SalesTrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-80 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-muted/20 rounded border-2 border-dashed border-muted">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Veri bulunamadı</p>
          <p className="text-xs text-muted-foreground mt-1">Seçili tarih aralığında satış verisi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80" data-testid="chart-sales-trend">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs fill-muted-foreground"
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
