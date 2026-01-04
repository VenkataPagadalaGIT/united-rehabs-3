import { Header } from "@/components/listing/Header";
import { Breadcrumb } from "@/components/listing/Breadcrumb";
import { PageHero } from "@/components/listing/PageHero";
import { FilterTabs } from "@/components/listing/FilterTabs";
import { ImageGallery } from "@/components/listing/ImageGallery";
import { LocationTags } from "@/components/listing/LocationTags";
import { TreatmentGrid } from "@/components/listing/TreatmentGrid";
import { Sidebar } from "@/components/listing/Sidebar";
import { Categories } from "@/components/listing/Categories";
import { FAQ } from "@/components/listing/FAQ";
import { RelatedRehabs } from "@/components/listing/RelatedRehabs";
import { Footer } from "@/components/listing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4">
        <Breadcrumb />
        <PageHero />
        <FilterTabs />
        <ImageGallery />
        <LocationTags />
        
        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          <div className="lg:col-span-2">
            <TreatmentGrid />
          </div>
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Categories />
      <FAQ />
      <RelatedRehabs />
      <Footer />
    </div>
  );
};

export default Index;
