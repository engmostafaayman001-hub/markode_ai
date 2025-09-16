import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import MonacoEditor from "@/components/editor/monaco-editor";
import AIAssistant from "@/components/editor/ai-assistant";
import { Play, Save, Share, Bot, FileText, Eye } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Editor() {
  const { id } = useParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [projectData, setProjectData] = useState({
    name: "مشروع جديد",
    description: "",
    files: { "index.html": "<!DOCTYPE html>\n<html>\n<head>\n    <title>مشروع جديد</title>\n</head>\n<body>\n    <h1>مرحبا بك في ماركود AI</h1>\n</body>\n</html>" }
  });
  const [activeFile, setActiveFile] = useState("index.html");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Load existing project if ID provided
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  // Setup WebSocket for real-time collaboration
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'join_project',
        projectId: id,
        userId: user?.id
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'code_change' && message.data) {
        setProjectData(prev => ({
          ...prev,
          files: {
            ...prev.files,
            [message.data.filename]: message.data.content
          }
        }));
      }
    };

    wsRef.current = socket;

    return () => {
      if (socket) {
        socket.send(JSON.stringify({
          type: 'leave_project',
          projectId: id
        }));
        socket.close();
      }
    };
  }, [id, isAuthenticated, user?.id]);

  // Load project data
  useEffect(() => {
    if (project) {
      setProjectData({
        name: project.name,
        description: project.description || "",
        files: project.files || { "index.html": "<!DOCTYPE html>\n<html>\n<head>\n    <title>مشروع جديد</title>\n</head>\n<body>\n    <h1>مرحبا بك في ماركود AI</h1>\n</body>\n</html>" }
      });
    }
  }, [project]);

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      if (id) {
        return await apiRequest("PUT", `/api/projects/${id}`, data);
      } else {
        return await apiRequest("POST", "/api/projects", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ المشروع بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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
      toast({
        title: "خطأ",
        description: "فشل في حفظ المشروع",
        variant: "destructive",
      });
    },
  });

  const handleCodeChange = (filename: string, content: string) => {
    setProjectData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [filename]: content
      }
    }));

    // Send real-time update
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'code_change',
        projectId: id,
        data: { filename, content }
      }));
    }
  };

  const handleSave = () => {
    saveProjectMutation.mutate(projectData);
  };

  const handleRunProject = () => {
    const htmlContent = projectData.files["index.html"] || "";
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleNewFile = () => {
    const filename = prompt("اسم الملف الجديد:");
    if (filename && !projectData.files[filename]) {
      const extension = filename.split('.').pop();
      let content = "";
      
      switch (extension) {
        case 'js':
          content = "// JavaScript file\nconsole.log('Hello, World!');";
          break;
        case 'css':
          content = "/* CSS file */\nbody {\n    font-family: Arial, sans-serif;\n}";
          break;
        case 'html':
          content = "<!DOCTYPE html>\n<html>\n<head>\n    <title>New Page</title>\n</head>\n<body>\n    <h1>New Page</h1>\n</body>\n</html>";
          break;
        default:
          content = "";
      }

      setProjectData(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [filename]: content
        }
      }));
      setActiveFile(filename);
    }
  };

  if (isLoading || (id && projectLoading)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" data-testid="loading-spinner"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const fileList = Object.keys(projectData.files);

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="editor-page">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-card border-l border-border flex flex-col" data-testid="file-explorer">
          <div className="p-4 border-b border-border">
            <Input
              value={projectData.name}
              onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
              className="font-semibold"
              data-testid="input-project-name"
            />
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-sm text-muted-foreground" data-testid="text-project-files">ملفات المشروع</h4>
              <Button variant="ghost" size="sm" onClick={handleNewFile} data-testid="button-new-file">
                <FileText className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {fileList.map((filename) => (
                <div
                  key={filename}
                  className={`flex items-center text-sm py-2 px-3 rounded cursor-pointer transition-colors ${
                    activeFile === filename ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => setActiveFile(filename)}
                  data-testid={`file-${filename}`}
                >
                  <FileText className="w-4 h-4 ml-2" />
                  {filename}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-border space-y-2">
            <Button onClick={handleSave} disabled={saveProjectMutation.isPending} className="w-full" data-testid="button-save">
              <Save className="w-4 h-4 ml-2" />
              {saveProjectMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
            
            <Button onClick={handleRunProject} variant="outline" className="w-full" data-testid="button-run">
              <Play className="w-4 h-4 ml-2" />
              تشغيل
            </Button>
            
            <Button 
              onClick={() => setIsAIOpen(true)} 
              variant="secondary" 
              className="w-full"
              data-testid="button-ai-assistant"
            >
              <Bot className="w-4 h-4 ml-2" />
              مساعد AI
            </Button>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="bg-card px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-active-file">{activeFile}</span>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <Button variant="ghost" size="sm" data-testid="button-share">
                <Share className="w-4 h-4 ml-1" />
                مشاركة
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-preview">
                <Eye className="w-4 h-4 ml-1" />
                معاينة
              </Button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              value={projectData.files[activeFile] || ""}
              onChange={(content) => handleCodeChange(activeFile, content)}
              language={activeFile.endsWith('.js') ? 'javascript' : activeFile.endsWith('.css') ? 'css' : 'html'}
            />
          </div>
        </div>

        {/* AI Assistant Panel */}
        {isAIOpen && (
          <div className="w-80 bg-card border-r border-border">
            <AIAssistant 
              onClose={() => setIsAIOpen(false)} 
              onCodeGenerated={(code) => handleCodeChange(activeFile, code)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
