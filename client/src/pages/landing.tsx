import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Code, Users, Bolt, Brain, Palette, Shield } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "إنشاء بالذكاء الاصطناعي",
      description: "اكتب وصف مشروعك بالعربية أو الإنجليزية، واحصل على كود جاهز للتشغيل مع أفضل الممارسات البرمجية."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "تعاون مباشر",
      description: "عدّل وشارك الكود مع فريقك لحظة بلحظة مثل Google Docs، مع تتبع كامل للتغييرات."
    },
    {
      icon: <Bolt className="w-6 h-6" />,
      title: "تشغيل فوري",
      description: "اختبر مشروعك مباشرة من المتصفح بدون إعدادات معقدة، مع نشر فوري على الإنترنت."
    }
  ];

  const roles = [
    {
      title: "مدير عام",
      icon: <Shield className="w-8 h-8" />,
      description: "صلاحيات كاملة على جميع المشاريع والإعدادات",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "مطور",
      icon: <Code className="w-8 h-8" />,
      description: "كتابة وتطوير الكود والميزات الجديدة",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "مصمم",
      icon: <Palette className="w-8 h-8" />,
      description: "تصميم الواجهات والتجربة البصرية",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Bolt className="w-4 h-4 ml-2" />
                ثورة في بناء المواقع والتطبيقات
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight" data-testid="hero-title">
              منصة <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ماركود AI</span>
              <br />
              لبناء المواقع والتطبيقات
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
              بيئة متكاملة ذكية تجمع بين قوة محرر الأكواد المتطور والذكاء الاصطناعي المتقدم. 
              اكتب فكرتك فقط، ودع المنصة تولّد لك الكود الجاهز بأفضل الممارسات.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-start-building"
              >
                <Bolt className="w-5 h-5 ml-2" />
                ابدأ البناء الآن
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold"
                data-testid="button-watch-demo"
              >
                <Code className="w-5 h-5 ml-2" />
                شاهد العرض التوضيحي
              </Button>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white/25 backdrop-blur-md border border-white/20 hover:scale-105 transition-transform" data-testid={`feature-card-${index}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xl mb-4 mx-auto">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2" data-testid={`feature-title-${index}`}>{feature.title}</h3>
                    <p className="text-muted-foreground text-sm" data-testid={`feature-description-${index}`}>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="features-title">ميزات المنصة المتطورة</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="features-description">
              كل ما تحتاجه لبناء مواقع وتطبيقات احترافية بأسرع وقت وأقل جهد
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:scale-105 transition-transform" data-testid="card-ai-generation">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl mb-6">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" data-testid="text-ai-generation-title">إنشاء بالذكاء الاصطناعي</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed" data-testid="text-ai-generation-description">
                  اكتب وصف مشروعك بالعربية أو الإنجليزية، واحصل على كود جاهز للتشغيل مع أفضل الممارسات البرمجية.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:scale-105 transition-transform" data-testid="card-collaboration">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent text-2xl mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" data-testid="text-collaboration-title">تعاون مباشر</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed" data-testid="text-collaboration-description">
                  عدّل وشارك الكود مع فريقك لحظة بلحظة مثل Google Docs، مع تتبع كامل للتغييرات.
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 hover:scale-105 transition-transform" data-testid="card-instant-hosting">
              <CardContent className="p-0">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl mb-6">
                  <Bolt className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4" data-testid="text-hosting-title">تشغيل مباشر</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed" data-testid="text-hosting-description">
                  شغّل مشروعك أونلاين من المتصفح بدون إعدادات معقدة، مع نشر فوري على الإنترنت.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Management */}
      <section className="py-20 bg-muted/30" data-testid="roles-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="roles-title">إدارة أدوار وصلاحيات متقدمة</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="roles-description">
              نظام شامل لإدارة الفرق والمشاريع بصلاحيات مخصصة لكل دور
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div key={index} className={`bg-gradient-to-br ${role.gradient} p-6 rounded-2xl text-white text-center hover:scale-105 transition-transform`} data-testid={`role-card-${index}`}>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" data-testid={`role-title-${index}`}>{role.title}</h3>
                <p className="text-white/90 text-sm" data-testid={`role-description-${index}`}>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="cta-title">
            ابدأ رحلتك في عالم البرمجة الذكية
          </h2>
          <p className="text-xl text-muted-foreground mb-8" data-testid="cta-description">
            انضم إلى آلاف المطورين الذين يستخدمون ماركود AI لبناء مشاريعهم
          </p>
          <Button 
            size="lg" 
            className="px-12 py-4 text-lg font-semibold hover:scale-105 transition-transform"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            ابدأ مجاناً الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
