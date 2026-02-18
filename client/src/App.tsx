import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Sun, Moon, ShoppingCart, Calendar, FileText, User, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import NotFound from "@/pages/not-found";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      data-testid="button-theme-toggle"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">Óptica Chile Online</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">Tienda</Link>
            {user && <Link href="/appointments" className="text-sm font-medium hover:text-primary transition-colors">Citas</Link>}
            {user && <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Mi Panel</Link>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm hidden sm:inline-block font-medium">Hola, {user.firstName || user.email}</span>
              <Button variant="ghost" size="icon" onClick={() => logout()} title="Cerrar Sesión">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="default">
              <a href="/api/login">Iniciar Sesión</a>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Acceso denegado",
        description: "Por favor, inicia sesión para continuar.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/dashboard">
            {(params) => <ProtectedRoute component={Dashboard} {...params} />}
          </Route>
          <Route path="/appointments">
            {(params) => <ProtectedRoute component={ProtectedRoute} component={Appointments} {...params} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="border-t py-6 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Óptica Chile Online. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
