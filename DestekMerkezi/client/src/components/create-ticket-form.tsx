import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTicketSchema } from "@shared/schema";
import { NotebookPen, CloudUpload } from "lucide-react";
import { z } from "zod";

const createTicketFormSchema = insertTicketSchema.extend({
  subject: z.string().min(3, "Konu en az 3 karakter olmalıdır"),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
});

type CreateTicketFormData = z.infer<typeof createTicketFormSchema>;

interface CreateTicketFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateTicketForm({ onCancel, onSuccess }: CreateTicketFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      priority: "medium",
      category: "other",
      userId: "", // Will be set by backend
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketFormData) => {
      const response = await apiRequest("POST", "/api/tickets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      toast({
        title: "Başarılı",
        description: "Destek talebi başarıyla oluşturuldu!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Talep oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CreateTicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, 5); // Limit to 5 files
      setSelectedFiles(fileArray);
    }
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Yeni Destek Talebi</h2>
        <p className="text-sm text-muted-foreground mt-1">Sorununuzu ayrıntılı olarak açıklayın</p>
      </div>
      
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konu *</FormLabel>
                    <FormControl>
                      <Input placeholder="Sorun kısa başlığı" {...field} data-testid="input-subject" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Öncelik *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || "other"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">Teknik Sorun</SelectItem>
                      <SelectItem value="billing">Faturalama</SelectItem>
                      <SelectItem value="account">Hesap Sorunları</SelectItem>
                      <SelectItem value="feature">Özellik Talebi</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama *</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={6} 
                      placeholder="Sorununuzu detaylı olarak açıklayın..." 
                      {...field} 
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">En az 10 karakter gereklidir</p>
                </FormItem>
              )}
            />
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Dosya Eki</label>
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:border-primary/50 transition-colors">
                <CloudUpload className="mx-auto text-3xl text-muted-foreground mb-2" size={48} />
                <p className="text-sm text-muted-foreground mb-2">Dosyaları buraya sürükleyin veya seçmek için tıklayın</p>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  id="file-upload" 
                  accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
                  onChange={handleFileSelect}
                  data-testid="input-file"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  data-testid="button-select-file"
                >
                  Dosya Seç
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Maksimum 5 dosya, her biri 10MB'dan küçük olmalı</p>
                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-1">Seçilen dosyalar:</p>
                    {selectedFiles.map((file, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{file.name}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={createTicketMutation.isPending}
                data-testid="button-submit"
              >
                <NotebookPen className="mr-2" size={16} />
                {createTicketMutation.isPending ? "Oluşturuluyor..." : "Talep Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
