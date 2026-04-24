import { Link } from "wouter";
import Layout from "@/components/Layout";
import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import {
  Inbox,
  BookOpen,
  ShoppingBasket,
  TrendingUp,
  Calendar,
  DollarSign,
  ArrowRight,
  Utensils,
  Package,
  Flame,
  type LucideIcon,
} from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {sub && (
          <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  const quickLinks = [
    {
      href: "/inbox",
      label: "View Inbox",
      icon: Inbox,
      desc: "Manage event requests",
    },
    {
      href: "/dishes",
      label: "Dish Library",
      icon: BookOpen,
      desc: "Add & edit dishes",
    },
    // {
    //   href: "/procurement",
    //   label: "Procurement",
    //   icon: ShoppingBasket,
    //   desc: "View shopping list",
    // },
  ];

  const hasActiveData =
    (summary?.ingredientTotals?.length ?? 0) > 0 ||
    (summary?.supplyTotals?.length ?? 0) > 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your catering operations at a glance.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-card-border rounded-2xl p-5 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Events"
              value={summary?.totalEvents ?? 0}
              icon={Calendar}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              label="New Requests"
              value={summary?.newEvents ?? 0}
              icon={Inbox}
              color="bg-[hsl(194_89%_92%)] text-[hsl(194_80%_35%)]"
            />
            <StatCard
              label="At Cost"
              value={`$${(summary?.totalAtCost ?? 0).toFixed(0)}`}
              icon={DollarSign}
              sub="Active events"
              color="bg-[hsl(41_100%_88%)] text-[hsl(36_95%_32%)]"
            />
            <StatCard
              label="Est. Revenue"
              value={`$${(summary?.totalEstimatedRevenue ?? 0).toFixed(0)}`}
              icon={TrendingUp}
              sub="30% default margin"
              color="bg-[hsl(145_55%_90%)] text-[hsl(145_55%_30%)]"
            />
          </div>
        )}

        {/* Status breakdown */}
        {summary && (
          <div className="bg-card border border-card-border rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Event Status Breakdown
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "New",
                  count: summary.newEvents,
                  color: "bg-[hsl(194_89%_63%)]",
                },
                {
                  label: "In Progress",
                  count: summary.inProgressEvents,
                  color: "bg-[hsl(41_100%_57%)]",
                },
                {
                  label: "Confirmed",
                  count: summary.confirmedEvents,
                  color: "bg-[hsl(145_55%_55%)]",
                },
              ].map(({ label, count, color }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {count}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-muted-foreground">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active events aggregates */}
        {!isLoading && hasActiveData && (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Active Event Aggregates
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Totals across in-progress & confirmed events
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ingredients */}
              {(summary?.ingredientTotals?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Ingredients
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {summary?.ingredientTotals?.slice(0, 5).map((ing, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-foreground font-medium truncate mr-2">
                          {ing.name}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {ing.totalQuantity.toFixed(1)} {ing.unit}
                        </span>
                      </div>
                    ))}
                    {(summary?.ingredientTotals?.length ?? 0) > 5 && (
                      <Link href="/procurement">
                        <button className="text-xs text-primary hover:underline mt-1">
                          +{(summary?.ingredientTotals?.length ?? 0) - 5} more →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Supplies */}
              {(summary?.supplyTotals?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Supplies
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {summary?.supplyTotals?.slice(0, 5).map((sup, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-foreground font-medium truncate mr-2">
                          {sup.name}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          ${sup.totalCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {(summary?.supplyTotals?.length ?? 0) > 5 && (
                      <Link href="/procurement">
                        <button className="text-xs text-primary hover:underline mt-1">
                          +{(summary?.supplyTotals?.length ?? 0) - 5} more →
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Flatware */}
              {(summary?.flatwareRequired?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      Flatware
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {summary?.flatwareRequired?.map((f, i) => (
                      <span
                        key={i}
                        className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming events */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Upcoming Events
              </h2>
              <Link href="/inbox">
                <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : summary?.upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No upcoming events in the next 30 days
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {summary?.upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/inbox/${event.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {event.clientName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.eventType} · {event.guestCount} guests
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-foreground">
                          {event.eventDate}
                        </div>
                        <div
                          className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block
                          ${
                            event.status === "confirmed"
                              ? "bg-[hsl(145_55%_90%)] text-[hsl(145_55%_30%)]"
                              : event.status === "in_progress"
                                ? "bg-[hsl(41_100%_88%)] text-[hsl(36_95%_32%)]"
                                : "bg-[hsl(194_89%_92%)] text-[hsl(194_80%_35%)]"
                          }`}
                        >
                          {event.status.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {quickLinks.map(({ href, label, icon: Icon, desc }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {desc}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
