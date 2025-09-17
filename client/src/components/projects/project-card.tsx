import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Code, Calendar, Globe, MoreHorizontal, Edit, Trash2, Share } from "lucide-react";

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

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const getProjectType = () => {
    const files = Object.keys(project.files);
    if (files.some(f => f.endsWith('.tsx') || f.endsWith('.jsx'))) {
      return { type: 'React', color: 'bg-blue-500' };
    } else if (files.some(f => f.endsWith('.vue'))) {
      return { type: 'Vue.js', color: 'bg-green-500' };
    } else if (files.some(f => f.endsWith('.html'))) {
      return { type: 'HTML', color: 'bg-orange-500' };
    } else if (files.some(f => f.endsWith('.js'))) {
      return { type: 'JavaScript', color: 'bg-yellow-500' };
    }
    return { type: 'مشروع', color: 'bg-gray-500' };
  };

  const projectType = getProjectType();
  const lastUpdated = new Date(project.updatedAt);
  const isRecentlyUpdated = Date.now() - lastUpdated.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      onDelete(project.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/editor/${project.id}`);
    // You might want to show a toast notification here
  };

  return (
    <Card className="hover:scale-105 transition-transform group border border-border" data-testid={`project-card-${project.id}`}>
      <CardContent className="p-0">
        <Link href={`/editor/${project.id}`}>
          <div className="cursor-pointer">
            {/* Project Header */}
            <div className="p-4 border-b border-border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 ${projectType.color} rounded-full`} data-testid={`project-type-indicator-${project.id}`}></div>
                    <Badge variant="secondary" className="text-xs" data-testid={`project-type-badge-${project.id}`}>
                      {projectType.type}
                    </Badge>
                    {isRecentlyUpdated && (
                      <Badge variant="default" className="text-xs" data-testid={`project-recent-badge-${project.id}`}>
                        جديد
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1 line-clamp-2" data-testid={`project-name-${project.id}`}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`project-menu-${project.id}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" data-testid={`project-menu-content-${project.id}`}>
                    <DropdownMenuItem asChild>
                      <Link href={`/editor/${project.id}`}>
                        <Edit className="w-4 h-4 ml-2" />
                        <span data-testid={`menu-edit-${project.id}`}>تعديل</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShare} data-testid={`menu-share-${project.id}`}>
                      <Share className="w-4 h-4 ml-2" />
                      <span>مشاركة</span>
                    </DropdownMenuItem>
                    {project.deployUrl && (
                      <DropdownMenuItem asChild>
                        <a href={project.deployUrl} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4 ml-2" />
                          <span data-testid={`menu-view-live-${project.id}`}>عرض مباشر</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive" data-testid={`menu-delete-${project.id}`}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      <span>حذف</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Project Files Preview */}
            <div className="p-4">
              <div className="bg-slate-900 rounded-lg p-3 text-slate-300 text-xs font-mono leading-relaxed overflow-hidden" data-testid={`project-code-preview-${project.id}`}>
                <div className="flex items-center mb-2">
                  <div className="flex space-x-reverse space-x-1 ml-3">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-slate-400">
                    {Object.keys(project.files)[0] || 'index.html'}
                  </span>
                </div>
                <div className="line-clamp-3">
                  {Object.values(project.files)[0]?.substring(0, 120) || '<!-- Empty project -->'}
                  {Object.values(project.files)[0]?.length > 120 && '...'}
                </div>
              </div>
            </div>

            {/* Project Footer */}
            <div className="px-4 pb-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center" data-testid={`project-updated-${project.id}`}>
                  <Calendar className="w-3 h-3 ml-1" />
                  آخر تحديث: {lastUpdated.toLocaleDateString('ar-EG')}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center" data-testid={`project-files-count-${project.id}`}>
                    <Code className="w-3 h-3 ml-1" />
                    {Object.keys(project.files).length} ملف
                  </div>
                  
                  {project.isPublic && (
                    <Badge variant="outline" className="text-xs" data-testid={`project-public-badge-${project.id}`}>
                      <Globe className="w-3 h-3 ml-1" />
                      عام
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
