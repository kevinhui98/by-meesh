import { Router } from "express";
import { db } from "@workspace/db";
import { dishesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { z } from "zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

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

// GET /api/dishes - public
router.get("/", async (req, res) => {
  const dishes = await db.select().from(dishesTable).orderBy(dishesTable.name);
  res.json(
    dishes.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  );
});

// POST /api/dishes - auth required
router.post("/", requireAuth, async (req, res) => {
  const parsed = dishBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
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
  res.status(201).json({ ...dish, createdAt: dish.createdAt.toISOString() });
});

// GET /api/dishes/:id - public
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [dish] = await db
    .select()
    .from(dishesTable)
    .where(eq(dishesTable.id, id));
  if (!dish) return res.status(404).json({ error: "Not found" });
  res.json({ ...dish, createdAt: dish.createdAt.toISOString() });
});

// PATCH /api/dishes/:id - auth required
router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = dishBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  const [dish] = await db
    .update(dishesTable)
    .set({
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description ?? null,
      }),
      ...(parsed.data.recipe !== undefined && {
        recipe: parsed.data.recipe ?? null,
      }),
      ...(parsed.data.prep !== undefined && { prep: parsed.data.prep ?? null }),
      ...(parsed.data.service !== undefined && {
        service: parsed.data.service ?? null,
      }),
      ...(parsed.data.flatware !== undefined && {
        flatware: parsed.data.flatware ?? null,
      }),
      ...(parsed.data.ingredients !== undefined && {
        ingredients: parsed.data.ingredients,
      }),
      ...(parsed.data.supplies !== undefined && {
        supplies: parsed.data.supplies,
      }),
      ...(parsed.data.category !== undefined && {
        category: parsed.data.category ?? null,
      }),
    })
    .where(eq(dishesTable.id, id))
    .returning();
  if (!dish) return res.status(404).json({ error: "Not found" });
  res.json({ ...dish, createdAt: dish.createdAt.toISOString() });
});

// DELETE /api/dishes/:id - auth required
router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(dishesTable).where(eq(dishesTable.id, id));
  res.status(204).end();
});

export default router;
