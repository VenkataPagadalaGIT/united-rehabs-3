import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { NavItem } from "@/types";

interface HeaderProps {
  navItems: NavItem[];
}

export function Header({ navItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
      >
        Skip to main content
      </a>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded" aria-label="United Rehabs Home">
            <div className="flex flex-col">
              <span className="text-primary font-bold text-lg leading-tight">united</span>
              <span className="text-foreground font-bold text-lg leading-tight">rehabs</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
                aria-expanded={item.hasDropdown ? "false" : undefined}
                aria-haspopup={item.hasDropdown ? "true" : undefined}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              Get Help Now
            </Button>
            <button
              className="lg:hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav 
            id="mobile-menu" 
            className="lg:hidden py-4 border-t border-border"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                className="flex items-center justify-between w-full py-3 text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
