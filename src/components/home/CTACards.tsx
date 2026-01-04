import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTACards() {
  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* For Myself Card */}
          <div className="bg-primary rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-primary-foreground mb-4 md:mb-0">
              <p className="text-sm opacity-80 mb-1">Take Your First Steps To Recovery</p>
              <h3 className="text-2xl font-bold">For Myself</h3>
            </div>
            <Button variant="secondary" asChild>
              <Link to="/conditions">View Conditions</Link>
            </Button>
          </div>

          {/* For Loved Ones Card */}
          <div className="bg-muted rounded-xl p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-foreground mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground mb-1">Take Your First Steps To Recovery</p>
              <h3 className="text-2xl font-bold">For Loved Ones</h3>
            </div>
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/california-addiction-rehabs">Find Rehab</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
