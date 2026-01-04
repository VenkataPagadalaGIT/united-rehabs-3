import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const states = [
  "Arizona", "California", "Colorado", "Delaware", "District of Columbia",
  "Florida", "Georgia", "Idaho", "Iowa", "Maryland",
  "Massachusetts", "Minnesota", "Missouri", "Nevada", "New Mexico",
  "New York", "North Carolina", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "South Carolina", "Tennessee", "Texas", "Utah",
  "Virginia", "Washington", "West Virginia", "Wyoming",
];

const stateToSlug = (state: string) => {
  return state.toLowerCase().replace(/\s+/g, '-');
};

export function BrowseBySection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Find More</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Browse By
          </h2>
        </div>

        <Tabs defaultValue="state" className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
            <TabsTrigger
              value="state"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Browse by state
            </TabsTrigger>
            <TabsTrigger
              value="city"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Browse by city
            </TabsTrigger>
            <TabsTrigger
              value="neighborhood"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Browse by neighborhood
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Popular searches
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              New listing
            </TabsTrigger>
            <TabsTrigger
              value="updated"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
            >
              Recently updated listing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="state" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {states.map((state) => (
                <Link
                  key={state}
                  to={`/${stateToSlug(state)}-addiction-rehabs`}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {state}
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="city" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              City listings coming soon...
            </div>
          </TabsContent>

          <TabsContent value="neighborhood" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              Neighborhood listings coming soon...
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              Popular searches coming soon...
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              New listings coming soon...
            </div>
          </TabsContent>

          <TabsContent value="updated" className="mt-0">
            <div className="text-center py-8 text-muted-foreground">
              Recently updated listings coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
