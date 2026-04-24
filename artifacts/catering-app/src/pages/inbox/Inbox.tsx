import { useState } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { useGetEvents, getGetEventsQueryKey } from "@workspace/api-client-react";
import { Calendar, Users, ChevronRight, Inbox as InboxIcon, Plus } from "lucide-react";

const TABS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

type Tab = typeof TABS[number]["key"];

const API_STATUS: Record<string, string> = {
  done: "confirmed",
};

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  done: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<string, string> = {
  new: "new",
  in_progress: "in progress",
  confirmed: "done",
  done: "done",
};

export default function Inbox() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const apiStatus = activeTab !== "all" ? (API_STATUS[activeTab] ?? activeTab) : undefined;
  const { data: events, isLoading } = useGetEvents(
    apiStatus ? { status: apiStatus } : {},
    { query: { queryKey: getGetEventsQueryKey(apiStatus ? { status: apiStatus } : {}) } }
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {events?.length ?? 0} event request{events?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 w-fit">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-xl p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-20">
            <InboxIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground mb-1">No requests yet</p>
            <p className="text-sm text-muted-foreground">Event requests will appear here once submitted.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events?.map((event) => (
              <Link key={event.id} href={`/inbox/${event.id}`}>
                <div className="group bg-card border border-card-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-medium text-foreground text-sm">{event.clientName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[event.status]}`}>
                          {STATUS_LABEL[event.status] ?? event.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.eventDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.guestCount} guests
                        </span>
                        <span className="text-primary/70 font-medium">{event.eventType}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 ml-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
