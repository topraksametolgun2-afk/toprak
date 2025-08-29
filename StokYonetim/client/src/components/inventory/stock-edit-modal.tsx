import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ProductWithInventory, UpdateStock } from "@shared/schema";

interface StockEditModalProps {
  product: ProductWithInventory;
  open: boolean;
  onClose: () => void;
}

export default function StockEditModal({ product, open, onClose }: StockEditModalProps) {
  const [currentStock, setCurrentStock] = useState(product.inventory.currentStock);
  const [criticalLevel, setCriticalLevel] = useState(product.inventory.criticalLevel);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const updateStockMutation = useMutation({
    mutationFn: async (data: UpdateStock) => {
      const response = await apiRequest("PATCH", "/api/inventory/update", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "Başarılı",
        description: "Stok başarıyla güncellendi.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Stok güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStock < 0) {
      toast({
        title: "Hata",
        description: "Stok miktarı negatif olamaz.",
        variant: "destructive",
      });
      return;
    }

    if (criticalLevel < 0) {
      toast({
        title: "Hata",
        description: "Kritik seviye negatif olamaz.",
        variant: "destructive",
      });
      return;
    }

    updateStockMutation.mutate({
      productId: product.id,
      currentStock,
      criticalLevel,
      notes,
    });
  };

  const handleClose = () => {
    if (!updateStockMutation.isPending) {
      // Reset form
      setCurrentStock(product.inventory.currentStock);
      setCriticalLevel(product.inventory.criticalLevel);
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} data-testid="modal-stock-edit">
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Güncelle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product-name">Ürün</Label>
            <Input
              id="product-name"
              value={product.name}
              disabled
              className="bg-muted"
              data-testid="input-product-name"
            />
          </div>

          <div>
            <Label htmlFor="current-stock">Mevcut Stok</Label>
            <Input
              id="current-stock"
              type="number"
              value={currentStock}
              onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
              min="0"
              required
              data-testid="input-current-stock"
            />
          </div>

          <div>
            <Label htmlFor="critical-level">Kritik Seviye</Label>
            <Input
              id="critical-level"
              type="number"
              value={criticalLevel}
              onChange={(e) => setCriticalLevel(parseInt(e.target.value) || 0)}
              min="0"
              required
              data-testid="input-critical-level"
            />
          </div>

          <div>
            <Label htmlFor="notes">Açıklama (İsteğe Bağlı)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stok güncelleme sebebi..."
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={updateStockMutation.isPending}
              data-testid="button-cancel"
            >
              İptal
            </Button>
            <Button 
              type="submit"
              disabled={updateStockMutation.isPending}
              data-testid="button-update"
            >
              {updateStockMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
