import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, Building2, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tabsData = {
  conditions: {
    title: "Browse by Condition",
    description: "Learn about different substance use disorders and mental health conditions we help treat.",
    items: [
      { name: "Alcohol Addiction", count: 2847, description: "Comprehensive treatment for alcohol use disorder including detox and long-term recovery programs.", educational: true },
      { name: "Opioid Addiction", count: 2156, description: "Specialized care for heroin, fentanyl, and prescription painkiller dependencies.", educational: true },
      { name: "Cocaine Addiction", count: 1834, description: "Evidence-based treatment approaches for cocaine and crack cocaine dependency.", educational: true },
      { name: "Methamphetamine", count: 1623, description: "Targeted programs addressing the unique challenges of meth addiction recovery.", educational: true },
      { name: "Prescription Drugs", count: 1945, description: "Treatment for benzodiazepine, stimulant, and other prescription drug dependencies.", educational: true },
      { name: "Dual Diagnosis", count: 1567, description: "Integrated treatment for co-occurring mental health and substance use disorders.", educational: true },
      { name: "Depression", count: 2341, description: "Therapeutic approaches combining medication management and counseling.", educational: true },
      { name: "Anxiety Disorders", count: 2189, description: "Evidence-based treatments including CBT, exposure therapy, and holistic approaches.", educational: true },
    ],
  },
  specialty: {
    title: "Specialty Programs",
    description: "Find treatment programs designed for specific populations and needs.",
    items: [
      { name: "Veterans Programs", count: 456, description: "Trauma-informed care designed specifically for military veterans and their families.", educational: true },
      { name: "LGBTQ+ Affirming", count: 312, description: "Inclusive treatment environments with culturally competent staff and programming.", educational: true },
      { name: "Women Only", count: 623, description: "Gender-specific programs addressing unique challenges women face in recovery.", educational: true },
      { name: "Men Only", count: 589, description: "Programs focused on masculine identity and male-specific recovery challenges.", educational: true },
      { name: "Young Adults (18-25)", count: 445, description: "Age-appropriate treatment addressing developmental needs of emerging adults.", educational: true },
      { name: "Executives & Professionals", count: 178, description: "Discrete, high-end treatment maintaining professional responsibilities.", educational: false },
      { name: "First Responders", count: 234, description: "Specialized trauma care for police, firefighters, EMTs, and healthcare workers.", educational: true },
      { name: "Faith-Based", count: 567, description: "Spiritually integrated recovery programs rooted in religious principles.", educational: true },
    ],
  },
  insurance: {
    title: "Insurance & Payment",
    description: "Find facilities that accept your insurance or offer flexible payment options.",
    items: [
      { name: "Medicaid Accepted", count: 1234, description: "State-funded coverage for qualifying individuals based on income and residency.", educational: true },
      { name: "Medicare Accepted", count: 987, description: "Federal coverage for seniors 65+ and those with qualifying disabilities.", educational: true },
      { name: "Blue Cross Blue Shield", count: 2156, description: "Wide network of providers accepting BCBS plans nationwide.", educational: false },
      { name: "Aetna", count: 1892, description: "In-network and out-of-network options for Aetna members.", educational: false },
      { name: "Cigna", count: 1745, description: "Behavioral health coverage through Cigna and affiliated plans.", educational: false },
      { name: "United Healthcare", count: 2034, description: "Comprehensive coverage options through UHC and Optum.", educational: false },
      { name: "Sliding Scale Fees", count: 678, description: "Income-based pricing making treatment accessible regardless of financial situation.", educational: true },
      { name: "Free Treatment Options", count: 445, description: "State-funded, non-profit, and grant-supported treatment at no cost.", educational: true },
    ],
  },
  therapies: {
    title: "Evidence-Based Therapies",
    description: "Explore proven therapeutic approaches used in addiction and mental health treatment.",
    items: [
      { name: "Cognitive Behavioral Therapy", count: 2567, description: "Identifies and changes negative thought patterns driving addictive behaviors.", educational: true },
      { name: "Dialectical Behavior Therapy", count: 1834, description: "Skills-based approach for emotional regulation and distress tolerance.", educational: true },
      { name: "EMDR Therapy", count: 1245, description: "Trauma-processing technique using eye movements to reduce emotional distress.", educational: true },
      { name: "Motivational Interviewing", count: 2123, description: "Client-centered approach enhancing motivation for positive change.", educational: true },
      { name: "Family Therapy", count: 1678, description: "Addresses family dynamics and builds support systems for recovery.", educational: true },
      { name: "Group Therapy", count: 2890, description: "Peer support and shared experiences in a therapeutic group setting.", educational: true },
      { name: "Medication-Assisted Treatment", count: 1567, description: "FDA-approved medications combined with counseling for opioid and alcohol addiction.", educational: true },
      { name: "Trauma-Informed Care", count: 1923, description: "Approaches recognizing the widespread impact of trauma on addiction.", educational: true },
    ],
  },
  care: {
    title: "Levels of Care",
    description: "Understand different treatment intensities to find the right fit for your needs.",
    items: [
      { name: "Medical Detox", count: 1456, description: "24/7 supervised withdrawal management with medical support and comfort medications.", educational: true },
      { name: "Inpatient Residential", count: 1834, description: "Immersive 24-hour care in a structured therapeutic environment.", educational: true },
      { name: "Partial Hospitalization (PHP)", count: 923, description: "Full-day treatment (5-7 days/week) while living at home or sober living.", educational: true },
      { name: "Intensive Outpatient (IOP)", count: 1567, description: "9-20 hours/week of treatment allowing work and family obligations.", educational: true },
      { name: "Standard Outpatient", count: 2345, description: "1-2 sessions weekly for ongoing support and maintenance.", educational: true },
      { name: "Sober Living Homes", count: 789, description: "Structured drug-free housing with peer support during early recovery.", educational: true },
      { name: "Aftercare & Alumni", count: 1234, description: "Ongoing support programs maintaining recovery after primary treatment.", educational: true },
      { name: "Telehealth Options", count: 1678, description: "Virtual therapy and support accessible from anywhere.", educational: true },
    ],
  },
  approaches: {
    title: "Treatment Approaches",
    description: "Learn about different philosophies and methodologies in addiction treatment.",
    items: [
      { name: "12-Step Based", count: 2345, description: "Programs incorporating Alcoholics Anonymous and similar fellowship principles.", educational: true },
      { name: "Non-12-Step", count: 1234, description: "Alternative approaches like SMART Recovery, LifeRing, and secular programs.", educational: true },
      { name: "Holistic Treatment", count: 1567, description: "Whole-person healing integrating mind, body, and spirit.", educational: true },
      { name: "Dual Diagnosis", count: 1890, description: "Integrated treatment for co-occurring mental health and substance use.", educational: true },
      { name: "Harm Reduction", count: 456, description: "Pragmatic strategies to reduce negative consequences of substance use.", educational: true },
      { name: "Abstinence-Based", count: 2123, description: "Traditional approach focused on complete cessation of substance use.", educational: true },
      { name: "Trauma-Focused", count: 1456, description: "Addresses underlying trauma as a root cause of addiction.", educational: true },
      { name: "Mindfulness-Based", count: 987, description: "Incorporating meditation, yoga, and present-moment awareness.", educational: true },
    ],
  },
  amenities: {
    title: "Amenities & Features",
    description: "Find treatment centers with the comfort features and programs that matter to you.",
    items: [
      { name: "Private Rooms", count: 1234, description: "Single-occupancy accommodations for privacy and personal space.", educational: false },
      { name: "Pool & Spa", count: 567, description: "Resort-style amenities supporting relaxation and wellness.", educational: false },
      { name: "Fitness Center", count: 1456, description: "On-site gyms and fitness programs as part of holistic recovery.", educational: true },
      { name: "Gourmet Dining", count: 345, description: "Chef-prepared meals focusing on nutrition and recovery support.", educational: false },
      { name: "Equine Therapy", count: 234, description: "Therapeutic interactions with horses for emotional healing.", educational: true },
      { name: "Art & Music Therapy", count: 1123, description: "Creative expression as a tool for processing emotions.", educational: true },
      { name: "Adventure Therapy", count: 456, description: "Outdoor activities building confidence and life skills.", educational: true },
      { name: "Pet-Friendly", count: 312, description: "Facilities welcoming pets or offering animal-assisted therapy.", educational: true },
    ],
  },
  prices: {
    title: "Price Ranges",
    description: "Find treatment options that fit your budget, from free to luxury.",
    items: [
      { name: "Free/State-Funded", count: 445, description: "No-cost treatment through government grants and state funding.", educational: true },
      { name: "Under $10,000/month", count: 1234, description: "Affordable options often covered partially or fully by insurance.", educational: true },
      { name: "$10,000-$25,000/month", count: 1567, description: "Mid-range programs with quality care and comprehensive services.", educational: true },
      { name: "$25,000-$50,000/month", count: 456, description: "Premium facilities with enhanced amenities and programming.", educational: false },
      { name: "$50,000+/month", count: 234, description: "Luxury treatment centers with resort-style accommodations.", educational: false },
      { name: "Insurance Covered", count: 2345, description: "Programs accepting major insurance plans for minimal out-of-pocket costs.", educational: true },
      { name: "Payment Plans Available", count: 1678, description: "Flexible financing options making treatment accessible.", educational: true },
      { name: "Scholarships Available", count: 567, description: "Treatment grants and scholarships for those with financial need.", educational: true },
    ],
  },
  activities: {
    title: "Therapeutic Activities",
    description: "Explore the healing activities and programs offered at treatment centers.",
    items: [
      { name: "Yoga & Meditation", count: 1789, description: "Mindfulness practices reducing stress and building emotional awareness.", educational: true },
      { name: "Acupuncture", count: 456, description: "Traditional healing technique supporting detox and relaxation.", educational: true },
      { name: "Massage Therapy", count: 678, description: "Physical healing and stress relief through therapeutic touch.", educational: true },
      { name: "Outdoor Recreation", count: 1234, description: "Hiking, camping, and nature-based therapeutic experiences.", educational: true },
      { name: "Sports Programs", count: 567, description: "Team and individual sports building healthy habits and community.", educational: true },
      { name: "Life Skills Training", count: 1890, description: "Practical skills for independent living and career development.", educational: true },
      { name: "Nutrition Counseling", count: 1456, description: "Dietary guidance supporting physical recovery and mental health.", educational: true },
      { name: "Vocational Training", count: 678, description: "Career counseling and job training for life after treatment.", educational: true },
    ],
  },
};

const tabOrder = ["conditions", "specialty", "insurance", "therapies", "care", "approaches", "amenities", "prices", "activities"];

export function BrowseTabsSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-primary font-semibold">Find Rehab</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Start With Finding Your Perfect Place
          </h2>
          <p className="text-muted-foreground mt-2">
            Browse 3,500+ Treatment Providers
          </p>
        </div>

        <Tabs defaultValue="conditions" className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full md:w-full md:grid md:grid-cols-9 h-auto p-1 bg-transparent gap-1">
              {tabOrder.map((tabKey) => (
                <TabsTrigger
                  key={tabKey}
                  value={tabKey}
                  className="px-4 py-2 rounded-full border border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap text-sm font-medium"
                >
                  {tabKey === "conditions" && "Conditions"}
                  {tabKey === "specialty" && "Specialty"}
                  {tabKey === "insurance" && "Insurance"}
                  {tabKey === "therapies" && "Therapies"}
                  {tabKey === "care" && "Care"}
                  {tabKey === "approaches" && "Approaches"}
                  {tabKey === "amenities" && "Amenities"}
                  {tabKey === "prices" && "Prices"}
                  {tabKey === "activities" && "Activities"}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabOrder.map((tabKey) => {
            const tab = tabsData[tabKey as keyof typeof tabsData];
            return (
              <TabsContent key={tabKey} value={tabKey} className="mt-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-foreground">{tab.title}</h3>
                  <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">{tab.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {tab.items.map((item) => (
                    <Card 
                      key={item.name} 
                      className="hover:shadow-md transition-shadow cursor-pointer group border-border hover:border-primary/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          {item.educational ? (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Learn
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs shrink-0">
                              <Building2 className="h-3 w-3 mr-1" />
                              {item.count}+
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        {!item.educational && (
                          <div className="mt-3 flex items-center text-primary text-sm font-medium">
                            View Centers <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Educational Callout */}
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        Understanding {tab.title.replace("Browse by ", "").replace(" Programs", "").replace(" & Features", "")}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Making informed decisions about treatment is crucial for successful recovery. 
                        Our comprehensive guides explain different options, what to expect, and how to choose 
                        the right path for your unique situation.
                      </p>
                    </div>
                    <Button variant="outline" className="shrink-0">
                      Read Our Guide <BookOpen className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
            <Phone className="h-5 w-5 mr-2" />
            Get Help Now
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Free, confidential support available 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
