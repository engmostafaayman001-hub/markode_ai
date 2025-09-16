import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, X, Code, Lightbulb, Bug, Sparkles } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  onClose: () => void;
  onCodeGenerated?: (code: string) => void;
}

export default function AIAssistant({ onClose, onCodeGenerated }: AIAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'مرحباً! أنا مساعد ماركود AI. كيف يمكنني مساعدتك في البرمجة اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [codeDescription, setCodeDescription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [selectedFramework, setSelectedFramework] = useState('react');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async (data: { description: string; language: string; framework: string; features: string[] }) => {
      return await apiRequest("POST", "/api/ai/generate", data);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `تم إنشاء الكود بنجاح! إليك ما تم إنشاؤه:\n\n**الوصف:** ${result.description}\n\n**تعليمات الإعداد:** ${result.setup_instructions}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Extract main file content for editor
      const mainFile = result.files['index.html'] || result.files['App.tsx'] || result.files['main.js'] || Object.values(result.files)[0];
      if (mainFile && onCodeGenerated) {
        onCodeGenerated(mainFile as string);
      }
      
      toast({
        title: "تم إنشاء الكود",
        description: "تم إنشاء الكود وإضافته للمحرر بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل الخروج. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'عذراً، حدث خطأ في إنشاء الكود. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الكود",
        variant: "destructive",
      });
    },
  });

  // Improve code mutation
  const improveCodeMutation = useMutation({
    mutationFn: async (data: { code: string; issue: string }) => {
      return await apiRequest("POST", "/api/ai/improve", data);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `إليك اقتراح لتحسين الكود:\n\n${result.suggestion}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'عذراً، لم أتمكن من تحليل الكود. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response for general questions
    setTimeout(() => {
      const responses = [
        'شكراً لسؤالك! يمكنني مساعدتك في البرمجة والتطوير. استخدم تبويب "إنشاء كود" لإنشاء كود جديد.',
        'أنا هنا للمساعدة! يمكنني إنشاء كود، تحسين الكود الموجود، وإصلاح الأخطاء.',
        'ممتاز! استخدم الأدوات المختلفة في الأسفل لمساعدتك في مشروعك.'
      ];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleGenerateCode = () => {
    if (!codeDescription.trim()) {
      toast({
        title: "يرجى إدخال وصف المشروع",
        description: "اكتب وصفاً واضحاً لما تريد إنشاءه",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: `أريد إنشاء: ${codeDescription} (${selectedLanguage} - ${selectedFramework})`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCodeDescription('');

    generateCodeMutation.mutate({
      description: codeDescription,
      language: selectedLanguage,
      framework: selectedFramework,
      features: []
    });
  };

  const quickActions = [
    {
      title: "إنشاء صفحة ويب",
      description: "صفحة HTML بسيطة وجميلة",
      icon: <Code className="w-4 h-4" />,
      action: () => setCodeDescription("صفحة ويب بسيطة وجميلة مع تصميم حديث")
    },
    {
      title: "تطبيق React",
      description: "تطبيق React متكامل",
      icon: <Sparkles className="w-4 h-4" />,
      action: () => setCodeDescription("تطبيق React متكامل مع مكونات وحالة")
    },
    {
      title: "API باستخدام Node.js",
      description: "خدمة API RESTful",
      icon: <Bot className="w-4 h-4" />,
      action: () => setCodeDescription("API RESTful باستخدام Node.js و Express")
    }
  ];

  return (
    <Card className="h-full flex flex-col" data-testid="ai-assistant">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center text-lg" data-testid="ai-assistant-title">
          <Bot className="w-5 h-5 ml-2 text-primary" />
          مساعد ماركود AI
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-ai">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col" data-testid="ai-assistant-tabs">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat" data-testid="tab-chat">محادثة</TabsTrigger>
            <TabsTrigger value="generate" data-testid="tab-generate">إنشاء كود</TabsTrigger>
            <TabsTrigger value="improve" data-testid="tab-improve">تحسين</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col space-y-4" data-testid="content-chat">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4" data-testid="chat-messages">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap" data-testid={`message-content-${message.id}`}>
                        {message.content}
                      </div>
                      <div className="text-xs mt-1 opacity-70" data-testid={`message-time-${message.id}`}>
                        {message.timestamp.toLocaleTimeString('ar-EG')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground" data-testid="quick-actions-title">اقتراحات سريعة:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    className="justify-start h-auto p-3"
                    data-testid={`quick-action-${index}`}
                  >
                    <div className="flex items-start space-x-reverse space-x-3">
                      {action.icon}
                      <div className="text-right">
                        <div className="font-medium text-xs" data-testid={`quick-action-title-${index}`}>
                          {action.title}
                        </div>
                        <div className="text-xs text-muted-foreground" data-testid={`quick-action-desc-${index}`}>
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اسأل مساعد ماركود AI..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                data-testid="input-chat-message"
              />
              <Button onClick={handleSendMessage} size="sm" data-testid="button-send-message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="flex-1 flex flex-col space-y-4" data-testid="content-generate">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block" data-testid="label-project-description">
                  وصف المشروع
                </label>
                <Textarea
                  value={codeDescription}
                  onChange={(e) => setCodeDescription(e.target.value)}
                  placeholder="مثال: أريد إنشاء موقع شركة بتصميم حديث يحتوي على صفحة رئيسية، من نحن، وتواصل معنا..."
                  rows={4}
                  data-testid="textarea-code-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-2 block" data-testid="label-language">اللغة</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    data-testid="select-language"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" data-testid="label-framework">الإطار</label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    data-testid="select-framework"
                  >
                    <option value="react">React</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="vanilla">Vanilla JS</option>
                    <option value="express">Express.js</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerateCode}
                disabled={generateCodeMutation.isPending}
                className="w-full"
                data-testid="button-generate-code"
              >
                <Sparkles className="w-4 h-4 ml-2" />
                {generateCodeMutation.isPending ? "جاري الإنشاء..." : "إنشاء الكود"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="improve" className="flex-1 flex flex-col space-y-4" data-testid="content-improve">
            <div className="text-center py-8">
              <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="improve-title">تحسين الكود</h3>
              <p className="text-sm text-muted-foreground mb-4" data-testid="improve-description">
                قم بلصق الكود الذي تريد تحسينه واذكر المشكلة أو التحسين المطلوب
              </p>
              <Badge variant="secondary" data-testid="improve-badge">قريباً</Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
