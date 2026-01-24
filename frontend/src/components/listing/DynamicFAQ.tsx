import { useQuery } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DynamicFAQProps {
  stateId?: string;
  stateName?: string;
}

export function DynamicFAQ({ stateId, stateName }: DynamicFAQProps) {
  const { data: faqs = [], isLoading, error } = useQuery({
    queryKey: ["faqs", stateId],
    queryFn: async () => {
      const result = await faqsApi.getAll({ state_id: stateId, is_active: true, limit: 20 });
      return Array.isArray(result) ? result : [];
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <section className="py-12 bg-secondary/30" data-testid="faq-loading">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-secondary/30" data-testid="faq-section">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-primary text-sm font-medium">FAQ</span>
          <h2 className="text-2xl font-bold text-foreground mt-2">
            {stateName ? `${stateName} Addiction Questions` : "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem key={faq.id} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-foreground hover:text-primary" data-testid={`faq-question-${index}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
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
