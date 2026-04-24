import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  unitCost: z.number(),
});

export const supplySchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unitCost: z.number(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type Supply = z.infer<typeof supplySchema>;

export const dishesTable = pgTable("dishes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  recipe: text("recipe"),
  prep: text("prep"),
  service: text("service"),
  flatware: text("flatware"),
  ingredients: jsonb("ingredients").$type<Ingredient[]>().notNull().default([]),
  supplies: jsonb("supplies").$type<Supply[]>().notNull().default([]),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDishSchema = createInsertSchema(dishesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDish = z.infer<typeof insertDishSchema>;
export type Dish = typeof dishesTable.$inferSelect;
