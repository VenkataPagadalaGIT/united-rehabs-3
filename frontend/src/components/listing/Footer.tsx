import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import type { FooterLinkGroup } from "@/types";
import { ALL_COUNTRIES, COUNTRIES_BY_REGION, getTopCountriesByRegion } from "@/data/countryConfig";
import { ALL_STATES } from "@/data/allStates";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FooterProps {
  linkGroups: FooterLinkGroup[];
}

export function Footer({ linkGroups }: FooterProps) {
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const { t } = useTranslation();

  // Get top US states by population
  const topStates = [...ALL_STATES]
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, 12);

  // Region configuration with display limits
  const regions = [
    { name: "Europe", emoji: "🇪🇺", showTop: 8 },
    { name: "Asia", emoji: "🌏", showTop: 8 },
    { name: "Africa", emoji: "🌍", showTop: 6 },
    { name: "North America", emoji: "🌎", showTop: 6 },
    { name: "South America", emoji: "🌎", showTop: 6 },
    { name: "Oceania", emoji: "🌏", showTop: 4 },
  ];

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  return (
    <footer className="bg-sidebar text-sidebar-foreground" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="text-primary font-bold text-lg">united</span>
              <span className="text-sidebar-foreground font-bold text-lg">rehabs</span>
            </div>
            <p className="text-sidebar-foreground/60 text-sm mb-4">
              Global addiction treatment directory covering {ALL_COUNTRIES.length} countries worldwide.
            </p>
            <div className="flex gap-3" role="list" aria-label="Social media links">
              {[
                { icon: "G", label: "Google" },
                { icon: "f", label: "Facebook" },
                { icon: "in", label: "LinkedIn" },
                { icon: "X", label: "X (Twitter)" }
              ].map((social) => (
                <a
                  key={social.icon}
                  href="#"
                  className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm hover:bg-primary transition-colors"
                  aria-label={`Follow us on ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h4 className="font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Browse By Country Section - SEO Links */}
        <div className="mt-12 pt-8 border-t border-sidebar-border">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Browse by Country ({ALL_COUNTRIES.length} Countries)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map(({ name, emoji, showTop }) => {
              const regionCountries = COUNTRIES_BY_REGION[name] || [];
              const topCountries = getTopCountriesByRegion(name, showTop);
              const isExpanded = expandedRegions.includes(name);
              const hasMore = regionCountries.length > showTop;
              
              return (
                <div key={name} className="bg-sidebar-accent/20 rounded-lg p-4">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleRegion(name)}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
                      <h4 className="font-medium text-sidebar-foreground flex items-center gap-2">
                        <span>{emoji}</span>
                        <span>{name}</span>
                        <span className="text-xs text-sidebar-foreground/50">({regionCountries.length})</span>
                      </h4>
                      {hasMore && (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    
                    {/* Always visible top countries */}
                    <ul className="space-y-1">
                      {topCountries.map((country) => (
                        <li key={country.code}>
                          <Link
                            to={`/${country.slug}-addiction-rehabs`}
                            className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm flex items-center gap-1.5"
                          >
                            <span className="text-xs">{country.flag}</span>
                            <span>{country.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Expandable remaining countries */}
                    {hasMore && (
                      <CollapsibleContent>
                        <ul className="space-y-1 mt-1 pt-1 border-t border-sidebar-border/30">
                          {regionCountries
                            .filter(c => !topCountries.find(tc => tc.code === c.code))
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((country) => (
                              <li key={country.code}>
                                <Link
                                  to={`/${country.slug}-addiction-rehabs`}
                                  className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm flex items-center gap-1.5"
                                >
                                  <span className="text-xs">{country.flag}</span>
                                  <span>{country.name}</span>
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </CollapsibleContent>
                    )}
                    
                    {hasMore && !isExpanded && (
                      <p className="text-xs text-primary mt-2 cursor-pointer hover:underline" onClick={() => toggleRegion(name)}>
                        +{regionCountries.length - showTop} more countries...
                      </p>
                    )}
                  </Collapsible>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browse By US State Section */}
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Browse by US State
          </h3>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-1.5">
            {topStates.map((state) => (
              <Link
                key={state.id}
                to={`/${state.slug}-addiction-rehabs`}
                className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
              >
                {state.name}
              </Link>
            ))}
            <Link
              to="/"
              className="text-primary hover:underline text-sm font-medium col-span-2"
            >
              View All 51 States →
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Link to="/rehab-centers" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Treatment Centers
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/about" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              About Us
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/contact" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Contact
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/privacy-policy" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Privacy Policy
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/terms-of-service" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Terms of Service
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/legal-disclaimer" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Legal Disclaimer
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/accessibility" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Accessibility
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/affiliate-disclosure" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Affiliate Disclosure
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link to="/admin" className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm">
              Admin
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/30 rounded-lg p-4 mb-8">
            <h5 className="text-sm font-semibold text-sidebar-foreground mb-2">Data Sources & Disclaimer</h5>
            <div className="text-sidebar-foreground/60 text-xs leading-relaxed space-y-2">
              <p>
                <strong>Data Sources:</strong> Statistics are compiled from WHO Global Health Observatory, UNODC World Drug Report, EMCDDA European Drug Report, SAMHSA (US), and national health ministries. Data marked as "estimated" is derived from regional averages when country-specific data is unavailable.
              </p>
              <p>
                <strong>Medical Disclaimer:</strong> This website provides general information only and is NOT a substitute for professional medical advice. Always consult qualified healthcare providers for treatment decisions.
              </p>
              <p>
                <strong>No Endorsement:</strong> Facility listings do not constitute endorsement. Users must verify credentials and suitability independently.
              </p>
              <p className="pt-2 border-t border-sidebar-border/30">
                <Link to="/legal-disclaimer" className="text-primary hover:underline">Full Legal Disclaimer</Link> |{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms</Link> |{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-sidebar-border">
          <Button className="bg-primary hover:bg-primary/90 mb-4 md:mb-0" data-testid="footer-get-help-btn">
            {t('common.getHelpNow')}
          </Button>
          <p className="text-sidebar-foreground/60 text-sm text-center md:text-right">
            © 2024 United Rehabs. {t('footer.allRightsReserved')}<br/>
            <span className="text-xs">{t('footer.serving')} {ALL_COUNTRIES.length} {t('footer.countriesWorldwide')} • 51 US {t('common.states')} • {t('footer.globalCoverage')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
