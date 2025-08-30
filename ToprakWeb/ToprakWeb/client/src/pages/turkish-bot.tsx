import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, MessageCircle, Sparkles, Trash2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isTyping?: boolean;
}

const SAMPLE_RESPONSES = [
  "Merhaba! Size nasıl yardımcı olabilirim?",
  "Bu konuda size daha detaylı bilgi verebilirim.",
  "Anlıyorum, başka bir sorunuz var mı?",
  "Bu durum hakkında şunları önerebilirim...",
  "Elbette, bu konuda yardımcı olabilirim.",
  "Başka bir şey sormak istiyorsanız, hazırım!",
  "Bu konu hakkında daha fazla bilgi ister misiniz?",
];

export default function TurkishBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Merhaba! Ben Turkish Bot'um. Size Türkçe olarak yardımcı olabilirim. Sorularınızı bekliyorum! 🇹🇷",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const randomResponse = SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)];
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        text: "Merhaba! Ben Turkish Bot'um. Size Türkçe olarak yardımcı olabilirim. Sorularınızı bekliyorum! 🇹🇷",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout 
      title="Turkish Bot" 
      subtitle="AI destekli Türkçe asistan ile sohbet edin"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Mesaj</p>
                  <p className="text-2xl font-bold" data-testid="stats-total-messages">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Bot Durumu</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Aktif
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">AI Modeli</p>
                  <p className="font-medium">Turkish GPT v1.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col" data-testid="chat-interface">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span>Turkish Bot Chat</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearChat}
              data-testid="button-clear-chat"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Temizle
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4 space-y-4">
            {/* Messages Area */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4" data-testid="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.sender}-${message.id}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white ml-12"
                          : "bg-muted mr-12"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === "bot" && (
                          <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
                        )}
                        {message.sender === "user" && (
                          <User className="h-4 w-4 mt-1 flex-shrink-0 text-white" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p
                            className={`text-xs mt-2 ${
                              message.sender === "user" ? "text-blue-100" : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start" data-testid="typing-indicator">
                    <div className="max-w-[70%] p-3 rounded-lg bg-muted mr-12">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">yazıyor...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex space-x-2" data-testid="input-area">
              <Input
                ref={inputRef}
                placeholder="Mesajınızı yazın..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1"
                data-testid="input-message"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Sorular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Ürün kataloğunu göster",
                "Destek talebi oluştur",
                "Stok durumu nasıl?",
                "Sipariş takibi yap",
                "İletişim bilgileri",
                "Yardım menüsü",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() => setInputMessage(question)}
                  data-testid={`quick-question-${index}`}
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
