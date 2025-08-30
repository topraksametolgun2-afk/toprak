import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Ayarlar() {
  return (
    <DashboardLayout 
      title="Ayarlar" 
      subtitle="Sistem ayarlarını yapılandırın"
    >
      <div className="bg-card p-6 rounded-lg border border-border" data-testid="ayarlar-content">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sistem Ayarları</h3>
        <p className="text-muted-foreground">
          Ayarlar özellikleri yakında eklenecek.
        </p>
      </div>
    </DashboardLayout>
  );
}
