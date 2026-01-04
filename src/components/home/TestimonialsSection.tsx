import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "I was overwhelmed before finding this platform. It made my search for the right rehab center easy and stress-free. Forever grateful!",
    name: "Jessica M.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    text: "This site was a lifesaver! Quick, accurate, and incredibly helpful in guiding me to the best treatment options available.",
    name: "Daniel S.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    text: "Excellent resource! The site's easy navigation and reliable information helped me find the perfect rehab center. I couldn't have done it without them.",
    name: "Chris P.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    text: "Navigating rehab choices can be tough, but this website took the guesswork out. Their resources are invaluable, and I found the perfect place for recovery.",
    name: "Michael T.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 5,
    text: "Very impressed with the detailed information on different centers. It made my decision so much easier, and I felt supported the entire time.",
    name: "Emily R.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 6,
    text: "Finding the right rehab felt impossible until I found this site. The recommendations were spot-on, and the process was smooth from start to finish.",
    name: "Sophia L.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-primary font-medium mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            50 000+ People Have Already Found Their Place
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium text-foreground">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
