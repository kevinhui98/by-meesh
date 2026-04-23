import { Router, Request, Response } from "express";
import { requireOwner } from "../middlewares/auth";
import { db } from "@workspace/db";
import {
  eventRequestsTable,
  eventMenusTable,
  dishesTable,
} from "@workspace/db";
import type { Ingredient, Supply } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";


const router = Router();

// GET /api/dashboard/summary
router.get(
  "/summary",
  requireOwner,
  async (_req: Request, res: Response): Promise<void> => {
    const [events, dishes] = await Promise.all([
      db.select().from(eventRequestsTable),
      db.select().from(dishesTable),
    ]);

    const newEvents = events.filter((e) => e.status === "new").length;
    const inProgressEvents = events.filter(
      (e) => e.status === "in_progress",
    ).length;
    const confirmedEvents = events.filter(
      (e) => e.status === "confirmed",
    ).length;

    // Aggregate cost data for active (in-progress + confirmed) events
    const activeEvents = events.filter(
      (e) => e.status === "in_progress" || e.status === "confirmed",
    );

    let totalAtCost = 0;
    let totalEstimatedRevenue = 0;

    // Aggregate ingredient/supply totals for active events
    const ingredientTotals = new Map<
      string,
      { name: string; unit: string; totalQuantity: number; totalCost: number }
    >();
    const supplyTotals = new Map<
      string,
      { name: string; totalQuantity: number; totalCost: number }
    >();
    const flatwareSet = new Set<string>();

    if (activeEvents.length > 0) {
      const activeEventIds = activeEvents.map((e) => e.id);
      const menuEntries = await db
        .select({
          eventId: eventMenusTable.eventId,
          dish: dishesTable,
        })
        .from(eventMenusTable)
        .innerJoin(dishesTable, eq(eventMenusTable.dishId, dishesTable.id))
        .where(inArray(eventMenusTable.eventId, activeEventIds));

      for (const event of activeEvents) {
        const eventMenuEntries = menuEntries.filter(
          (m) => m.eventId === event.id,
        );
        let eventCost = 0;

        for (const entry of eventMenuEntries) {
          // Collect flatware strings
          if (entry.dish.flatware) {
            entry.dish.flatware
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .forEach((s) => flatwareSet.add(s));
          }

          const ingredients = entry.dish.ingredients as Ingredient[];
          for (const ing of ingredients) {
            const qty = parseFloat(ing.quantity) || 1;
            const total = ing.unitCost * qty * event.guestCount;
            eventCost += total;

            const key = `${ing.name}__${ing.unit}`;
            const existing = ingredientTotals.get(key);
            if (existing) {
              existing.totalQuantity += qty * event.guestCount;
              existing.totalCost += total;
            } else {
              ingredientTotals.set(key, {
                name: ing.name,
                unit: ing.unit,
                totalQuantity: qty * event.guestCount,
                totalCost: total,
              });
            }
          }

          const supplies = entry.dish.supplies as Supply[];
          for (const sup of supplies) {
            const qty = parseFloat(sup.quantity) || 1;
            const total = sup.unitCost * qty;
            eventCost += total;

            const existing = supplyTotals.get(sup.name);
            if (existing) {
              existing.totalQuantity += qty;
              existing.totalCost += total;
            } else {
              supplyTotals.set(sup.name, {
                name: sup.name,
                totalQuantity: qty,
                totalCost: total,
              });
            }
          }
        }

        totalAtCost += eventCost;
        totalEstimatedRevenue += eventCost * 1.3; // default 30% margin
      }
    }

    // Upcoming events (next 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = events
      .filter((e) => {
        const eventDate = new Date(e.eventDate);
        return eventDate >= now && eventDate <= thirtyDaysLater;
      })
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      )
      .slice(0, 5)
      .map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }));

    res.json({
      totalEvents: events.length,
      newEvents,
      inProgressEvents,
      confirmedEvents,
      totalDishes: dishes.length,
      totalEstimatedRevenue: Math.round(totalEstimatedRevenue * 100) / 100,
      totalAtCost: Math.round(totalAtCost * 100) / 100,
      upcomingEvents,
      // Aggregated active-event totals
      ingredientTotals: Array.from(ingredientTotals.values()).map((i) => ({
        ...i,
        totalQuantity: Math.round(i.totalQuantity * 100) / 100,
        totalCost: Math.round(i.totalCost * 100) / 100,
      })),
      supplyTotals: Array.from(supplyTotals.values()).map((s) => ({
        ...s,
        totalQuantity: Math.round(s.totalQuantity * 100) / 100,
        totalCost: Math.round(s.totalCost * 100) / 100,
      })),
      flatwareRequired: Array.from(flatwareSet),
    });
  },
);

// GET /api/dashboard/procurement
router.get(
  "/procurement",
  requireOwner,
  async (req: Request, res: Response): Promise<void> => {
    const eventIdParam = req.query["eventId"]
      ? parseInt(req.query["eventId"] as string)
      : undefined;

    let eventIds: number[];

    if (eventIdParam !== undefined && !isNaN(eventIdParam)) {
      eventIds = [eventIdParam];
    } else {
      const activeEvents = await db
        .select({ id: eventRequestsTable.id })
        .from(eventRequestsTable)
        .where(inArray(eventRequestsTable.status, ["in_progress", "confirmed"]));
      eventIds = activeEvents.map((e) => e.id);
    }

    if (eventIds.length === 0) {
      res.json([]);
      return;
    }

    const menuEntries = await db
      .select({
        eventId: eventMenusTable.eventId,
        dish: dishesTable,
      })
      .from(eventMenusTable)
      .innerJoin(dishesTable, eq(eventMenusTable.dishId, dishesTable.id))
      .where(inArray(eventMenusTable.eventId, eventIds));

    const eventInfos = await db
      .select()
      .from(eventRequestsTable)
      .where(inArray(eventRequestsTable.id, eventIds));
    const eventMap = new Map(eventInfos.map((e) => [e.id, e]));

    const ingredientMap = new Map<
      string,
      {
        name: string;
        unit: string;
        totalQuantity: number;
        estimatedCost: number;
        events: Set<string>;
      }
    >();
    const supplyMap = new Map<
      string,
      {
        name: string;
        totalQuantity: number;
        estimatedCost: number;
        events: Set<string>;
      }
    >();

    for (const entry of menuEntries) {
      const eventInfo = eventMap.get(entry.eventId);
      const eventLabel = eventInfo
        ? `${eventInfo.clientName} (${eventInfo.eventDate})`
        : `Event #${entry.eventId}`;
      const guests = eventInfo?.guestCount ?? 1;

      const ingredients = entry.dish.ingredients as Ingredient[];
      for (const ing of ingredients) {
        const qty = parseFloat(ing.quantity) || 1;
        const totalQty = qty * guests;
        const totalCost = ing.unitCost * totalQty;
        const key = `${ing.name}__${ing.unit}`;
        const agg = ingredientMap.get(key);
        if (agg) {
          agg.totalQuantity += totalQty;
          agg.estimatedCost += totalCost;
          agg.events.add(eventLabel);
        } else {
          ingredientMap.set(key, {
            name: ing.name,
            unit: ing.unit,
            totalQuantity: totalQty,
            estimatedCost: totalCost,
            events: new Set([eventLabel]),
          });
        }
      }

      const supplies = entry.dish.supplies as Supply[];
      for (const sup of supplies) {
        const qty = parseFloat(sup.quantity) || 1;
        const totalCost = sup.unitCost * qty;
        const agg = supplyMap.get(sup.name);
        if (agg) {
          agg.totalQuantity += qty;
          agg.estimatedCost += totalCost;
          agg.events.add(eventLabel);
        } else {
          supplyMap.set(sup.name, {
            name: sup.name,
            totalQuantity: qty,
            estimatedCost: totalCost,
            events: new Set([eventLabel]),
          });
        }
      }
    }

    const result = [
      ...Array.from(ingredientMap.values()).map((a) => ({
        name: a.name,
        totalQuantity: a.totalQuantity.toFixed(2),
        unit: a.unit,
        estimatedCost: Math.round(a.estimatedCost * 100) / 100,
        type: "ingredient" as const,
        events: Array.from(a.events),
      })),
      ...Array.from(supplyMap.values()).map((a) => ({
        name: a.name,
        totalQuantity: a.totalQuantity.toFixed(2),
        unit: "unit",
        estimatedCost: Math.round(a.estimatedCost * 100) / 100,
        type: "supply" as const,
        events: Array.from(a.events),
      })),
    ];

    res.json(result);
  },
);

export default router;
