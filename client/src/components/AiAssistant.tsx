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
import { Brain, Send, RefreshCw, Bot, X, Plane, DollarSign, MessageSquare, Map } from 'lucide-react';
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
      content: 'Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours. Tôi có thể giúp gì cho bạn về các tour du lịch tại Nhật Bản?',
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // State để theo dõi chế độ nhập hiện tại
  const [inputMode, setInputMode] = useState<'normal' | 'tour_suggestion'>('normal');
  
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    // Thêm tin nhắn của người dùng
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newUserMessage]);
    const currentMessage = userMessage; // Lưu lại tin nhắn hiện tại
    setUserMessage(''); // Xóa tin nhắn sau khi gửi
    setIsLoading(true);
    
    try {
      // Xác định loại yêu cầu dựa trên chế độ nhập
      const requestType = inputMode === 'tour_suggestion' ? 'tour_suggestion' : 'custom_question';
      
      // Gửi yêu cầu đến API
      const response = await apiRequest('POST', '/api/ai-assistant', {
        type: requestType,
        message: currentMessage,
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
      
      // Đặt lại chế độ nhập về normal sau khi gửi
      setInputMode('normal');
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
      
      // Đặt lại chế độ nhập về normal sau khi gặp lỗi
      setInputMode('normal');
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
  
  const handleTourSuggestion = async () => {
    // Chuyển đổi trạng thái input mode sang tour_suggestion
    setInputMode('tour_suggestion');
    
    // Hiển thị popup yêu cầu người dùng nhập yêu cầu tour
    toast({
      title: "Gợi ý tour du lịch",
      description: "Mô tả ngắn gọn nhu cầu du lịch của bạn để nhận gợi ý tour phù hợp. Ví dụ: thời gian, sở thích, ngân sách...",
      duration: 5000,
    });
    
    // Đặt tin nhắn gợi ý vào hộp chat
    setUserMessage("Tôi muốn đi du lịch Nhật Bản khoảng 1 tuần vào tháng 5, thích văn hóa truyền thống và ẩm thực, ngân sách trung bình...");
    
    // Focus vào textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
      }, 100);
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
        content: 'Xin chào! Tôi là Leo - trợ lý ảo của AsahiJapanTours. Tôi có thể giúp gì cho bạn về các tour du lịch tại Nhật Bản?',
        timestamp: new Date(),
      },
    ]);
  };
  
  if (!isOpen) {
    return (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl z-50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none animate-pulse"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative">
          <Brain className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </Button>
    );
  }
  
  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[500px] shadow-xl z-50 flex flex-col overflow-hidden border border-purple-200 dark:border-purple-800">
      <CardHeader className="px-4 py-2 flex flex-row items-center justify-between bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <CardTitle className="text-md flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          <span className="flex items-center">
            Trợ lý ảo Leo
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </span>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-1 mx-4 my-2">
          <TabsTrigger value="chat">Hỏi đáp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-220px)]" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((message, index) => (
              <div key={index} className="mb-4">
                <div
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] overflow-auto ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-md'
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
          </div>
          
          <Separator />
          
          <div className="p-4 pt-2">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetTourInfo}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-none hover:opacity-90"
              >
                <Plane className="h-3.5 w-3.5 mr-1" /> Tour
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTourSuggestion}
                disabled={isLoading}
                className={`bg-gradient-to-r from-purple-400 to-violet-400 text-white border-none hover:opacity-90 ${
                  inputMode === 'tour_suggestion' ? 'ring-2 ring-purple-300' : ''
                }`}
              >
                <Map className="h-3.5 w-3.5 mr-1" /> Gợi ý
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExplainPrice}
                disabled={isLoading || !calculation}
                className="bg-gradient-to-r from-green-400 to-emerald-400 text-white border-none hover:opacity-90"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1" /> Giá
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={isLoading}
                className="bg-gradient-to-r from-amber-400 to-orange-400 text-white border-none hover:opacity-90"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  inputMode === 'tour_suggestion'
                    ? "Mô tả nhu cầu du lịch của bạn (thời gian, sở thích, ngân sách...)..."
                    : "Nhập câu hỏi của bạn cho Leo..."
                }
                className={`min-h-[80px] resize-none ${
                  inputMode === 'tour_suggestion'
                    ? 'focus:border-violet-400 focus:ring-violet-300 border-violet-200'
                    : 'focus:border-purple-400 focus:ring-purple-300'
                }`}
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !userMessage.trim()}
                className="self-end bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:opacity-90"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}