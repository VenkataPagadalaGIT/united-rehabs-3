import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FAQ } from "@/types";

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQ({ faqs }: FAQSectionProps) {
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
              <AccordionItem key={faq.id} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
