import { Router } from "express";
import { db } from "@workspace/db";
import { eventMenusTable, dishesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { z } from "zod";

const router = Router({ mergeParams: true });

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const menuEntryInput = z.object({
  dishId: z.number().int(),
  course: z.string(),
  sortOrder: z.number().int(),
});

const setMenuBodySchema = z.object({
  entries: z.array(menuEntryInput),
});

async function getMenuWithDishes(eventId: number) {
  const entries = await db
    .select({
      id: eventMenusTable.id,
      eventId: eventMenusTable.eventId,
      dishId: eventMenusTable.dishId,
      course: eventMenusTable.course,
      sortOrder: eventMenusTable.sortOrder,
      dish: dishesTable,
    })
    .from(eventMenusTable)
    .innerJoin(dishesTable, eq(eventMenusTable.dishId, dishesTable.id))
    .where(eq(eventMenusTable.eventId, eventId))
    .orderBy(eventMenusTable.sortOrder);

  return entries.map((e) => ({
    ...e,
    dish: { ...e.dish, createdAt: e.dish.createdAt.toISOString() },
  }));
}

// GET /api/events/:id/menu
router.get("/", requireAuth, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const menu = await getMenuWithDishes(eventId);
  res.json(menu);
});

// PUT /api/events/:id/menu
router.put("/", requireAuth, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const parsed = setMenuBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }

  // Replace menu
  await db
    .delete(eventMenusTable)
    .where(eq(eventMenusTable.eventId, eventId));

  if (parsed.data.entries.length > 0) {
    await db.insert(eventMenusTable).values(
      parsed.data.entries.map((e) => ({
        eventId,
        dishId: e.dishId,
        course: e.course,
        sortOrder: e.sortOrder,
      })),
    );
  }

  const menu = await getMenuWithDishes(eventId);
  res.json(menu);
});

export default router;
