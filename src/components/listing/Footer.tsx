import { Button } from "@/components/ui/button";

const footerLinks = {
  Locations: ["Link Six", "Link Seven", "Link Eight", "Link Nine", "Link Ten"],
  Insurance: ["Link Six", "Link Seven", "Link Eight", "Link Nine", "Link Ten"],
  Treatments: ["Link Six", "Link Seven", "Link Eight", "Link Nine", "Link Ten"],
  Conditions: ["Link Six", "Link Seven", "Link Eight", "Link Nine", "Link Ten"],
  More: ["Link Six", "Link Seven", "Link Eight", "Link Nine", "Link Ten"],
};

export function Footer() {
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
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-sidebar-foreground/70 hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-sidebar-border">
          <Button className="bg-primary hover:bg-primary/90 mb-4 md:mb-0">
            Get Help Now
          </Button>
          <p className="text-sidebar-foreground/60 text-sm">
            © 2024. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
