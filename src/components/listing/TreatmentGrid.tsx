import { TreatmentCard } from "./TreatmentCard";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const treatments = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop",
    location: "Woodland Hills, California, USA",
    name: "Vanity Wellness Center",
    verified: true,
    rating: 5.0,
    reviews: 97,
    tags: ["Alcohol Addiction", "Drug Addiction", "Depression", "Anxiety", "Eating Disorders"],
    description: "A luxury center treating addiction and co-occurring mental health with evidence-based therapies, a continuum of care in bespoke facilities, and private bedrooms.",
    price: "$$",
    hasInsurance: true,
    phone: "(732) 366-4286",
  },
];

export function TreatmentGrid() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {treatments.map((treatment) => (
          <TreatmentCard key={treatment.id} {...treatment} />
        ))}
      </div>
      
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="gap-2">
          Show More
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
