import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { X } from "lucide-react";

interface TicketFormProps {
  onClose: () => void;
}

export function TicketForm({ onClose }: TicketFormProps) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "",
    priority: "orta" as const
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/support/tickets', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Destek talebiniz başarıyla gönderildi!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      onClose();
      setFormData({ subject: "", message: "", category: "", priority: "orta" });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Talep gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Hata",
        description: "Konu ve açıklama alanları zorunludur.",
        variant: "destructive",
      });
      return;
    }
    createTicketMutation.mutate(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-2xl font-bold">Yeni Destek Talebi</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-form">
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="subject">Konu *</Label>
            <Input
              id="subject"
              placeholder="Sorununuzu kısaca özetleyin"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              required
              data-testid="input-subject"
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Teknik Sorun</SelectItem>
                <SelectItem value="billing">Faturalandırma</SelectItem>
                <SelectItem value="account">Hesap Sorunu</SelectItem>
                <SelectItem value="feature">Özellik Talebi</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Öncelik</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
            >
              <SelectTrigger data-testid="select-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="düşük">Düşük</SelectItem>
                <SelectItem value="orta">Orta</SelectItem>
                <SelectItem value="yüksek">Yüksek</SelectItem>
                <SelectItem value="acil">Acil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Açıklama *</Label>
            <Textarea
              id="message"
              placeholder="Sorununuzu detaylı olarak açıklayın..."
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              required
              className="resize-none"
              data-testid="textarea-message"
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createTicketMutation.isPending}
              data-testid="button-submit-ticket"
            >
              {createTicketMutation.isPending ? "Gönderiliyor..." : "Talebi Gönder"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
