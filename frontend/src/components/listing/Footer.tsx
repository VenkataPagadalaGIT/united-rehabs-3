import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";
import type { FooterLinkGroup } from "@/types";
import { ALL_COUNTRIES, COUNTRIES_BY_REGION } from "@/data/countryConfig";
import { ALL_STATES } from "@/data/allStates";

interface FooterProps {
  linkGroups: FooterLinkGroup[];
}

export function Footer({ linkGroups }: FooterProps) {
  // Get top 10 US states by population for footer
  const topStates = [...ALL_STATES]
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, 10);

  // Get all countries grouped by region
  const europeanCountries = ALL_COUNTRIES.filter(c => c.region === "Europe");
  const americasCountries = ALL_COUNTRIES.filter(c => ["North America", "South America"].includes(c.region));
  const asiaOceaniaCountries = ALL_COUNTRIES.filter(c => ["Asia", "Oceania", "Africa"].includes(c.region));

  return (
    <footer className="bg-sidebar text-sidebar-foreground" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="text-primary font-bold text-lg">united</span>
              <span className="text-sidebar-foreground font-bold text-lg">rehabs</span>
            </div>
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
                  className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar"
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
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-sidebar rounded"
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
            Browse by Country
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Europe */}
            <div>
              <h4 className="font-medium text-sidebar-foreground/80 mb-3 text-sm uppercase tracking-wide">Europe</h4>
              <ul className="space-y-1.5">
                {europeanCountries.map((country) => (
                  <li key={country.code}>
                    <Link
                      to={`/${country.slug}-addiction-rehabs`}
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Americas */}
            <div>
              <h4 className="font-medium text-sidebar-foreground/80 mb-3 text-sm uppercase tracking-wide">Americas</h4>
              <ul className="space-y-1.5">
                {americasCountries.map((country) => (
                  <li key={country.code}>
                    <Link
                      to={`/${country.slug}-addiction-rehabs`}
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Asia Pacific & Africa */}
            <div>
              <h4 className="font-medium text-sidebar-foreground/80 mb-3 text-sm uppercase tracking-wide">Asia Pacific & Africa</h4>
              <ul className="space-y-1.5">
                {asiaOceaniaCountries.map((country) => (
                  <li key={country.code}>
                    <Link
                      to={`/${country.slug}-addiction-rehabs`}
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm flex items-center gap-2"
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Browse By US State Section - SEO Links */}
        <div className="mt-8 pt-8 border-t border-sidebar-border">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Browse by US State
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1.5">
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
              className="text-primary hover:underline text-sm font-medium"
            >
              View All 51 States →
            </Link>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              to="/legal-disclaimer"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Legal Disclaimer
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/terms-of-service"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/privacy-policy"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/accessibility"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Accessibility
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/do-not-sell"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Do Not Sell My Info
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/about"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              About Us
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/contact"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Contact
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/affiliate-disclosure"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Affiliate Disclosure
            </Link>
            <span className="text-sidebar-foreground/30">|</span>
            <Link
              to="/admin"
              className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
            >
              Admin
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 pt-8 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/30 rounded-lg p-4 mb-8">
            <h5 className="text-sm font-semibold text-sidebar-foreground mb-2">Legal Disclaimer & Data Accuracy Notice</h5>
            <div className="text-sidebar-foreground/60 text-xs leading-relaxed space-y-2">
              <p>
                <strong>No Medical Advice:</strong> The information on this website is for general informational and educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making decisions about addiction treatment or recovery.
              </p>
              <p>
                <strong>No Guarantee of Accuracy:</strong> Statistics are compiled from publicly available sources including WHO, UNODC, CDC WONDER, SAMHSA, NIDA, EMCDDA, and national health departments worldwide. While we strive for accuracy, we make NO WARRANTIES regarding completeness, accuracy, reliability, or timeliness of any data. Figures may be provisional, subject to revision, or reflect different collection methodologies. Any reliance on this information is STRICTLY AT YOUR OWN RISK.
              </p>
              <p>
                <strong>International Users:</strong> This website contains data for multiple countries worldwide. Laws, regulations, treatment protocols, and statistical methodologies vary by country. Users should consult local authorities and healthcare systems for region-specific guidance.
              </p>
              <p>
                <strong>Limitation of Liability:</strong> Under no circumstances shall United Rehabs, its operators, affiliates, or data providers be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or reliance upon information on this website. This limitation applies regardless of legal theory and in any jurisdiction worldwide.
              </p>
              <p>
                <strong>No Endorsement:</strong> Listings do not constitute endorsement. We do not guarantee the quality, licensing, or effectiveness of any treatment center. Users must conduct their own due diligence.
              </p>
              <p className="pt-2 border-t border-sidebar-border/30">
                By using this website, you acknowledge reading and agreeing to our full{" "}
                <Link to="/legal-disclaimer" className="text-primary hover:underline">Legal Disclaimer</Link>,{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>, and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-sidebar-border">
          <Button className="bg-primary hover:bg-primary/90 mb-4 md:mb-0">
            Get Help Now
          </Button>
          <p className="text-sidebar-foreground/60 text-sm">
            © 2024 United Rehabs. All rights reserved. Serving {ALL_COUNTRIES.length} countries worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
