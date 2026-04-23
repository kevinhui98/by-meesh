import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventRequestsTable } from "./events";
import { dishesTable } from "./dishes";

export const eventMenusTable = pgTable("event_menus", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventRequestsTable.id, { onDelete: "cascade" }),
  dishId: integer("dish_id")
    .notNull()
    .references(() => dishesTable.id, { onDelete: "cascade" }),
  course: text("course").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertEventMenuSchema = createInsertSchema(eventMenusTable).omit({
  id: true,
});

export type InsertEventMenu = z.infer<typeof insertEventMenuSchema>;
export type EventMenu = typeof eventMenusTable.$inferSelect;
