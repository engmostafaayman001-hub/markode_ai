import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProjectCard from "@/components/projects/project-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Code, Eye, Edit, TrendingUp, Users, Calendar, Activity } from "lucide-react";

// Types
type ProjectFile = {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
};

type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  files: ProjectFile[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
};

type AnalyticsEvent = {
  id: string;
  event: 'create' | 'view' | 'edit';
  createdAt: string;
};

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  // Queries
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsEvent[]>({
    queryKey: ["/api/analytics/user"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" data-testid="loading-spinner"/>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Process analytics data
  const totalProjects = projects?.length || 0;
  const totalViews = analytics?.filter(a => a.event === 'view').length || 0;
  const totalEdits = analytics?.filter(a => a.event === 'edit').length || 0;
  const totalCreates = analytics?.filter(a => a.event === 'create').length || 0;

  // Chart data
  const activityData = [
    { name: 'إنشاء', value: totalCreates, color: '#3b82f6' },
    { name: 'مشاهدة', value: totalViews, color: '#10b981' },
    { name: 'تعديل', value: totalEdits, color: '#f59e0b' },
  ];

  const weeklyData = [
    { day: 'السبت', projects: 2, views: 15 },
    { day: 'الأحد', projects: 1, views: 8 },
    { day: 'الاثنين', projects: 3, views: 22 },
    { day: 'الثلاثاء', projects: 1, views: 12 },
    { day: 'الأربعاء', projects: 2, views: 18 },
    { day: 'الخميس', projects: 1, views: 14 },
    { day: 'الجمعة', projects: 0, views: 6 },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="dashboard-title">
            لوحة التحكم
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="dashboard-subtitle">
            تتبع أداء مشاريعك وإحصائياتك
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-total-projects">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="w-12 h-12 text-primary ml-4" />
                <div>
                  <p className="text-3xl font-bold" data-testid="stat-total-projects-value">{totalProjects}</p>
                  <p className="text-sm text-muted-foreground" data-testid="stat-total-projects-label">إجمالي المشاريع</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-views">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="w-12 h-12 text-accent ml-4" />
                <div>
                  <p className="text-3xl font-bold" data-testid="stat-total-views-value">{totalViews}</p>
                  <p className="text-sm text-muted-foreground" data-testid="stat-total-views-label">إجمالي المشاهدات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-edits">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="w-12 h-12 text-orange-500 ml-4" />
                <div>
                  <p className="text-3xl font-bold" data-testid="stat-total-edits-value">{totalEdits}</p>
                  <p className="text-sm text-muted-foreground" data-testid="stat-total-edits-label">إجمالي التعديلات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-user-role">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-12 h-12 text-purple-500 ml-4" />
                <div>
                  <p className="text-2xl font-bold" data-testid="stat-user-role-value">{user?.role || 'trial'}</p>
                  <p className="text-sm text-muted-foreground" data-testid="stat-user-role-label">دورك في المنصة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" data-testid="dashboard-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">المشاريع</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6" data-testid="content-overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <Card data-testid="chart-weekly-activity">
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="chart-weekly-title">
                    <TrendingUp className="w-5 h-5 ml-2" />
                    النشاط الأسبوعي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projects" fill="#3b82f6" name="مشاريع" />
                      <Bar dataKey="views" fill="#10b981" name="مشاهدات" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Activity Distribution */}
              <Card data-testid="chart-activity-distribution">
                <CardHeader>
                  <CardTitle className="flex items-center" data-testid="chart-distribution-title">
                    <Activity className="w-5 h-5 ml-2" />
                    توزيع النشاطات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card data-testid="recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="recent-activity-title">
                  <Calendar className="w-5 h-5 ml-2" />
                  النشاطات الأخيرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-reverse space-x-3 animate-pulse" data-testid={`activity-skeleton-${i}`}>
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-1"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : analytics && analytics.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-reverse space-x-3 p-3 rounded-lg hover:bg-muted/50">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.event === 'create' ? 'bg-blue-100 text-blue-600' :
                          activity.event === 'view' ? 'bg-green-100 text-green-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {activity.event === 'create' ? <Code className="w-4 h-4" /> :
                           activity.event === 'view' ? <Eye className="w-4 h-4" /> :
                           <Edit className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.event === 'create' ? 'تم إنشاء مشروع جديد' :
                             activity.event === 'view' ? 'تم عرض مشروع' :
                             'تم تعديل مشروع'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد نشاطات بعد</h3>
                    <p className="text-muted-foreground">ابدأ بإنشاء مشاريع جديدة لرؤية النشاطات هنا</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">جميع المشاريع</h2>
              <Button onClick={() => window.location.href = '/editor'}>
                مشروع جديد
              </Button>
            </div>

            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard
                 key={project.id}
                 project={{
                 ...project,
                 updatedAt: project.updatedAt || project.createdAt, // ضمان أن يكون string
                 files: project.files.reduce((acc, file) => {
                 acc[file.name] = file.name; // أو أي حقل موجود في ProjectFile
                 return acc;
                 }, {} as Record<string, string>)
                 }}
                 />

                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد مشاريع بعد</h3>
                  <p className="text-muted-foreground mb-4">ابدأ مشروعك الأول الآن!</p>
                  <Button onClick={() => window.location.href = '/editor'}>
                    إنشاء مشروع جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء المشاريع</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="projects" fill="#3b82f6" name="مشاريع جديدة" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معدل التفاعل</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#10b981" name="مشاهدات" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
