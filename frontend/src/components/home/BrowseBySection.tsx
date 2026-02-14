import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const usStates = [
  "Arizona", "California", "Colorado", "Delaware", "District of Columbia",
  "Florida", "Georgia", "Idaho", "Iowa", "Maryland",
  "Massachusetts", "Minnesota", "Missouri", "Nevada", "New Mexico",
  "New York", "North Carolina", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "South Carolina", "Tennessee", "Texas", "Utah",
  "Virginia", "Washington", "West Virginia", "Wyoming",
];

const popularCountries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Brazil", "Mexico", "India", "China",
  "Japan", "South Korea", "Russia", "Italy", "Spain",
  "Netherlands", "Sweden", "Switzerland", "Thailand", "South Africa",
];

const stateToSlug = (state: string) => {
  return state.toLowerCase().replace(/\s+/g, '-');
};

const countryToSlug = (country: string) => {
  return country.toLowerCase().replace(/\s+/g, '-');
};

export function BrowseBySection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm tracking-[0.1em] uppercase mb-3">Explore Data</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-[-0.02em]">
            Browse Statistics By Region
          </h2>
        </div>

        <Tabs defaultValue="us-states" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-10">
            <TabsTrigger
              value="us-states"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-5 py-2.5 text-sm font-medium"
            >
              US States
            </TabsTrigger>
            <TabsTrigger
              value="countries"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-5 py-2.5 text-sm font-medium"
            >
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="us-states" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-3">
              {usStates.map((state) => (
                <Link
                  key={state}
                  to={`/${stateToSlug(state)}-addiction-stats`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  {state}
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="countries" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-3">
              {popularCountries.map((country) => (
                <Link
                  key={country}
                  to={`/${countryToSlug(country)}-addiction-stats`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  {country}
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link 
                to="/compare" 
                className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
              >
                View all 195 countries →
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
