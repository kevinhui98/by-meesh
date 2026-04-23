import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventStatusEnum = pgEnum("event_status", [
  "new",
  "in_progress",
  "confirmed",
]);

export const eventRequestsTable = pgTable("event_requests", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  eventDate: text("event_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  eventType: text("event_type").notNull(),
  restrictions: text("restrictions"),
  notes: text("notes"),
  status: eventStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventRequestSchema = createInsertSchema(
  eventRequestsTable,
).omit({ id: true, createdAt: true });

export type InsertEventRequest = z.infer<typeof insertEventRequestSchema>;
export type EventRequest = typeof eventRequestsTable.$inferSelect;
