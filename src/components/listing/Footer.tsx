import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { FooterLinkGroup } from "@/types";

interface FooterProps {
  linkGroups: FooterLinkGroup[];
}

export function Footer({ linkGroups }: FooterProps) {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col mb-4">
              <span className="text-primary font-bold text-lg">united</span>
              <span className="text-sidebar-foreground font-bold text-lg">rehabs</span>
            </div>
            <div className="flex gap-3">
              {["G", "f", "in", "X"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sm hover:bg-primary transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
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
            </div>
          ))}
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-sidebar-border">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
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
            <h5 className="text-sm font-semibold text-sidebar-foreground mb-2">Legal Disclaimer</h5>
            <p className="text-sidebar-foreground/60 text-xs leading-relaxed">
              The information provided on this website is for general informational and educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition or treatment options. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information contained herein. Any reliance you place on such information is strictly at your own risk. We are not responsible for any errors or omissions, or for any actions taken based on the information provided. Statistics and data are sourced from publicly available government databases and may be subject to reporting delays or revisions. This website does not endorse any specific treatment center, program, or service.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-sidebar-border">
          <Button className="bg-primary hover:bg-primary/90 mb-4 md:mb-0">
            Get Help Now
          </Button>
          <p className="text-sidebar-foreground/60 text-sm">
            © 2024 United Rehabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
