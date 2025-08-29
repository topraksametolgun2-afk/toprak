import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { UserRegistrationData } from "@shared/schema";

interface UserRegistrationChartProps {
  data: UserRegistrationData[] | undefined;
  isLoading: boolean;
}

export function UserRegistrationChart({ data, isLoading }: UserRegistrationChartProps) {
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
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">Veri bulunamadı</p>
          <p className="text-sm text-muted-foreground mt-2">Seçili tarih aralığında kullanıcı kayıt verisi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96" data-testid="chart-user-registration">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            formatter={(value: number) => [value.toLocaleString('tr-TR'), 'Yeni Kayıt']}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--chart-4))"
            fill="hsl(var(--chart-4))"
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
