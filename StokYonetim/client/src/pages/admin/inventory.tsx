import AdminLayout from "@/components/layout/admin-layout";
import StockOverviewCards from "@/components/inventory/stock-overview-cards";
import InventoryTable from "@/components/inventory/inventory-table";
import StockMovementHistory from "@/components/inventory/stock-movement-history";
import CriticalStockAlert from "@/components/inventory/critical-stock-alert";

export default function InventoryManagement() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stok ve Envanter Yönetimi</h1>
            <p className="text-muted-foreground">
              Ürün stoklarını takip edin ve yönetin
            </p>
          </div>
          
          {/* Critical Stock Alert Button */}
          <CriticalStockAlert />
        </div>

        {/* Overview Cards */}
        <StockOverviewCards />

        {/* Inventory Table */}
        <InventoryTable />

        {/* Recent Stock Movements */}
        <StockMovementHistory />
      </div>
    </AdminLayout>
  );
}
