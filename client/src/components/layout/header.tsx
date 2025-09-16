import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code, User, LogOut, Settings, Home } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/80" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer" data-testid="logo">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg ml-3">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground" data-testid="logo-text">ماركود AI</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-reverse space-x-6">
              <Link href="/">
                <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-home">
                  الرئيسية
                </a>
              </Link>
              <Link href="/templates">
                <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-templates">
                  القوالب
                </a>
              </Link>
              <Link href="/dashboard">
                <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-dashboard">
                  لوحة التحكم
                </a>
              </Link>
              <Link href="/pricing">
                <a className="text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-pricing">
                  الأسعار
                </a>
              </Link>
            </div>
          )}
          
          {/* User Menu */}
          <div className="flex items-center space-x-reverse space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="user-menu-trigger">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount data-testid="user-menu">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium" data-testid="user-name">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email || 'مستخدم'}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground" data-testid="user-email">
                        {user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="user-role">
                        الدور: {user?.role || 'trial'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <Home className="ml-2 h-4 w-4" />
                      <span data-testid="menu-home">الرئيسية</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <User className="ml-2 h-4 w-4" />
                      <span data-testid="menu-profile">الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Settings className="ml-2 h-4 w-4" />
                      <span data-testid="menu-settings">الإعدادات</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="menu-logout"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-login"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-signup"
                >
                  ابدأ مجاناً
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
