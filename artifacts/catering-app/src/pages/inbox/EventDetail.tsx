import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import Layout from "@/components/Layout";
import {
  useGetEvent,
  useUpdateEvent,
  useDeleteEvent,
  getGetEventQueryKey,
  getGetEventsQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Users,
  Mail,
  ChefHat,
  DollarSign,
  ClipboardList,
  Check,
  MoreVertical,
  Trash2,
  Phone,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const STATUS_LABELS = {
  new: "New",
  in_progress: "In Progress",
  confirmed: "Confirmed",
} as const;

const STATUS_STYLES = {
  new: "bg-[hsl(194_89%_92%)] text-[hsl(194_80%_35%)] border-[hsl(194_89%_80%)]",
  in_progress: "bg-[hsl(41_100%_88%)] text-[hsl(36_95%_32%)] border-[hsl(41_100%_75%)]",
  confirmed: "bg-[hsl(145_55%_90%)] text-[hsl(145_55%_30%)] border-[hsl(145_55%_75%)]",
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const qc = useQueryClient();

  const { data: event, isLoading } = useGetEvent(eventId, {
    query: { queryKey: getGetEventQueryKey(eventId) },
  });

  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const [, setLocation] = useLocation();
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: "new" | "in_progress" | "confirmed") => {
    if (!event || event.status === status) return;
    setUpdating(true);
    try {
      await updateEvent.mutateAsync({ id: eventId, data: { status, clientPhone: event.clientPhone, eventLocation: event.eventLocation } });
      qc.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
      qc.invalidateQueries({ queryKey: getGetEventsQueryKey() });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Delete this event request? This cannot be undone.")) return;
    try {
      await deleteEvent.mutateAsync({ id: eventId });
      qc.invalidateQueries({ queryKey: getGetEventsQueryKey() });
      toast.success("Event deleted");
      setLocation("/inbox");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="text-muted-foreground">Event not found.</p>
          <Link href="/inbox"><button className="mt-4 text-primary hover:underline text-sm">Back to Inbox</button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/inbox">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{event.clientName}</h1>
            <p className="text-sm text-muted-foreground">{event.eventType}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[event.status]}`}>
            {STATUS_LABELS[event.status]}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleReject}
                disabled={deleteEvent.isPending}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Event Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Calendar, label: "Date", value: event.eventDate },
              { icon: Users, label: "Guests", value: `${event.guestCount} guests` },
              { icon: Mail, label: "Email", value: event.clientEmail },
              { icon: Phone, label: "Phone", value: event.clientPhone },
              { icon: ChefHat, label: "Type", value: event.eventType },
              { icon: MapPin, label: "Location", value: event.eventLocation },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-sm font-medium text-foreground">{value}</div>
                </div>
              </div>
            ))}
          </div>
          {event.restrictions && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Dietary restrictions</div>
              <div className="text-sm text-foreground">{event.restrictions}</div>
            </div>
          )}
          {event.notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Notes</div>
              <div className="text-sm text-foreground">{event.notes}</div>
            </div>
          )}
        </div>

        {/* Status update */}
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Update Status</h2>
          <div className="flex gap-2">
            {(["new", "in_progress", "confirmed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updating || event.status === status}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                  ${event.status === status
                    ? `${STATUS_STYLES[status]} cursor-default`
                    : "bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                {event.status === status && <Check className="w-3.5 h-3.5" />}
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/inbox/${eventId}/menu`}>
            <div className="group bg-card border border-card-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Curate Menu</div>
                  <div className="text-xs text-muted-foreground">Drag & drop dishes</div>
                </div>
              </div>
            </div>
          </Link>
          <Link href={`/inbox/${eventId}/cost`}>
            <div className="group bg-card border border-card-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[hsl(145_55%_90%)] flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[hsl(145_55%_30%)]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Cost & Pricing</div>
                  <div className="text-xs text-muted-foreground">Set margin & generate docs</div>
                </div>
              </div>
            </div>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
