import { Header } from "@/components/listing/Header";
import { Footer } from "@/components/listing/Footer";
import { mockFooterLinks, mockNavItems } from "@/data/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Send, CheckCircle, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

import { SEOHead } from "@/components/SEOHead";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const API = import.meta.env.REACT_APP_BACKEND_URL || "";
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit");
    } catch {
      toast({ title: "Error", description: "Failed to send. Please try again." });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll review your message.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageSlug="contact" fallbackTitle="Contact Us" fallbackDescription="Contact United Rehabs for questions about addiction statistics, data corrections, or partnership inquiries." keywords="contact united rehabs, addiction data support" />
      <Header navItems={mockNavItems} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Have questions or feedback? We're here to help.
          </p>

          {/* PHI Warning */}
          <Alert className="border-destructive/50 bg-destructive/10 mb-8">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive dark:text-destructive-foreground">
              <strong>Important Privacy Notice:</strong> Please do NOT submit any Protected Health Information (PHI), 
              medical records, diagnoses, treatment history, or other sensitive health information through this form. 
              This website is not a healthcare provider and is not HIPAA-compliant. For medical concerns, please contact 
              a licensed healthcare provider directly.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-card rounded-lg p-6 border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Get In Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Crisis Hotlines</p>
                      <p className="text-sm text-muted-foreground">988 (Suicide & Crisis)</p>
                      <p className="text-sm text-muted-foreground">1-800-662-4357 (SAMHSA)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">Use the contact form</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Contact Form</p>
                      <p className="text-sm text-muted-foreground">We'll get back to you</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-medium text-foreground mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If you or someone you know is in crisis, please call one of the hotlines above. 
                  They are available 24/7 and completely confidential.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              {isSubmitted ? (
                <div className="bg-card rounded-lg p-8 border text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">Thank You!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your message has been received. We appreciate you reaching out.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-lg p-6 border space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className={errors.name ? "border-destructive" : ""}
                        maxLength={100}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={errors.email ? "border-destructive" : ""}
                        maxLength={255}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      className={errors.subject ? "border-destructive" : ""}
                      maxLength={200}
                    />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message (please do not include any personal health information)"
                      rows={6}
                      className={errors.message ? "border-destructive" : ""}
                      maxLength={2000}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      {errors.message ? (
                        <p className="text-destructive">{errors.message}</p>
                      ) : (
                        <span>Min 10 characters</span>
                      )}
                      <span>{formData.message.length}/2000</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p>
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> and{" "}
                      <a href="/terms-of-service" className="text-primary hover:underline">Terms of Service</a>.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer linkGroups={mockFooterLinks} />
    </div>
  );
}
