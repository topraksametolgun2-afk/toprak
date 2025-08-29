import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, List, Trash2, Edit, Package, ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ListWithItems, Product } from "@shared/schema";

export default function Lists() {
  const queryClient = useQueryClient();
  const [newListName, setNewListName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<{ id: string; name: string } | null>(null);
  const [selectedListForProduct, setSelectedListForProduct] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  // Fetch lists
  const { data: lists, isLoading: listsLoading } = useQuery<ListWithItems[]>({
    queryKey: ["/api/lists"],
  });

  // Fetch products for adding to list
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/lists", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setNewListName("");
      setIsCreateDialogOpen(false);
    },
  });

  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await apiRequest("PUT", `/api/lists/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setEditingList(null);
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      await apiRequest("DELETE", `/api/lists/${listId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
    },
  });

  // Add product to list mutation
  const addProductToListMutation = useMutation({
    mutationFn: async ({ listId, productId, quantity }: { listId: string; productId: string; quantity: number }) => {
      await apiRequest("POST", `/api/lists/${listId}/items`, { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setSelectedListForProduct("");
      setSelectedProduct("");
      setQuantity(1);
      setIsAddProductDialogOpen(false);
    },
  });

  // Remove item from list mutation
  const removeItemMutation = useMutation({
    mutationFn: async ({ listId, productId }: { listId: string; productId: string }) => {
      await apiRequest("DELETE", `/api/lists/${listId}/items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
    },
  });

  const handleCreateList = () => {
    if (newListName.trim()) {
      createListMutation.mutate(newListName.trim());
    }
  };

  const handleUpdateList = () => {
    if (editingList && editingList.name.trim()) {
      updateListMutation.mutate({ id: editingList.id, name: editingList.name.trim() });
    }
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm("Bu listeyi silmek istediğinizden emin misiniz?")) {
      deleteListMutation.mutate(listId);
    }
  };

  const handleAddProductToList = () => {
    if (selectedListForProduct && selectedProduct && quantity > 0) {
      addProductToListMutation.mutate({
        listId: selectedListForProduct,
        productId: selectedProduct,
        quantity
      });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(Number(price));
  };

  const getTotalValue = (list: ListWithItems) => {
    return list.items.reduce((total, item) => {
      return total + (Number(item.product.price) * item.quantity);
    }, 0);
  };

  if (listsLoading) {
    return (
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardContent className="p-6">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <List className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Listelerim</h1>
              <p className="text-muted-foreground">
                Ürünlerinizi düzenlemek için listeler oluşturun
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-add-product-to-list">
                  <Package className="w-4 h-4 mr-2" />
                  Ürün Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Listeye Ürün Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Liste Seçin</Label>
                    <Select value={selectedListForProduct} onValueChange={setSelectedListForProduct}>
                      <SelectTrigger data-testid="select-list-for-product">
                        <SelectValue placeholder="Liste seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {lists?.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ürün Seçin</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger data-testid="select-product">
                        <SelectValue placeholder="Ürün seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Miktar</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      data-testid="input-quantity"
                    />
                  </div>
                  <Button
                    onClick={handleAddProductToList}
                    disabled={!selectedListForProduct || !selectedProduct || addProductToListMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-add-product"
                  >
                    {addProductToListMutation.isPending ? "Ekleniyor..." : "Ürünü Ekle"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-list">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Liste
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Liste Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listName">Liste Adı</Label>
                    <Input
                      id="listName"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Örn: Favori Ürünlerim, Alışveriş Listesi"
                      data-testid="input-list-name"
                    />
                  </div>
                  <Button
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || createListMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-create-list"
                  >
                    {createListMutation.isPending ? "Oluşturuluyor..." : "Liste Oluştur"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Lists Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <List className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="total-lists">
                  {lists?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Liste</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="total-items">
                  {lists?.reduce((total, list) => total + list.items.length, 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Ürün</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="total-value">
                  {formatPrice(String(lists?.reduce((total, list) => total + getTotalValue(list), 0) || 0))}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Değer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lists Grid */}
      {!lists || lists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="bg-muted/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <List className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Henüz listeniz yok
          </h3>
          <p className="text-muted-foreground mb-6">
            İlk listenizi oluşturarak ürünlerinizi düzenlemeye başlayın
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-first-list">
            <Plus className="w-4 h-4 mr-2" />
            İlk Listemi Oluştur
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lists.map((list, index) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -2 }}
              className="transition-all duration-300"
            >
              <Card className="h-full hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingList?.id === list.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editingList.name}
                            onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
                            data-testid={`input-edit-list-${list.id}`}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateList} disabled={updateListMutation.isPending}>
                              Kaydet
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingList(null)}>
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <CardTitle className="text-xl" data-testid={`list-name-${list.id}`}>
                          {list.name}
                        </CardTitle>
                      )}
                    </div>
                    {!editingList && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingList({ id: list.id, name: list.name })}
                          data-testid={`button-edit-list-${list.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteList(list.id)}
                          disabled={deleteListMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          data-testid={`button-delete-list-${list.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{list.items.length} ürün</span>
                    <span>{new Date(list.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* List Items */}
                    {list.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Bu liste boş</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {list.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`item-name-${item.id}`}>
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatPrice(item.product.price)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.quantity}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:text-red-700"
                                onClick={() => removeItemMutation.mutate({ listId: list.id, productId: item.product.id })}
                                disabled={removeItemMutation.isPending}
                                data-testid={`button-remove-item-${item.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List Summary */}
                    {list.items.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Toplam Değer:</span>
                          <span className="text-lg font-bold text-primary" data-testid={`list-total-${list.id}`}>
                            {formatPrice(String(getTotalValue(list)))}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit List Dialog */}
      {editingList && (
        <Dialog open={true} onOpenChange={() => setEditingList(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Liste Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editListName">Liste Adı</Label>
                <Input
                  id="editListName"
                  value={editingList.name}
                  onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
                  data-testid="input-edit-list-name"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateList}
                  disabled={!editingList.name.trim() || updateListMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-list"
                >
                  {updateListMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingList(null)}
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}