import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Star, Crown } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  downloads: number;
  isPremium: boolean;
}

interface TemplateCardProps {
  template: Template;
  onUse: () => void;
  isLoading?: boolean;
}

export default function TemplateCard({ template, onUse, isLoading = false }: TemplateCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'from-blue-500 to-cyan-600';
      case 'ecommerce':
        return 'from-green-500 to-teal-600';
      case 'blog':
        return 'from-purple-500 to-pink-600';
      case 'dashboard':
        return 'from-orange-500 to-red-600';
      case 'portfolio':
        return 'from-indigo-500 to-purple-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'business':
        return 'موقع شركة';
      case 'ecommerce':
        return 'متجر إلكتروني';
      case 'blog':
        return 'مدونة';
      case 'dashboard':
        return 'لوحة تحكم';
      case 'portfolio':
        return 'معرض أعمال';
      default:
        return 'عام';
    }
  };

  return (
    <Card className="overflow-hidden hover:scale-105 transition-transform group border border-border" data-testid={`template-card-${template.id}`}>
      {/* Template Preview */}
      <div className={`aspect-video bg-gradient-to-br ${getCategoryColor(template.category)} relative overflow-hidden`}>
        {template.isPremium && (
          <div className="absolute top-3 right-3 bg-yellow-500/20 backdrop-blur-sm text-yellow-600 px-2 py-1 rounded-full text-xs font-bold flex items-center" data-testid={`template-premium-badge-${template.id}`}>
            <Crown className="w-3 h-3 ml-1" />
            مميز
          </div>
        )}
        
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm p-4">
          <div className="bg-white/20 rounded p-2 mb-2 text-white text-xs" data-testid={`template-category-${template.id}`}>
            {getCategoryName(template.category)}
          </div>
          
          {/* Mock website layout based on category */}
          {template.category === 'ecommerce' && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div className="bg-white/30 rounded h-8"></div>
                <div className="bg-white/30 rounded h-8"></div>
                <div className="bg-white/30 rounded h-8"></div>
              </div>
              <div className="bg-white/30 rounded h-4 mb-1"></div>
              <div className="bg-white/30 rounded h-4 w-3/4"></div>
            </div>
          )}
          
          {template.category === 'business' && (
            <div className="space-y-2">
              <div className="bg-white/30 rounded h-6 mb-2"></div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white/30 rounded h-12"></div>
                <div className="bg-white/30 rounded h-12"></div>
              </div>
              <div className="bg-white/30 rounded h-3 mb-1"></div>
              <div className="bg-white/30 rounded h-3 w-2/3"></div>
            </div>
          )}
          
          {template.category === 'dashboard' && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-1 mb-2">
                <div className="bg-white/30 rounded h-4"></div>
                <div className="bg-white/30 rounded h-4"></div>
                <div className="bg-white/30 rounded h-4"></div>
                <div className="bg-white/30 rounded h-4"></div>
              </div>
              <div className="bg-white/30 rounded h-8 mb-1"></div>
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-white/30 rounded h-6"></div>
                <div className="bg-white/30 rounded h-6"></div>
              </div>
            </div>
          )}
          
          {(template.category === 'blog' || template.category === 'portfolio') && (
            <div className="space-y-2">
              <div className="bg-white/30 rounded h-8 mb-2"></div>
              <div className="bg-white/30 rounded h-3 mb-1"></div>
              <div className="bg-white/30 rounded h-3 mb-1"></div>
              <div className="bg-white/30 rounded h-3 w-1/2"></div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <div className="bg-white/30 rounded h-6"></div>
                <div className="bg-white/30 rounded h-6"></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="sm" data-testid={`button-preview-${template.id}`}>
            <Eye className="w-4 h-4 ml-1" />
            معاينة
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold leading-tight" data-testid={`template-name-${template.id}`}>
            {template.name}
          </h3>
          <Badge variant="outline" data-testid={`template-category-badge-${template.id}`}>
            {getCategoryName(template.category)}
          </Badge>
        </div>
        
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed" data-testid={`template-description-${template.id}`}>
          {template.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground" data-testid={`template-stats-${template.id}`}>
            <Download className="w-4 h-4 ml-1" />
            <span data-testid={`template-downloads-${template.id}`}>{template.downloads.toLocaleString('ar-EG')} تحميل</span>
          </div>
          
          <Button 
            onClick={onUse}
            disabled={isLoading}
            className="hover:scale-105 transition-transform"
            data-testid={`button-use-template-${template.id}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Star className="w-4 h-4 ml-2" />
                استخدم القالب
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
