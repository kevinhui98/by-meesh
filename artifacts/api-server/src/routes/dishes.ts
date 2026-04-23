import { Router, Request, Response } from "express";
import { requireOwner } from "../middlewares/auth";
import { db } from "@workspace/db";
import { dishesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

import { z } from "zod";

const router = Router();

const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unit: z.string(),
  unitCost: z.number(),
});

const supplySchema = z.object({
  name: z.string(),
  quantity: z.string(),
  unitCost: z.number(),
});

const dishBodySchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  recipe: z.string().nullish(),
  prep: z.string().nullish(),
  service: z.string().nullish(),
  flatware: z.string().nullish(),
  ingredients: z.array(ingredientSchema).default([]),
  supplies: z.array(supplySchema).default([]),
  category: z.string().nullish(),
});

function formatDish(d: typeof dishesTable.$inferSelect) {
  return { ...d, createdAt: d.createdAt.toISOString() };
}

// GET /api/dishes — public
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const dishes = await db.select().from(dishesTable).orderBy(dishesTable.name);
  res.json(dishes.map(formatDish));
});

// POST /api/dishes — auth required
router.post(
  "/",
  requireOwner,
  async (req: Request, res: Response): Promise<void> => {
    const parsed = dishBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [dish] = await db
      .insert(dishesTable)
      .values({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        recipe: parsed.data.recipe ?? null,
        prep: parsed.data.prep ?? null,
        service: parsed.data.service ?? null,
        flatware: parsed.data.flatware ?? null,
        ingredients: parsed.data.ingredients,
        supplies: parsed.data.supplies,
        category: parsed.data.category ?? null,
      })
      .returning();
    res.status(201).json(formatDish(dish));
  },
);

// GET /api/dishes/:id — public
router.get(
  "/:id",
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [dish] = await db
      .select()
      .from(dishesTable)
      .where(eq(dishesTable.id, id));
    if (!dish) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatDish(dish));
  },
);

// PATCH /api/dishes/:id — auth required
router.patch(
  "/:id",
  requireOwner,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = dishBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const updateData: Partial<typeof dishesTable.$inferInsert> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined)
      updateData.description = parsed.data.description ?? null;
    if (parsed.data.recipe !== undefined)
      updateData.recipe = parsed.data.recipe ?? null;
    if (parsed.data.prep !== undefined)
      updateData.prep = parsed.data.prep ?? null;
    if (parsed.data.service !== undefined)
      updateData.service = parsed.data.service ?? null;
    if (parsed.data.flatware !== undefined)
      updateData.flatware = parsed.data.flatware ?? null;
    if (parsed.data.ingredients !== undefined)
      updateData.ingredients = parsed.data.ingredients;
    if (parsed.data.supplies !== undefined)
      updateData.supplies = parsed.data.supplies;
    if (parsed.data.category !== undefined)
      updateData.category = parsed.data.category ?? null;

    const [dish] = await db
      .update(dishesTable)
      .set(updateData)
      .where(eq(dishesTable.id, id))
      .returning();
    if (!dish) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatDish(dish));
  },
);

// DELETE /api/dishes/:id — auth required
router.delete(
  "/:id",
  requireOwner,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(dishesTable).where(eq(dishesTable.id, id));
    res.status(204).end();
  },
);

export default router;
