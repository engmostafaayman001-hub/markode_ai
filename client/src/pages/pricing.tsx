import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Check, Crown, Code, Palette, User, CreditCard } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    id: "free",
    name: "خطة مجانية",
    price: "0 جنيه",
    period: "مجاناً للأبد",
    features: [
      "مشروع واحد",
      "قوالب أساسية (5 قوالب)",
      "مساعد AI محدود",
      "استضافة أساسية"
    ],
    buttonText: "البدء مجاناً",
    popular: false
  },
  {
    id: "starter",
    name: "المبتدئ",
    price: "99 جنيه",
    period: "شهرياً",
    features: [
      "5 مشاريع",
      "جميع القوالب (50+ قالب)",
      "مساعد AI متقدم",
      "استضافة سريعة",
      "دعم فني أساسي"
    ],
    buttonText: "اختر هذه الخطة",
    popular: false
  },
  {
    id: "professional",
    name: "المحترف",
    price: "299 جنيه",
    period: "شهرياً",
    features: [
      "مشاريع لا محدودة",
      "جميع القوالب + قوالب مميزة",
      "مساعد AI بلا حدود",
      "تعاون مع الفريق (10 أعضاء)",
      "تحليلات متقدمة",
      "دعم فني أولوي"
    ],
    buttonText: "اختر هذه الخطة",
    popular: true
  },
  {
    id: "enterprise",
    name: "المؤسسات",
    price: "تواصل معنا",
    period: "حلول مخصصة",
    features: [
      "كل ميزات المحترف",
      "فرق لا محدودة",
      "حلول مخصصة",
      "دعم فني مخصص 24/7",
      "تدريب وإعداد"
    ],
    buttonText: "تواصل معنا",
    popular: false
  }
];

const SubscribeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "فشل في الدفع",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الدفع بنجاح",
        description: "تم تفعيل اشتراكك!",
      });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="payment-form">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full" data-testid="button-confirm-payment">
        تأكيد الاشتراك
      </Button>
    </form>
  );
};

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يرجى تسجيل الدخول أولاً لاختيار خطة",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }

    if (planId === "free") {
      toast({
        title: "الخطة المجانية",
        description: "أنت تستخدم الخطة المجانية بالفعل",
      });
      return;
    }

    if (planId === "enterprise") {
      toast({
        title: "تواصل معنا",
        description: "سيتم التواصل معك قريباً",
      });
      return;
    }

    try {
      setSelectedPlan(planId);
      const response = await apiRequest("POST", "/api/get-or-create-subscription");
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في بدء عملية الاشتراك",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedPlan(null);
    toast({
      title: "مرحباً في ماركود AI!",
      description: "تم تفعيل اشتراكك بنجاح",
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="pricing-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="pricing-title">
            خطط أسعار مرنة
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="pricing-subtitle">
            اختر الخطة المناسبة لك ولفريقك، مع إمكانية الترقية في أي وقت
          </p>
        </div>

        {/* Payment Methods */}
        <div className="flex justify-center items-center gap-6 mb-12">
          <span className="text-muted-foreground" data-testid="text-payment-methods">طرق الدفع المتاحة:</span>
          <div className="flex items-center gap-4">
            <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
            <div className="w-10 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
            <div className="w-12 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">VF</div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative hover:scale-105 transition-transform ${
                plan.popular ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              data-testid={`plan-card-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                  الأكثر شعبية
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold mb-2" data-testid={`plan-name-${plan.id}`}>
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-bold mb-2" data-testid={`plan-price-${plan.id}`}>
                  {plan.price}
                </div>
                <p className="text-muted-foreground" data-testid={`plan-period-${plan.id}`}>
                  {plan.period}
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm" data-testid={`plan-feature-${plan.id}-${index}`}>
                      <Check className="w-4 h-4 text-accent ml-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? "default" : "outline"}
                  data-testid={`button-select-plan-${plan.id}`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role Comparison */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" data-testid="roles-comparison-title">
            مقارنة الأدوار والصلاحيات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center" data-testid="role-admin">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2" data-testid="role-admin-title">مدير عام</h3>
              <p className="text-sm text-muted-foreground" data-testid="role-admin-description">
                صلاحيات كاملة على جميع المشاريع والإعدادات
              </p>
            </div>

            <div className="text-center" data-testid="role-developer">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2" data-testid="role-developer-title">مطور</h3>
              <p className="text-sm text-muted-foreground" data-testid="role-developer-description">
                كتابة وتطوير الكود والميزات الجديدة
              </p>
            </div>

            <div className="text-center" data-testid="role-designer">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2" data-testid="role-designer-title">مصمم</h3>
              <p className="text-sm text-muted-foreground" data-testid="role-designer-description">
                تصميم الواجهات والتجربة البصرية
              </p>
            </div>

            <div className="text-center" data-testid="role-trial">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center text-white mb-4 mx-auto">
                <User className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-2" data-testid="role-trial-title">مستخدم تجريبي</h3>
              <p className="text-sm text-muted-foreground" data-testid="role-trial-description">
                تجربة محدودة لاستكشاف المنصة
              </p>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && clientSecret && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="payment-modal">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="payment-modal-title">
                  <CreditCard className="w-5 h-5 ml-2" />
                  إتمام الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm onSuccess={handlePaymentSuccess} />
                </Elements>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                  className="w-full mt-4"
                  data-testid="button-cancel-payment"
                >
                  إلغاء
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
