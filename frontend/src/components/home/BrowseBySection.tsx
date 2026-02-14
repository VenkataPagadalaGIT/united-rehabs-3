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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Explore Data</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Browse Statistics By Region
          </h2>
        </div>

        <Tabs defaultValue="us-states" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
            <TabsTrigger
              value="us-states"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              US States
            </TabsTrigger>
            <TabsTrigger
              value="countries"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="us-states" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {usStates.map((state) => (
                <Link
                  key={state}
                  to={`/${stateToSlug(state)}-addiction-stats`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {state}
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="countries" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularCountries.map((country) => (
                <Link
                  key={country}
                  to={`/${countryToSlug(country)}-addiction-stats`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {country}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link 
                to="/compare" 
                className="text-primary hover:underline font-medium"
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
