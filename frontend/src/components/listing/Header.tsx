import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/types";
import { LocationsMegaMenu } from "./LocationsMegaMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  navItems: NavItem[];
}

export function Header({ navItems }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationsMenuOpen, setLocationsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleNavItemHover = (item: NavItem) => {
    if (item.label.toLowerCase() === "locations") {
      setLocationsMenuOpen(true);
    }
  };

  const handleNavItemLeave = (item: NavItem) => {
    // Menu will close via its own onMouseLeave
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
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
            <div className="flex flex-col leading-none">
              <span className="text-primary font-bold text-lg tracking-[-0.02em]">United</span>
              <span className="text-foreground font-bold text-lg tracking-[-0.02em]">Rehabs</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => handleNavItemHover(item)}
                onMouseLeave={() => handleNavItemLeave(item)}
              >
                {item.href && !item.hasDropdown ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg px-3 py-2 hover:bg-muted"
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={`flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg px-3 py-2 hover:bg-muted ${
                      item.label.toLowerCase() === "locations" && locationsMenuOpen ? "text-foreground bg-muted" : ""
                    }`}
                    aria-expanded={item.hasDropdown ? (item.label.toLowerCase() === "locations" ? locationsMenuOpen : false) : undefined}
                    aria-haspopup={item.hasDropdown ? "true" : undefined}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-dropdown`}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className={`h-4 w-4 transition-transform ${
                      item.label.toLowerCase() === "locations" && locationsMenuOpen ? "rotate-180" : ""
                    }`} aria-hidden="true" />}
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Language & CTA */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" 
              data-testid="get-help-now-btn"
              onClick={() => window.location.href = 'tel:988'}
            >
              {t('common.getHelpNow')}
            </Button>
            <button
              className="lg:hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav 
            id="mobile-menu" 
            className="lg:hidden border-t border-border"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <div key={item.id}>
                {item.label.toLowerCase() === "locations" ? (
                  <>
                    <button
                      onClick={() => setLocationsMenuOpen(!locationsMenuOpen)}
                      className="flex items-center justify-between w-full py-3 text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-4"
                      data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${locationsMenuOpen ? "rotate-180" : ""}`} 
                        aria-hidden="true" 
                      />
                    </button>
                    <LocationsMegaMenu 
                      isOpen={locationsMenuOpen} 
                      onClose={() => setLocationsMenuOpen(false)}
                      isMobile={true}
                    />
                  </>
                ) : item.href && !item.hasDropdown ? (
                  <Link
                    to={item.href}
                    className="flex items-center justify-between w-full py-3 text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-4"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className="flex items-center justify-between w-full py-3 text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-4"
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}-dropdown`}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                  </button>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* Locations Mega Menu */}
      <LocationsMegaMenu 
        isOpen={locationsMenuOpen} 
        onClose={() => setLocationsMenuOpen(false)} 
      />
    </header>
  );
}
