import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, LogIn, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type View = "landing" | "apply" | "status" | "admin";

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === UserRole.admin) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-accent-foreground tracking-wide uppercase">
        <Shield className="w-2.5 h-2.5" />
        Admin
      </span>
    );
  }
  if (role === UserRole.user) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground tracking-wide uppercase">
        User
      </span>
    );
  }
  return null;
}

export function Header({ currentView, onNavigate, userRole }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { identity, login, clear, loginStatus, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const navLinks: { label: string; view: View; loginRequired?: boolean }[] = [
    { label: "Home", view: "landing" },
    { label: "Apply", view: "apply" },
    { label: "Check Status", view: "status" },
    // Admin link always visible to logged-in users so they can claim admin or view dashboard
    { label: "Admin", view: "admin", loginRequired: true },
  ];

  const visibleLinks = navLinks.filter((l) => !l.loginRequired || isLoggedIn);

  return (
    <header className="nav-glass sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-glow transition-all group-hover:scale-105">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Passport<span className="text-primary opacity-70">Verify</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <button
                type="button"
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`
                  relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
                  ${
                    currentView === link.view
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }
                `}
              >
                {link.label}
                {link.view === "admin" && userRole === UserRole.admin && (
                  <Badge className="ml-1.5 text-[10px] px-1 py-0 bg-accent text-accent-foreground">
                    Admin
                  </Badge>
                )}
              </button>
            ))}
          </nav>

          {/* Auth + Role + Mobile */}
          <div className="flex items-center gap-3">
            {isInitializing ? (
              <div className="w-24 h-9 rounded-md bg-muted animate-pulse" />
            ) : isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <RoleBadge role={userRole} />
                <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                  {identity?.getPrincipal().toString().slice(0, 10)}…
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clear()}
                  className="gap-1.5 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => login()}
                disabled={isLoggingIn}
                className="hidden md:flex gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoggingIn ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                Login
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 animate-fade-in">
            {visibleLinks.map((link) => (
              <button
                type="button"
                key={link.view}
                onClick={() => {
                  onNavigate(link.view);
                  setMenuOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${
                    currentView === link.view
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {link.label}
                  {link.view === "admin" && userRole === UserRole.admin && (
                    <Badge className="text-[10px] px-1 py-0 bg-accent text-accent-foreground">
                      Admin
                    </Badge>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            ))}
            <div className="px-4 pt-2 pb-1">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={userRole} />
                    <p className="text-xs text-muted-foreground font-mono">
                      {identity?.getPrincipal().toString().slice(0, 20)}…
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clear();
                      setMenuOpen(false);
                    }}
                    className="w-full gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    login();
                    setMenuOpen(false);
                  }}
                  disabled={isLoggingIn}
                  className="w-full gap-1.5 bg-primary text-primary-foreground"
                >
                  {isLoggingIn ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                  ) : (
                    <LogIn className="w-3.5 h-3.5" />
                  )}
                  Login with Internet Identity
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
