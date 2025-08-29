import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import type { MessageTrafficData } from "@shared/schema";

interface MessageTrafficChartProps {
  data: MessageTrafficData[] | undefined;
  isLoading: boolean;
}

export function MessageTrafficChart({ data, isLoading }: MessageTrafficChartProps) {
  if (isLoading) {
    return (
      <div className="h-96 space-y-3">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted/20 rounded border-2 border-dashed border-muted">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">Veri bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-2">Seçili tarih aralığında mesaj verisi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96" data-testid="chart-message-traffic">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs fill-muted-foreground"
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Mesaj Sayısı']}
          />
          <Bar 
            dataKey="messages" 
            fill="hsl(var(--chart-5))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
