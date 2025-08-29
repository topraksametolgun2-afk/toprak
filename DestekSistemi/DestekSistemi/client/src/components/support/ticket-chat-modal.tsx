import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { X, Send, Paperclip } from "lucide-react";
import type { Ticket, TicketMessage } from "@shared/schema";

const messageSchema = z.object({
  message: z.string().min(1, "Mesaj boş olamaz"),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface TicketChatModalProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function TicketChatModal({ ticket, open, onOpenChange, isAdmin = false }: TicketChatModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const { data: ticketData, isLoading } = useQuery<{ ticket: Ticket; messages: TicketMessage[] }>({
    queryKey: ["/api/support/tickets", ticket.id],
    enabled: open,
  });

  const messages: TicketMessage[] = ticketData?.messages || [];

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const response = await apiRequest("POST", `/api/support/tickets/${ticket.id}/messages`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", ticket.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const closeTicketMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/support/tickets/${ticket.id}/status`, { status: "CLOSED" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      toast({
        title: "Başarılı",
        description: "Destek talebi kapatıldı.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Talep kapatılırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInMinutes < 1440) {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} saat önce`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays} gün önce`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl mx-4 h-5/6 flex flex-col p-0" data-testid="modal-ticket-chat">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold" data-testid="text-ticket-chat-subject">{ticket.subject}</h3>
            <p className="text-sm text-muted-foreground">
              <span data-testid="text-ticket-chat-id">#{ticket.id.slice(-8)}</span> • 
              <span data-testid="text-ticket-chat-status" className="ml-1">
                {ticket.status === "OPEN" ? "Açık" : "Kapalı"}
              </span> • 
              <span className="ml-1">Kullanıcı Talebi</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isAdmin && ticket.status === "OPEN" && (
              <Button
                onClick={() => closeTicketMutation.mutate()}
                disabled={closeTicketMutation.isPending}
                className="bg-green-600 text-white hover:bg-green-700"
                size="sm"
                data-testid="button-close-ticket"
              >
                {closeTicketMutation.isPending ? "Kapatılıyor..." : "Talebi Kapat"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-chat"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="container-ticket-messages">
          {/* Initial ticket message */}
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              U
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium">Kullanıcı</span>
                <span className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm" data-testid="text-initial-ticket-message">{ticket.body}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Mesajlar yükleniyor...</div>
          ) : (
            messages.map((message: TicketMessage) => (
              <div key={message.id} className="flex space-x-3" data-testid={`message-${message.id}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isAdmin ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {isAdmin ? "D" : "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">
                      {isAdmin ? "Destek Ekibi" : "Kullanıcı"}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    isAdmin ? "bg-primary/10 border border-primary/20" : "bg-muted"
                  }`}>
                    <p className="text-sm" data-testid={`text-message-content-${message.id}`}>{message.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        {ticket.status === "OPEN" && (
          <div className="p-4 border-t border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-3">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Mesajınızı yazın..."
                            rows={3}
                            className="resize-none"
                            {...field}
                            data-testid="textarea-message-input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    disabled={sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
