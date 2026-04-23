import { Link } from "wouter";
import { ArrowRight, Star, Users, ChefHat } from "lucide-react";
import { useGetDishes } from "@workspace/api-client-react";

const DISHES_PREVIEW_COUNT = 6;

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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="font-semibold text-foreground tracking-wide">By Meesh</span>
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
            Private catering in [Your City]
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            Exceptional food,
            <br />
            <span className="text-primary">crafted for you.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Hi, I'm Michelle. I create intimate, thoughtfully-sourced dining experiences for events that matter. 
            Every dish is made with love and intention.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <button className="group flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-base font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                Book Your Event
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#menu" className="flex items-center gap-2 border border-border text-foreground px-8 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-colors">
              Explore the Menu
            </a>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto text-center">
            {[
              { value: "500+", label: "Events catered" },
              { value: "100%", label: "Fresh ingredients" },
              { value: "5★", label: "Avg. rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event types */}
      <section className="bg-card border-y border-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">We cater for</p>
          <div className="flex flex-wrap justify-center gap-3">
            {EVENT_TYPES.map((type) => (
              <span key={type} className="bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium border border-border">
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
            <h2 className="text-3xl font-bold text-foreground mb-4">The Menu</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Seasonal, ingredient-driven dishes that tell a story. Every recipe is tested, refined, and made with purpose.
            </p>
          </div>
          {previewDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewDishes.map((dish) => (
                <div key={dish.id} className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-44 bg-gradient-to-br from-accent/40 to-primary/10 flex items-center justify-center">
                    <ChefHat className="w-14 h-14 text-primary/30" />
                  </div>
                  <div className="p-5">
                    {dish.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">{dish.category}</span>
                    )}
                    <h3 className="font-semibold text-foreground mt-1 mb-2">{dish.name}</h3>
                    {dish.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
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
            With over a decade of experience in fine dining and private catering, I bring the warmth of a home kitchen and the precision of a restaurant to every table. 
            Every event is personal. Every plate is intentional.
          </p>
          <div className="flex justify-center gap-8">
            {[
              { icon: Users, label: "Guest-focused" },
              { icon: ChefHat, label: "Chef-trained" },
              { icon: Star, label: "Award-winning" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sidebar-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start planning?</h2>
          <p className="text-muted-foreground mb-8">Tell me about your event and I'll get back to you within 24 hours.</p>
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
