import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  // Don't render on homepage
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground py-4">
      <Link to="/" className="hover:text-primary transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <Link
            to={item.href}
            className={`hover:text-primary transition-colors ${
              index === items.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
