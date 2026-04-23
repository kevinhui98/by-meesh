import { Router, Request, Response } from "express";
import { requireOwner } from "../middlewares/auth";
import { db } from "@workspace/db";
import {
  eventMenusTable,
  dishesTable,
  eventRequestsTable,
} from "@workspace/db";
import type { Ingredient, Supply } from "@workspace/db";
import { eq } from "drizzle-orm";


const router = Router({ mergeParams: true });

type CostParams = { id: string };

// GET /api/events/:id/cost?margin=1.3
router.get(
  "/",
  requireOwner,
  async (req: Request<CostParams>, res: Response): Promise<void> => {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const marginParam = parseFloat((req.query["margin"] as string) || "1");
    const margin = isNaN(marginParam) || marginParam < 1 ? 1 : marginParam;

    const [event] = await db
      .select()
      .from(eventRequestsTable)
      .where(eq(eventRequestsTable.id, eventId));

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const menuEntries = await db
      .select({ dish: dishesTable })
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
      const ingredients = entry.dish.ingredients as Ingredient[];
      for (const ing of ingredients) {
        const qty = parseFloat(ing.quantity) || 1;
        const total = ing.unitCost * qty * event.guestCount;
        lines.push({
          name: ing.name,
          quantity: `${(qty * event.guestCount).toFixed(2)} ${ing.unit}`,
          unitCost: ing.unitCost,
          totalCost: Math.round(total * 100) / 100,
          type: "ingredient",
        });
        atCost += total;
      }
      const supplies = entry.dish.supplies as Supply[];
      for (const sup of supplies) {
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

    const totalPrice = atCost * margin;

    res.json({
      eventId,
      guestCount: event.guestCount,
      atCost: Math.round(atCost * 100) / 100,
      margin,
      totalPrice: Math.round(totalPrice * 100) / 100,
      lines,
    });
  },
);

export default router;
