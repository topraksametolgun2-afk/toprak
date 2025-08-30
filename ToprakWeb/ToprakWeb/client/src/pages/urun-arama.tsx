import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function UrunArama() {
  return (
    <DashboardLayout 
      title="Ürün Arama" 
      subtitle="Ürünleri arayın ve filtreleyin"
    >
      <div className="bg-card p-6 rounded-lg border border-border" data-testid="urun-arama-content">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ürün Arama</h3>
        <p className="text-muted-foreground">
          Ürün arama özellikleri yakında eklenecek.
        </p>
      </div>
    </DashboardLayout>
  );
}
