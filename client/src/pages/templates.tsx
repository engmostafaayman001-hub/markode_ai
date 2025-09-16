import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import TemplateCard from "@/components/templates/template-card";
import { Search, Filter } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

const categories = [
  { id: "all", name: "الكل" },
  { id: "business", name: "مواقع الشركات" },
  { id: "ecommerce", name: "متاجر إلكترونية" },
  { id: "blog", name: "مدونات" },
  { id: "dashboard", name: "لوحات تحكم" },
  { id: "portfolio", name: "معرض أعمال" },
];

export default function Templates() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates", selectedCategory === "all" ? undefined : selectedCategory],
    enabled: isAuthenticated,
    retry: false,
  });

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = await apiRequest("GET", `/api/templates/${templateId}`);
      const templateData = await template.json();
      
      return await apiRequest("POST", "/api/projects", {
        name: `${templateData.name} - نسخة`,
        description: templateData.description,
        templateId: templateId,
        files: templateData.files
      });
    },
    onSuccess: (response) => {
      toast({
        title: "تم إنشاء المشروع",
        description: "تم إنشاء مشروع جديد من القالب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      // Navigate to editor
      window.location.href = `/editor`;
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
        description: "فشل في استخدام القالب",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" data-testid="loading-spinner"/>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredTemplates = templates?.filter((template: any) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background" data-testid="templates-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="templates-title">
            معرض القوالب الاحترافية
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="templates-subtitle">
            قوالب جاهزة ومصممة باحترافية لجميع أنواع المشاريع
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ابحث في القوالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-templates"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {templatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse" data-testid={`template-skeleton-${i}`}>
                <div className="aspect-video bg-muted"></div>
                <div className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template: any) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => useTemplateMutation.mutate(template.id)}
                isLoading={useTemplateMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2" data-testid="no-templates-title">
              لا توجد قوالب متطابقة
            </h3>
            <p className="text-muted-foreground" data-testid="no-templates-description">
              حاول تغيير مصطلحات البحث أو الفئة المحددة
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
