import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.ts";
import { Toaster } from "@/components/ui/toaster.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { useAuth } from "@/hooks/useAuth.ts";

// صفحات التطبيق
import Landing from "@/pages/landing.tsx";
import Home from "@/pages/home.tsx";
import Editor from "@/pages/editor.tsx";
import Templates from "@/pages/templates.tsx";
import Pricing from "@/pages/pricing.tsx";
import Dashboard from "@/pages/dashboard.tsx";
import NotFound from "@/pages/not-found.tsx";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/editor/:id?" component={Editor} />
          <Route path="/templates" component={Templates} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/dashboard" component={Dashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div dir="rtl" className="min-h-screen bg-background text-foreground">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
