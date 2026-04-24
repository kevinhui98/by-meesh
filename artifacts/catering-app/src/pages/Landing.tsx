import { Link } from "wouter";
import { ArrowRight, Star, Users, ChefHat, MessageSquare, FileText, UtensilsCrossed, CalendarCheck, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useGetDishes } from "@workspace/api-client-react";

const DISHES_PREVIEW_COUNT = 6;

const HOW_IT_WORKS = [
  {
    icon: MessageSquare,
    title: "Tell me about your event",
    description:
      "Share the date, guest count, and the vibe you're going for. A few sentences is enough to start.",
  },
  {
    icon: FileText,
    title: "Personalized proposal",
    description:
      "Within 24 hours I send back a curated menu, pricing, and anything I'd recommend based on your event.",
  },
  {
    icon: UtensilsCrossed,
    title: "Tasting & refinement",
    description:
      "Optional tasting session for weddings and larger events. We fine-tune courses together before the day.",
  },
  {
    icon: CalendarCheck,
    title: "Event day",
    description:
      "I arrive, set up, cook, and plate. You enjoy your guests. Everything leaves cleaner than it started.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      '"Michelle made our wedding dinner feel like a love letter on a plate. Guests are still texting me about the short rib."',
    name: "Sarah K.",
    event: "Intimate Wedding",
    guests: 40,
  },
  {
    quote:
      '"We\'ve used a dozen caterers for client dinners. By Meesh is the only one I\'d book twice in the same month. Precise, warm, effortless."',
    name: "David L.",
    event: "Corporate Dinner",
    guests: 25,
  },
  {
    quote:
      '"Every course felt personal. She remembered my mom is vegetarian and built a whole parallel menu without me having to ask."',
    name: "Priya R.",
    event: "Birthday Celebration",
    guests: 18,
  },
];

const FAQS = [
  {
    question: "How far in advance should I book?",
    answer:
      "Ideally 4–6 weeks for smaller events, and 2–3 months for weddings or larger gatherings. That said, I occasionally have last-minute availability — reach out and I'll let you know.",
  },
  {
    question: "What's the minimum guest count?",
    answer:
      "I work with events of 10 guests and up. For very intimate dinners (under 10), feel free to ask — depending on the season I may be able to accommodate.",
  },
  {
    question: "Do you accommodate dietary restrictions and allergies?",
    answer:
      "Absolutely. I design menus around your guests, not the other way around. Share any dietary needs when you book and I'll build them in from the start.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "I'm based in New York City and serve the five boroughs plus parts of New Jersey and Connecticut. Travel fees may apply for locations outside Manhattan.",
  },
  {
    question: "Do you provide staff, tableware, and service?",
    answer:
      "I handle the cooking and plating. For full-service staffing (servers, bartenders) and rental tableware, I can coordinate with trusted partners — just let me know what you need.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Pricing is per-person and varies based on menu complexity, guest count, and event type. After you fill out the booking form I'll send a detailed proposal within 24 hours.",
  },
];

const EVENT_TYPES = [
  "Corporate Dinners",
  "Intimate Weddings",
  "Birthday Celebrations",
  "Private Chef Events",
  "Cocktail Parties",
  "Holiday Gatherings",
];

export default function Landing() {
  const { data: dishes } = useGetDishes();
  const previewDishes = (dishes ?? []).slice(0, DISHES_PREVIEW_COUNT);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground tracking-wide">
              By Meesh
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                Owner Login
              </button>
            </Link>
            <Link href="/book">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Book an Event
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/20 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent/60 text-accent-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            Private catering in New York city
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            Exceptional food,
            <br />
            <span className="text-primary">crafted for you.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Hi, I'm Michelle. I create intimate, thoughtfully-sourced dining
            experiences for events that matter. Every dish is made with love and
            intention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <button className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                Book Your Event
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a
              href="#menu"
              className="flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-colors"
            >
              Explore the Menu
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto text-center">
            {[
              { value: "10+", label: "Events catered" },
              { value: "100%", label: "Fresh ingredients" },
              { value: "5★", label: "Avg. rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-foreground">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            We cater for
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {EVENT_TYPES.map((type) => (
              <span
                key={type}
                className="bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium border border-border"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Dish library preview */}
      <section id="menu" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              The Menu
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Seasonal, ingredient-driven dishes that tell a story. Every recipe
              is tested, refined, and made with purpose.
            </p>
          </div>
          {previewDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-44 bg-gradient-to-br from-accent/40 to-primary/10 flex items-center justify-center">
                    <ChefHat className="w-14 h-14 text-primary/30" />
                  </div>
                  <div className="p-5">
                    {dish.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {dish.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground mt-1 mb-2">
                      {dish.name}
                    </h3>
                    {dish.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dish.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Menu coming soon — check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="bg-sidebar text-sidebar-foreground py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ChefHat className="w-10 h-10 text-sidebar-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6">About Michelle</h2>
          <p className="text-sidebar-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            With over a decade of experience in fine dining and private
            catering, I bring the warmth of a home kitchen and the precision of
            a restaurant to every table. Every event is personal. Every plate is
            intentional.
          </p>
          <div className="flex justify-center gap-8">
            {[
              { icon: Users, label: "Guest-focused" },
              { icon: ChefHat, label: "Curated Menus" },
              { icon: Star, label: "Bespoke Luxury" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sidebar-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              From first message to first course
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A simple process, designed to feel effortless from your side.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 relative"
              >
                <div className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Kind words
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              What guests remember
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, event, guests }) => (
              <div
                key={name}
                className="bg-background border border-border rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">
                  {quote}
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event} · {guests} guests
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Good to know
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              Frequently asked
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ question, answer }, i) => (
              <div
                key={question}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  {question}
                  {openFaq === i ? (
                    <Minus className="w-4 h-4 text-primary shrink-0 ml-4" />
                  ) : (
                    <Plus className="w-4 h-4 text-primary shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to start planning?
          </h2>
          <p className="text-muted-foreground mb-8">
            Tell me about your event and I'll get back to you within 24 hours.
          </p>
          <Link href="/book">
            <button className="group flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-10 py-4 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
              Book an Event
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChefHat className="w-4 h-4 text-primary" />
            By Meesh — Private Catering
          </div>
          <p className="text-xs text-muted-foreground">Crafted with care</p>
        </div>
      </footer>
    </div>
  );
}
