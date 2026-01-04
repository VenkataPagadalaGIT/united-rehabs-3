import { ChevronRight, Home } from "lucide-react";

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Rehab Centers", href: "/rehab-centers" },
  { label: "California", href: "/california" },
];

export function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground py-4">
      <Home className="h-4 w-4" />
      {breadcrumbItems.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <a
            href={item.href}
            className={`hover:text-primary transition-colors ${
              index === breadcrumbItems.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {item.label}
          </a>
        </div>
      ))}
    </nav>
  );
}
