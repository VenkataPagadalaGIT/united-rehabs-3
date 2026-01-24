import { Button } from "@/components/ui/button";

export function SupportCTA() {
  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-accent rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-accent-foreground/80 text-sm mb-1">Still Have Questions?</p>
            <h3 className="text-2xl font-bold text-accent-foreground mb-2">
              Your Recovery Advocate Is Here To Help
            </h3>
            <p className="text-accent-foreground/80 text-sm">
              Connect directly with our Head of Support for personalized guidance—your path to answers starts here.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-background overflow-hidden mx-auto mb-2">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face" 
                  alt="Support Representative"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-accent-foreground font-medium text-sm">Magdalena</p>
              <p className="text-accent-foreground/60 text-xs">Head of Support</p>
            </div>
            <Button variant="secondary">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
