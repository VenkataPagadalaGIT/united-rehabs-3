import { TrustBadges } from "./TrustBadges";
import { InsuranceForm } from "./InsuranceForm";
import { PhoneCTA } from "./PhoneCTA";

export function HeroSection() {
  return (
    <section className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">U</span>
            </div>
            <span className="text-foreground font-bold text-xl">United Rehabs</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Treatment Centers
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </a>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-primary font-semibold text-sm uppercase tracking-wider">
                Confidential Help Available 24/7
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Find the Right{" "}
                <span className="text-primary">Treatment Center</span> for You
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                We connect you with accredited rehab facilities nationwide. 
                Get personalized treatment recommendations and verify your insurance coverage today.
              </p>
            </div>

            <TrustBadges />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <PhoneCTA />
              <span className="text-muted-foreground text-sm">
                Call now for immediate assistance
              </span>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex justify-center lg:justify-end">
            <InsuranceForm />
          </div>
        </div>
      </div>
    </section>
  );
}
