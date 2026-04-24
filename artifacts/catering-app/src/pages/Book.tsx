import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEvent } from "@workspace/api-client-react";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const schema = z.object({
  clientName: z.string().min(2, "Name is required"),
  clientEmail: z.string().email("Valid email required"),
  clientPhone: z.string().min(1, "Phone number is required"),
  eventDate: z.string().min(1, "Event date is required"),
  guestCount: z.coerce.number().int().min(1, "At least 1 guest"),
  eventType: z.string().min(1, "Select an event type"),
  eventLocation: z.string().min(1, "Event location is required"),
  restrictions: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EVENT_TYPES = [
  "Corporate Dinner",
  "Wedding",
  "Birthday Celebration",
  "Cocktail Party",
  "Private Chef Dinner",
  "Holiday Gathering",
  "Other",
];

export default function Book() {
  const [submitted, setSubmitted] = useState(false);
  const createEvent = useCreateEvent();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createEvent.mutateAsync({
        data: {
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          eventDate: data.eventDate,
          guestCount: data.guestCount,
          eventType: data.eventType,
          eventLocation: data.eventLocation,
          restrictions: data.restrictions || null,
          notes: data.notes || null,
        },
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Request Received!</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for reaching out. Michelle will review your request and get back to you within 24 hours to discuss the details.
          </p>
          <Link href="/">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">Book an Event</h1>
          <p className="text-muted-foreground">
            Share a few details about your event and Michelle will be in touch within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your name *</label>
              <input
                {...register("clientName")}
                placeholder="Michelle Smith"
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              {errors.clientName && <p className="mt-1 text-xs text-destructive">{errors.clientName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address *</label>
              <input
                {...register("clientEmail")}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              {errors.clientEmail && <p className="mt-1 text-xs text-destructive">{errors.clientEmail.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone number *</label>
            <input
              {...register("clientPhone")}
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {errors.clientPhone && <p className="mt-1 text-xs text-destructive">{errors.clientPhone.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Event date *</label>
              <input
                {...register("eventDate")}
                type="date"
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              {errors.eventDate && <p className="mt-1 text-xs text-destructive">{errors.eventDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Number of guests *</label>
              <input
                {...register("guestCount")}
                type="number"
                min={1}
                placeholder="20"
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
              {errors.guestCount && <p className="mt-1 text-xs text-destructive">{errors.guestCount.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Event location *</label>
            <input
              {...register("eventLocation")}
              placeholder="e.g. 123 Main St, San Francisco, CA"
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
            {errors.eventLocation && <p className="mt-1 text-xs text-destructive">{errors.eventLocation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Event type *</label>
            <select
              {...register("eventType")}
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            >
              <option value="">Select event type...</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.eventType && <p className="mt-1 text-xs text-destructive">{errors.eventType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Dietary restrictions or allergies</label>
            <textarea
              {...register("restrictions")}
              placeholder="e.g. nut allergy, vegan guests, gluten-free required..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Additional notes</label>
            <textarea
              {...register("notes")}
              placeholder="Tell me more about your vision, venue, or any special requests..."
              rows={4}
              className="w-full px-3.5 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || createEvent.isPending}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting || createEvent.isPending ? "Submitting..." : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
