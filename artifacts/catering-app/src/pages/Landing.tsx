import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Star,
  Users,
  ChefHat,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Plus,
} from "lucide-react";
import { useGetDishes } from "@workspace/api-client-react";

const DISHES_PREVIEW_COUNT = 5;

const SUGGESTED_SEARCHES = [
  "Corporate",
  "Weddings",
  "Birthdays",
  "Private Chef",
  "Cocktail Parties",
  "Holidays",
  "Vegetarian",
  "Seasonal",
];

const NAV_LINKS = [
  { href: "#menu", label: "Menu" },
  { href: "#about", label: "About" },
  { href: "/book", label: "Book" },
  { href: "#contact", label: "Contact" },
];

// Hero slides — image-only rotation. Drop real food photos here (e.g. "/hero-1.jpg") when ready.
const HERO_SLIDES: Array<{ image: string | null; gradient: string }> = [
  { image: null, gradient: "from-primary/25 via-accent/40 to-primary/10" },
  { image: null, gradient: "from-accent/50 via-primary/20 to-accent/20" },
  { image: null, gradient: "from-primary/30 via-accent/30 to-primary/5" },
];

const TESTIMONIALS = [
  {
    quote:
      "Michelle catered our intimate wedding and left our guests raving for weeks. Every plate felt personal — it was like she cooked it just for us.",
    name: "Sarah & James",
    event: "Wedding · 40 guests",
  },
  {
    quote:
      "We booked Michelle for a client dinner and it turned the whole evening into an experience. The team still talks about the short rib.",
    name: "Anna Kim",
    event: "Corporate Dinner · 25 guests",
  },
  {
    quote:
      "A private dinner for my husband's birthday — flawless from the first canapé to dessert. Seasonal, thoughtful, and quietly stunning.",
    name: "Rachel P.",
    event: "Birthday · 12 guests",
  },
];

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Inquiry",
    desc: "Tell me about your event — date, location, guest count, and the vibe you're after.",
  },
  {
    n: "02",
    title: "Consultation",
    desc: "We chat to understand your story, preferences, and any dietary considerations.",
  },
  {
    n: "03",
    title: "Menu Curation",
    desc: "I craft a tailored, seasonal menu proposal built around your guests and space.",
  },
  {
    n: "04",
    title: "The Event",
    desc: "Cooked on-site, plated with care, served warm. You host. I handle the rest.",
  },
];

const FAQS = [
  {
    q: "What's the minimum event size?",
    a: "I cater intimate events from 8 guests up to 60. For larger events, I partner with a trusted team of sous chefs — let's talk.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing is per-guest and depends on the menu. Typical events start around $150 per guest, all-inclusive of food and service. A detailed quote follows our consultation.",
  },
  {
    q: "Do you travel outside New York City?",
    a: "Yes — I regularly cater events in NJ, CT, the Hamptons, and the Hudson Valley. Travel is added at cost.",
  },
  {
    q: "Can you accommodate dietary restrictions?",
    a: "Absolutely. Vegetarian, vegan, gluten-free, and allergy-conscious menus are part of what I do. Just share any restrictions during consultation.",
  },
  {
    q: "How far in advance should I book?",
    a: "I recommend reaching out 4–8 weeks ahead. Peak season (May–September and November–December) fills up earlier, so the sooner the better.",
  },
  {
    q: "Do you provide staff and rentals?",
    a: "I bring a small service team when the event calls for it. Rentals like plates, glassware, and linen can be coordinated through trusted partners.",
  },
];

export default function Landing() {
  const { data: dishes } = useGetDishes();
  const previewDishes = (dishes ?? []).slice(0, DISHES_PREVIEW_COUNT);

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav — 3 columns: links | centered logo | actions */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-3 items-center">
          <div className="flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) =>
              href.startsWith("/") ? (
                <Link
                  key={label}
                  href={href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ),
            )}
          </div>
          <div className="flex justify-center">
            <Link href="/">
              <img
                src="/Logo_3.svg"
                alt="By Meesh"
                className="h-12 w-auto cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Link href="/book">
              <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
                Book
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — 2 columns: copy | slider */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">
              New Season
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mb-6">
              Exceptional food,
              <br />
              <span className="text-primary">crafted for you.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-8">
              Hi, I'm Michelle. I create intimate, thoughtfully-sourced dining
              experiences for events that matter.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book">
                <button className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                  Plan Your Event
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <a
                href="#menu"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-full text-sm font-medium hover:bg-muted transition-colors"
              >
                Explore the Menu
              </a>
            </div>
          </div>

          {/* Hero slider */}
          <div className="relative">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] rounded-3xl overflow-hidden">
              {HERO_SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    i === slide ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {s.image ? (
                    <img
                      src={s.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${s.gradient} flex items-center justify-center`}
                    >
                      <img
                        src="/Logo_5.svg"
                        alt=""
                        className="w-40 h-40 opacity-80"
                      />
                    </div>
                  )}
                </div>
              ))}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === slide ? "w-8 bg-primary" : "w-2 bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Suggested Searches */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground mb-5">
            Browse by
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Menu preview */}
      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            Recommended Menu
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
              You & Meesh, forever
            </h2>
            <a
              href="#all-dishes"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              See All Dishes
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {previewDishes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {previewDishes.map((dish) => (
                <div key={dish.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-accent/40 to-primary/10 flex items-center justify-center mb-3">
                    <img src="/Logo_5.svg" alt="" className="w-20 h-20 opacity-70" />
                  </div>
                  {dish.category && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      {dish.category}
                    </p>
                  )}
                  <h3 className="font-semibold text-sm text-foreground leading-snug mb-1 line-clamp-2">
                    {dish.name}
                  </h3>
                  {dish.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              <img src="/Logo_5.svg" alt="" className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p>Menu coming soon — check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            Guest Stories
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-xl mb-12">
            Trusted by hosts across New York.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-card border border-card-border rounded-2xl p-7 flex flex-col"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground text-base leading-relaxed mb-6 flex-1">
                  "{t.quote}"
                </p>
                <div className="pt-5 border-t border-border">
                  <div className="font-semibold text-sm text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {t.event}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-sidebar text-sidebar-foreground py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-primary mb-5">
            The Chef
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
            About Michelle
          </h2>
          <p className="text-sidebar-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
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
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight max-w-xl mb-14">
            From first inquiry to the final plate.
          </h2>
          <div className="grid md:grid-cols-4 gap-8 md:gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-14 right-[-1.5rem] h-px bg-border" />
                )}
                <div className="relative w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mb-5 z-10">
                  {s.n}
                </div>
                <h3 className="font-semibold text-base text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs font-semibold text-muted-foreground mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight mb-10">
            Common questions.
          </h2>
          <div className="divide-y divide-border border-y border-border">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none text-foreground font-semibold text-base">
                  <span>{q}</span>
                  <Plus className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-45 shrink-0 ml-4" />
                </summary>
                <p className="text-muted-foreground text-sm leading-relaxed mt-3 pr-10">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Ready to plan?
          </h2>
          <p className="text-muted-foreground mb-8">
            Tell me about your event and I'll get back to you within 24 hours.
          </p>
          <Link href="/book">
            <button className="group inline-flex items-center gap-2 mx-auto bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
              Get in Touch
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            <div className="col-span-2">
              <img src="/Logo_3.svg" alt="By Meesh" className="h-12 w-auto mb-5" />
              <p className="text-sm text-sidebar-foreground/70 leading-relaxed max-w-xs mb-5">
                Private catering in New York City. Intimate, seasonal, and
                crafted with intention for events that matter.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="mailto:hello@bymeesh.com"
                  aria-label="Email"
                  className="w-9 h-9 rounded-full bg-sidebar-accent hover:bg-sidebar-primary hover:text-sidebar-primary-foreground flex items-center justify-center transition-colors"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-4">
                Explore
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#menu" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors">Menu</a></li>
                <li><a href="#about" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors">About</a></li>
                <li><Link href="/book" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors">Book an Event</Link></li>
                <li><a href="#contact" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-4">
                Services
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-sidebar-foreground/80">Corporate Dinners</span></li>
                <li><span className="text-sidebar-foreground/80">Intimate Weddings</span></li>
                <li><span className="text-sidebar-foreground/80">Private Chef</span></li>
                <li><span className="text-sidebar-foreground/80">Cocktail Parties</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/50 mb-4">
                Contact
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5 text-sidebar-foreground/80">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-sidebar-primary" />
                  <span>New York, NY</span>
                </li>
                <li className="flex items-start gap-2.5 text-sidebar-foreground/80">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-sidebar-primary" />
                  <a href="mailto:hello@bymeesh.com" className="hover:text-sidebar-primary transition-colors">hello@bymeesh.com</a>
                </li>
                <li className="flex items-start gap-2.5 text-sidebar-foreground/80">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0 text-sidebar-primary" />
                  <span>By request</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-6 border-t border-sidebar-border flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-sidebar-foreground/50">
              © {new Date().getFullYear()} By Meesh — Private Catering. All rights reserved.
            </p>
            <p className="text-xs text-sidebar-foreground/50">
              Crafted with care in NYC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
