import Layout from "@/components/Layout";
import {
  useGetProcurementList,
  getGetProcurementListQueryKey,
} from "@workspace/api-client-react";
import { ShoppingBasket, Package, Utensils } from "lucide-react";

export default function Procurement() {
  const { data: items, isLoading } = useGetProcurementList(undefined, {
    query: { queryKey: getGetProcurementListQueryKey() },
  });

  const ingredients = items?.filter((i) => i.type === "ingredient") ?? [];
  const supplies = items?.filter((i) => i.type === "supply") ?? [];
  const totalCost = items?.reduce((sum, i) => sum + (i.estimatedCost ?? 0), 0) ?? 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Procurement List</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Aggregated across all active and confirmed events
            </p>
          </div>
          {totalCost > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total estimated cost</div>
              <div className="text-xl font-bold text-foreground">${totalCost.toFixed(2)}</div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : !items?.length ? (
          <div className="text-center py-20">
            <ShoppingBasket className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground mb-1">No items yet</p>
            <p className="text-sm text-muted-foreground">
              Procurement items appear when events have curated menus.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {ingredients.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Ingredients</h2>
                  <span className="text-xs text-muted-foreground">({ingredients.length})</span>
                </div>
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Qty</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Events</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((item, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-foreground">{item.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {item.totalQuantity} {item.unit}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {item.events.slice(0, 2).map((e, j) => (
                                <span key={j} className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full truncate max-w-[120px]">{e}</span>
                              ))}
                              {item.events.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{item.events.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">${item.estimatedCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {supplies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Supplies & Equipment</h2>
                  <span className="text-xs text-muted-foreground">({supplies.length})</span>
                </div>
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Item</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantity</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Events</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplies.map((item, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.totalQuantity}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {item.events.slice(0, 2).map((e, j) => (
                                <span key={j} className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full truncate max-w-[120px]">{e}</span>
                              ))}
                              {item.events.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{item.events.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-foreground">${item.estimatedCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
