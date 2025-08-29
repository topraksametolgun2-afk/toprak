import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import type { ProductWithInventory } from "@shared/schema";

export default function CriticalStockAlert() {
  const [showAlert, setShowAlert] = useState(false);

  const { data: criticalProducts = [] } = useQuery<ProductWithInventory[]>({
    queryKey: ["/api/inventory/critical"],
  });

  const criticalCount = criticalProducts.length;

  return (
    <>
      {/* Alert Button */}
      {criticalCount > 0 && (
        <Button
          variant="destructive"
          onClick={() => setShowAlert(true)}
          className="relative"
          data-testid="button-critical-stock-alert"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Kritik Stok Uyarıları
          <Badge 
            variant="secondary" 
            className="ml-2 bg-white text-destructive px-2 py-1 text-xs font-bold"
            data-testid="badge-critical-count"
          >
            {criticalCount}
          </Badge>
        </Button>
      )}

      {/* Alert Modal */}
      <Dialog open={showAlert} onOpenChange={setShowAlert} data-testid="modal-critical-stock-alert">
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="bg-destructive/10 -m-6 mb-6 p-6">
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-3" />
              Kritik Stok Uyarısı
            </DialogTitle>
          </DialogHeader>

          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Aşağıdaki ürünlerin stokları kritik seviyeye düştü:
            </p>

            {criticalProducts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Kritik stok seviyesinde ürün bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {criticalProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                    data-testid={`item-critical-product-${product.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium" data-testid={`text-critical-product-name-${product.id}`}>
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-critical-product-sku-${product.id}`}>
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive" data-testid={`text-critical-current-stock-${product.id}`}>
                        {product.inventory.currentStock} adet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Kritik: <span data-testid={`text-critical-level-${product.id}`}>{product.inventory.criticalLevel}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAlert(false)}
              data-testid="button-dismiss-alert"
            >
              Daha Sonra
            </Button>
            <Link href="/admin/inventory">
              <Button 
                onClick={() => setShowAlert(false)}
                data-testid="button-manage-stock"
              >
                Stok Yönetimi
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
