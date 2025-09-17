import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { useToast } from "@/hooks/use-toast.ts";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import Header from "@/components/layout/header.tsx";
import Footer from "@/components/layout/footer.tsx";
import ProjectCard from "@/components/projects/project-card.tsx";
import { Code, Plus, BarChart3, Users, Zap } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  templateId?: string;
  files: Record<string, string>;
  isPublic: boolean;
  deployUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsEvent {
  event: "view" | "edit" | string;
  projectId: string;
  timestamp: string;
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    retry: false,
  });

  const { data: analytics } = useQuery<AnalyticsEvent[]>({
    queryKey: ["/api/analytics/user"],
    retry: false,
  });

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
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div
          className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
          aria-label="Loading"
          data-testid="loading-spinner"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // الآن TypeScript يعرف أن projects مصفوفة و analytics مصفوفة
  const recentProjects = projects?.slice(0, 3) || [];
  const totalProjects = projects?.length || 0;
  const totalViews = analytics?.filter(a => a.event === "view").length || 0;
  const totalEdits = analytics?.filter(a => a.event === "edit").length || 0;

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            data-testid="welcome-title"
          >
            مرحباً، {user?.firstName || "مطور"}! 👋
          </h1>
          <p
            className="text-xl text-muted-foreground"
            data-testid="welcome-subtitle"
          >
            ما الذي تريد بناءه اليوم؟
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/editor">
            <Card
              className="hover:scale-105 transition-transform cursor-pointer"
              data-testid="card-new-project"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  data-testid="text-new-project"
                >
                  مشروع جديد
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-new-project-desc"
                >
                  ابدأ من الصفر أو استخدم قالب
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/templates">
            <Card
              className="hover:scale-105 transition-transform cursor-pointer"
              data-testid="card-templates"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4 mx-auto">
                  <Code className="w-6 h-6" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  data-testid="text-templates"
                >
                  تصفح القوالب
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-templates-desc"
                >
                  قوالب جاهزة لجميع أنواع المشاريع
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card
              className="hover:scale-105 transition-transform cursor-pointer"
              data-testid="card-dashboard"
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500 mb-4 mx-auto">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3
                  className="font-semibold mb-2"
                  data-testid="text-dashboard"
                >
                  لوحة التحكم
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-dashboard-desc"
                >
                  تحليلات وإحصائيات مشاريعك
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card data-testid="stat-projects">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Code className="w-8 h-8 text-primary ml-3" />
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="stat-projects-count"
                  >
                    {totalProjects}
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="stat-projects-label"
                  >
                    مشروع
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-views">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-accent ml-3" />
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="stat-views-count"
                  >
                    {totalViews}
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="stat-views-label"
                  >
                    مشاهدة
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-edits">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-orange-500 ml-3" />
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="stat-edits-count"
                  >
                    {totalEdits}
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="stat-edits-label"
                  >
                    تعديل
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-role">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 ml-3">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className="text-lg font-bold"
                    data-testid="stat-role-value"
                  >
                    {user?.role || "trial"}
                  </p>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="stat-role-label"
                  >
                    الدور
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl font-bold"
              data-testid="recent-projects-title"
            >
              المشاريع الأخيرة
            </h2>
            <Link href="/dashboard">
              <Button variant="outline" data-testid="button-view-all">
                عرض الكل
              </Button>
            </Link>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse"
                  data-testid={`skeleton-project-${i}`}
                >
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-3 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card data-testid="empty-projects">
              <CardContent className="p-8 text-center">
                <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3
                  className="text-lg font-semibold mb-2"
                  data-testid="empty-projects-title"
                >
                  لا توجد مشاريع بعد
                </h3>
                <p
                  className="text-muted-foreground mb-4"
                  data-testid="empty-projects-description"
                >
                  ابدأ مشروعك الأول الآن!
                </p>
                <Link href="/editor">
                  <Button data-testid="button-create-first-project">
                    إنشاء مشروع جديد
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Assistant Quick Access */}
        <Card
          className="bg-gradient-to-r from-primary to-accent text-white"
          data-testid="ai-assistant-card"
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-xl font-bold mb-2"
                  data-testid="ai-assistant-title"
                >
                  مساعد ماركود AI
                </h3>
                <p
                  className="text-white/90"
                  data-testid="ai-assistant-description"
                >
                  اسأل المساعد الذكي عن أي شيء تريد برمجته
                </p>
              </div>
              <Link href="/editor">
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-primary"
                  data-testid="button-ask-ai"
                >
                  اسأل الآن
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
