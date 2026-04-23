import { Router, Request, Response } from "express";
import { requireOwner } from "../middlewares/auth";
import { db } from "@workspace/db";
import { eventMenusTable, dishesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

import { z } from "zod";

// mergeParams lets us read :id from the parent router (/api/events/:id/menu)
const router = Router({ mergeParams: true });

type MenuParams = { id: string };

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
router.get(
  "/",
  requireOwner,
  async (req: Request<MenuParams>, res: Response): Promise<void> => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const menu = await getMenuWithDishes(eventId);
    res.json(menu);
  },
);

// PUT /api/events/:id/menu
router.put(
  "/",
  requireOwner,
  async (req: Request<MenuParams>, res: Response): Promise<void> => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = setMenuBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

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
  },
);

export default router;
