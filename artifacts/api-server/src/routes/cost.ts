import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventMenusTable,
  dishesTable,
  eventRequestsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router({ mergeParams: true });

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// GET /api/events/:id/cost?margin=1.3
router.get("/", requireAuth, async (req, res) => {
  const eventId = parseInt(req.params.id);
  const margin = parseFloat((req.query.margin as string) || "1");

  const [event] = await db
    .select()
    .from(eventRequestsTable)
    .where(eq(eventRequestsTable.id, eventId));

  if (!event) return res.status(404).json({ error: "Event not found" });

  const menuEntries = await db
    .select({
      dish: dishesTable,
    })
    .from(eventMenusTable)
    .innerJoin(dishesTable, eq(eventMenusTable.dishId, dishesTable.id))
    .where(eq(eventMenusTable.eventId, eventId));

  const lines: Array<{
    name: string;
    quantity: string;
    unitCost: number;
    totalCost: number;
    type: "ingredient" | "supply";
  }> = [];

  let atCost = 0;

  for (const entry of menuEntries) {
    for (const ing of entry.dish.ingredients as any[]) {
      const qty = parseFloat(ing.quantity) || 1;
      const total = ing.unitCost * qty * event.guestCount;
      lines.push({
        name: ing.name,
        quantity: `${qty * event.guestCount} ${ing.unit}`,
        unitCost: ing.unitCost,
        totalCost: Math.round(total * 100) / 100,
        type: "ingredient",
      });
      atCost += total;
    }
    for (const sup of entry.dish.supplies as any[]) {
      const qty = parseFloat(sup.quantity) || 1;
      const total = sup.unitCost * qty;
      lines.push({
        name: sup.name,
        quantity: `${qty} unit`,
        unitCost: sup.unitCost,
        totalCost: Math.round(total * 100) / 100,
        type: "supply",
      });
      atCost += total;
    }
  }

  const totalPrice = atCost * (isNaN(margin) ? 1 : margin);

  res.json({
    eventId,
    guestCount: event.guestCount,
    atCost: Math.round(atCost * 100) / 100,
    margin: isNaN(margin) ? 1 : margin,
    totalPrice: Math.round(totalPrice * 100) / 100,
    lines,
  });
});

export default router;
