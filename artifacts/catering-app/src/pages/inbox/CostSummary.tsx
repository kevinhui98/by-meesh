import { useState } from "react";
import { Link, useParams } from "wouter";
import Layout from "@/components/Layout";
import {
  useGetEvent,
  useGetEventCost,
  useGetEventMenu,
  getGetEventQueryKey,
  getGetEventCostQueryKey,
  getGetEventMenuQueryKey,
  type EventRequest,
  type MenuEntry,
  type EventCost,
} from "@workspace/api-client-react";
import { ArrowLeft, DollarSign, FileText, Receipt, ShoppingCart, ClipboardList } from "lucide-react";

function ProposalModal({
  event,
  menu,
  cost,
  onClose,
}: {
  event: EventRequest;
  menu: MenuEntry[];
  cost: EventCost | undefined;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Client Proposal</h1>
          <p className="text-muted-foreground text-sm mt-1">By Meesh Private Catering</p>
        </div>
        <div className="border-b border-border pb-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Client: </span>{event.clientName}</div>
            <div><span className="text-muted-foreground">Date: </span>{event.eventDate}</div>
            <div><span className="text-muted-foreground">Type: </span>{event.eventType}</div>
            <div><span className="text-muted-foreground">Guests: </span>{event.guestCount}</div>
          </div>
        </div>
        <h2 className="font-semibold text-foreground mb-3">Proposed Menu</h2>
        {["Appetizer", "Main", "Side", "Dessert", "Beverage"].map((course) => {
          const dishes = menu.filter((m) => m.course === course);
          if (!dishes.length) return null;
          return (
            <div key={course} className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{course}s</h3>
              <ul className="space-y-1">
                {dishes.map((d) => (
                  <li key={d.id} className="text-sm text-foreground">{d.dish.name}</li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="border-t border-border pt-4 mt-4 text-right">
          <div className="text-sm text-muted-foreground">Total Investment</div>
          <div className="text-2xl font-bold text-foreground">${cost?.totalPrice?.toFixed(2) ?? "—"}</div>
          <p className="text-xs text-muted-foreground mt-1">Pricing includes all ingredients, supplies, and service.</p>
        </div>
        <button onClick={() => window.print()} className="mt-6 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

function ProcurementModal({ cost, onClose }: { cost: EventCost; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background max-w-xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h1 className="text-xl font-bold text-foreground mb-6">Procurement List</h1>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left pb-2">Item</th>
              <th className="text-left pb-2">Qty</th>
              <th className="text-right pb-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {cost.lines.map((line, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2">
                  <div>{line.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{line.type}</div>
                </td>
                <td className="py-2 text-muted-foreground">{line.quantity}</td>
                <td className="py-2 text-right">${line.totalCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-3 font-semibold">Total at cost</td>
              <td className="pt-3 text-right font-bold">${cost.atCost.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <button onClick={() => window.print()} className="mt-6 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:opacity-90">
          Print / Save
        </button>
      </div>
    </div>
  );
}

export default function CostSummary() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const [margin, setMargin] = useState(1.3);
  const [modal, setModal] = useState<"proposal" | "procurement" | "invoice" | "runofshow" | null>(null);

  const { data: event } = useGetEvent(eventId, {
    query: { queryKey: getGetEventQueryKey(eventId) },
  });
  const { data: cost, isLoading } = useGetEventCost(eventId, { margin: parseFloat(margin.toFixed(2)) }, {
    query: {
      queryKey: getGetEventCostQueryKey(eventId, { margin: parseFloat(margin.toFixed(2)) }),
    },
  });
  const { data: menu } = useGetEventMenu(eventId, {
    query: { queryKey: getGetEventMenuQueryKey(eventId) },
  });

  const marginPct = Math.round((margin - 1) * 100);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/inbox/${eventId}`}>
            <button className="p-1.5 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Cost & Pricing</h1>
            {event && <p className="text-sm text-muted-foreground">{event.clientName} · {event.guestCount} guests</p>}
          </div>
        </div>

        {/* Margin slider */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Profit Margin</h2>
          <div className="flex items-center gap-4 mb-2">
            <input
              type="range"
              min={1}
              max={2}
              step={0.05}
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="text-xl font-bold text-primary w-16 text-right">{marginPct}%</div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>At cost (0%)</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Price summary */}
        {isLoading ? (
          <div className="h-32 bg-muted rounded-2xl animate-pulse mb-6" />
        ) : (
          <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">At Cost</div>
                <div className="text-xl font-bold text-foreground">${cost?.atCost?.toFixed(2) ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Margin ({marginPct}%)</div>
                <div className="text-xl font-bold text-primary">
                  +${cost ? (cost.totalPrice - cost.atCost).toFixed(2) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Total Price</div>
                <div className="text-xl font-bold text-green-700">${cost?.totalPrice?.toFixed(2) ?? "—"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Line items */}
        {cost && cost.lines.length > 0 && (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Cost Breakdown</h2>
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {cost.lines.map((line, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{line.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{line.type} · {line.quantity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">${line.totalCost.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">${line.unitCost.toFixed(2)}/unit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate outputs */}
        <div className="bg-card border border-card-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Generate Documents</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "proposal" as const, label: "Client Proposal", icon: FileText, desc: "Menu + pricing for client" },
              { id: "invoice" as const, label: "Invoice", icon: Receipt, desc: "Formal payment request" },
              { id: "procurement" as const, label: "Procurement List", icon: ShoppingCart, desc: "Ingredients & supplies to buy" },
              { id: "runofshow" as const, label: "Run of Show", icon: ClipboardList, desc: "Event timeline & prep notes" },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setModal(id)}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
              >
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal === "proposal" && event && menu && (
        <ProposalModal event={event} menu={menu} cost={cost} onClose={() => setModal(null)} />
      )}
      {modal === "procurement" && cost && (
        <ProcurementModal cost={cost} onClose={() => setModal(null)} />
      )}
      {modal === "invoice" && event && cost && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-background max-w-xl w-full rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h1 className="text-xl font-bold text-foreground mb-6">Invoice</h1>
            <div className="border-b border-border pb-4 mb-4 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">To: </span>{event.clientName}</div>
              <div><span className="text-muted-foreground">Email: </span>{event.clientEmail}</div>
              <div><span className="text-muted-foreground">Event: </span>{event.eventDate}</div>
              <div><span className="text-muted-foreground">Guests: </span>{event.guestCount}</div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-border">
              <div>
                <div className="font-medium text-foreground">Catering Services</div>
                <div className="text-sm text-muted-foreground">{event.eventType} · {event.guestCount} guests</div>
              </div>
              <div className="text-xl font-bold text-foreground">${cost.totalPrice.toFixed(2)}</div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Payment due within 14 days of event date.</div>
            <button onClick={() => window.print()} className="mt-6 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:opacity-90">
              Print / Save
            </button>
          </div>
        </div>
      )}
      {modal === "runofshow" && event && menu && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-background max-w-xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h1 className="text-xl font-bold text-foreground mb-2">Run of Show</h1>
            <p className="text-sm text-muted-foreground mb-6">{event.clientName} · {event.eventDate}</p>
            {["Appetizer", "Main", "Side", "Dessert", "Beverage"].map((course) => {
              const dishes = menu.filter((m) => m.course === course);
              if (!dishes.length) return null;
              return (
                <div key={course} className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{course}s</h2>
                  {dishes.map((d) => (
                    <div key={d.id} className="mb-4 p-3 bg-muted rounded-xl">
                      <div className="font-medium text-foreground text-sm mb-1">{d.dish.name}</div>
                      {d.dish.prep && <div className="text-xs text-muted-foreground"><span className="font-medium">Prep: </span>{d.dish.prep}</div>}
                      {d.dish.service && <div className="text-xs text-muted-foreground mt-1"><span className="font-medium">Service: </span>{d.dish.service}</div>}
                      {d.dish.flatware && <div className="text-xs text-muted-foreground mt-1"><span className="font-medium">Flatware: </span>{d.dish.flatware}</div>}
                    </div>
                  ))}
                </div>
              );
            })}
            <button onClick={() => window.print()} className="mt-4 w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium text-sm hover:opacity-90">
              Print / Save
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
