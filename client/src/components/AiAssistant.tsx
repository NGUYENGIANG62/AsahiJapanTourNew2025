import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useCalculatorContext } from '@/hooks/useCalculatorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Send, RefreshCw, Bot, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function AiAssistant() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { calculation } = useCalculatorContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Xin chào! Tôi là trợ lý AI của AsahiJapanTours. Tôi có thể giúp gì cho bạn về các tour du lịch tại Nhật Bản?',
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Thêm tin nhắn của người dùng
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    
    try {
      // Gửi yêu cầu đến API
      const response = await apiRequest('POST', '/api/ai-assistant', {
        type: 'custom_question',
        message: userMessage,
      });
      
      const data = await response.json();
      
      // Thêm phản hồi từ AI
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error querying AI assistant:", error);
      // Thêm tin nhắn lỗi
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi qua email: asahivietlifejapantours@gmail.com',
          timestamp: new Date(),
        },
      ]);
      
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến trợ lý AI, vui lòng thử lại sau",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetTourInfo = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai-assistant', {
        type: 'tour_intro'
      });
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Giới thiệu cho tôi về du lịch Nhật Bản',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error getting tour info:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy thông tin tour từ trợ lý AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExplainPrice = async () => {
    if (!calculation) {
      toast({
        title: "Chưa có dữ liệu giá",
        description: "Vui lòng tạo báo giá trước khi yêu cầu giải thích",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai-assistant', {
        type: 'price_explanation',
        calculationData: calculation
      });
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'user',
          content: 'Giải thích chi tiết báo giá tour cho tôi',
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error explaining price:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lấy giải thích về giá từ trợ lý AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const clearChat = () => {
    setMessages([
      {
        role: 'system',
        content: 'Xin chào! Tôi là trợ lý AI của AsahiJapanTours. Tôi có thể giúp gì cho bạn về các tour du lịch tại Nhật Bản?',
        timestamp: new Date(),
      },
    ]);
  };
  
  if (!isOpen) {
    return (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl z-50"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-6 right-6 w-[350px] h-[500px] shadow-lg z-50 flex flex-col">
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-md flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          Trợ lý AsahiTour
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-1 mx-4 my-2">
          <TabsTrigger value="chat">Hỏi đáp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <ScrollArea className="flex-1 p-4">
            {messages.map((message, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                <div
                  className={`text-xs text-muted-foreground mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetTourInfo}
                disabled={isLoading}
              >
                Tour
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExplainPrice}
                disabled={isLoading || !calculation}
              >
                Giá
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !userMessage.trim()}
                className="self-end"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}