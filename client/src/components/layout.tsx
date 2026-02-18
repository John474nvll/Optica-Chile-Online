import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-roles";
import { 
  Glasses, 
  Calendar, 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROLES } from "@shared/schema";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { data: roleData } = useUserRole(user?.id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isAdminOrStaff = roleData?.role === ROLES.ADMIN || roleData?.role === ROLES.STAFF;

  const navItems = [
    { label: "Home", path: "/", icon: <Glasses className="w-4 h-4" /> },
    { label: "Shop", path: "/shop", icon: <ShoppingBag className="w-4 h-4" /> },
    ...(user ? [
      { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Appointments", path: "/appointments", icon: <Calendar className="w-4 h-4" /> },
    ] : []),
    ...(isAdminOrStaff ? [
      { label: "Admin", path: "/admin", icon: <ShieldCheck className="w-4 h-4" /> },
    ] : []),
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-primary/25 transition-all">
              <Glasses className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl leading-none text-slate-900">VistaChile</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Optical Clinic</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span className={`
                  flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer
                  ${isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                `}>
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">
                  Hi, {user.firstName || user.username}
                </span>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Link href="/api/login">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg z-40 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={`
                flex items-center gap-3 p-3 rounded-lg text-base font-medium
                ${isActive(item.path) ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}
              `}>
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          {user ? (
            <Button variant="destructive" className="w-full justify-start" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          ) : (
            <Link href="/api/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">Sign In</Button>
            </Link>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Glasses className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-xl text-white">VistaChile</span>
            </div>
            <p className="text-sm text-slate-400">
              Premium optical care and eyewear in Chile. Vision for a better life.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Eye Exams</li>
              <li>Contact Lenses</li>
              <li>Frame Repair</li>
              <li>Pediatric Vision</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Av. Providencia 1234, Santiago</li>
              <li>+56 2 2345 6789</li>
              <li>contacto@vistachile.cl</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} VistaChile Óptica. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
