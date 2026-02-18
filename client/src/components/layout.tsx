import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Glasses, User, Calendar, ShoppingBag, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ href, children, icon: Icon }: any) => {
    const isActive = location === href;
    return (
      <Link href={href} className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
        ${isActive 
          ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}>
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
            <Glasses className="w-8 h-8" />
            <span>Optica Chile</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink href="/" icon={Glasses}>Home</NavLink>
            <NavLink href="/shop" icon={ShoppingBag}>Shop</NavLink>
            {user ? (
              <>
                <NavLink href="/appointments" icon={Calendar}>Citas</NavLink>
                <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 ml-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">{user.firstName || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild className="ml-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <a href="/api/login">Log In</a>
              </Button>
            )}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <div onClick={() => setIsOpen(false)}>
                    <NavLink href="/" icon={Glasses}>Home</NavLink>
                  </div>
                  <div onClick={() => setIsOpen(false)}>
                    <NavLink href="/shop" icon={ShoppingBag}>Shop</NavLink>
                  </div>
                  {user ? (
                    <>
                      <div onClick={() => setIsOpen(false)}>
                        <NavLink href="/appointments" icon={Calendar}>Citas</NavLink>
                      </div>
                      <div onClick={() => setIsOpen(false)}>
                        <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                      </div>
                      <Button variant="destructive" className="mt-4 w-full" onClick={() => logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="mt-4 w-full bg-primary" onClick={() => setIsOpen(false)}>
                      <a href="/api/login">Log In</a>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Optica Chile Online. Visión de calidad.</p>
        </div>
      </footer>
    </div>
  );
}
