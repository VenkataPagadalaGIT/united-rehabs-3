import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  "What are the 5 phases of the addiction progression?",
  "What increases the likelihood of addiction?",
  "What is the cycle of addiction change?",
  "What is the biggest factor in addiction?",
  "How does addiction develop?",
  "What is the biggest predictor of addiction?",
  "What are the 5 C's of addiction?",
  "What are the most commonly abused drugs?",
  "What are the three patterns of addiction?",
  "What does the Bible say about addiction?",
  "Is alcoholism a real addiction T or F?",
  "Who is most susceptible to addiction?",
];

export function FAQ() {
  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-primary text-sm font-medium">FAQ</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">
            People Also Ask
          </h2>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  This is the answer to the question "{faq}". Addiction is a 
                  complex condition that involves physical, psychological, and 
                  social factors. Treatment approaches vary based on individual 
                  needs and circumstances.
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
