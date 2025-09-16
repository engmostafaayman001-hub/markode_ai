import { Link } from "wouter";
import { Code, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg ml-3">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold" data-testid="footer-logo">ماركود AI</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6" data-testid="footer-description">
              منصة متكاملة لبناء المواقع والتطبيقات بالذكاء الاصطناعي. 
              ابدأ مشروعك القادم بأسرع وأذكى الطرق.
            </p>
            <div className="flex space-x-reverse space-x-4">
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center transition-colors" data-testid="social-github">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Product Links */}
          <div data-testid="footer-product-links">
            <h4 className="text-lg font-semibold mb-6" data-testid="footer-product-title">المنتج</h4>
            <ul className="space-y-4">
              <li><Link href="#"><a className="text-slate-300 hover:text-white transition-colors" data-testid="footer-features">الميزات</a></Link></li>
              <li><Link href="/templates"><a className="text-slate-300 hover:text-white transition-colors" data-testid="footer-templates">القوالب</a></Link></li>
              <li><Link href="#"><a className="text-slate-300 hover:text-white transition-colors" data-testid="footer-ai-assistant">مساعد AI</a></Link></li>
              <li><Link href="#"><a className="text-slate-300 hover:text-white transition-colors" data-testid="footer-updates">التحديثات</a></Link></li>
              <li><Link href="/pricing"><a className="text-slate-300 hover:text-white transition-colors" data-testid="footer-pricing">الأسعار</a></Link></li>
            </ul>
          </div>
          
          {/* Resources Links */}
          <div data-testid="footer-resources-links">
            <h4 className="text-lg font-semibold mb-6" data-testid="footer-resources-title">الموارد</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-docs">التوثيق</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-tutorials">دروس تعليمية</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-community">مجتمع المطورين</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-blog">المدونة</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-support">الدعم الفني</a></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div data-testid="footer-company-links">
            <h4 className="text-lg font-semibold mb-6" data-testid="footer-company-title">الشركة</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-about">من نحن</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-careers">الوظائف</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-contact">اتصل بنا</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-privacy">سياسة الخصوصية</a></li>
              <li><a href="#" className="text-slate-300 hover:text-white transition-colors" data-testid="footer-terms">شروط الاستخدام</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-300 text-sm" data-testid="footer-copyright">
            © 2024 ماركود AI. جميع الحقوق محفوظة.
          </p>
          <p className="text-slate-300 text-sm mt-4 md:mt-0" data-testid="footer-made-with-love">
            صُنع بـ <span className="text-red-500">❤️</span> للمطورين العرب
          </p>
        </div>
      </div>
    </footer>
  );
}
