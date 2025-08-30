import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DestekMerkezi() {
  return (
    <DashboardLayout 
      title="Destek Merkezi" 
      subtitle="Müşteri destek işlemlerini yönetin"
    >
      <div className="bg-card p-6 rounded-lg border border-border" data-testid="destek-merkezi-content">
        <h3 className="text-lg font-semibold text-foreground mb-4">Destek Merkezi</h3>
        <p className="text-muted-foreground">
          Destek merkezi özellikleri yakında eklenecek.
        </p>
      </div>
    </DashboardLayout>
  );
}
