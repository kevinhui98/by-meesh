import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventRequestsTable,
  eventMenusTable,
  dishesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { getAuth } from "@clerk/express";

const router = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// GET /api/dashboard/summary
router.get("/summary", requireAuth, async (req, res) => {
  const events = await db.select().from(eventRequestsTable);
  const dishes = await db.select().from(dishesTable);

  const newEvents = events.filter((e) => e.status === "new").length;
  const inProgressEvents = events.filter(
    (e) => e.status === "in_progress",
  ).length;
  const confirmedEvents = events.filter((e) => e.status === "confirmed").length;

  // Calculate cost estimates for confirmed/in-progress events
  let totalAtCost = 0;
  let totalEstimatedRevenue = 0;

  const activeEvents = events.filter(
    (e) => e.status === "in_progress" || e.status === "confirmed",
  );

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
        for (const ing of entry.dish.ingredients as any[]) {
          eventCost += (ing.unitCost || 0) * event.guestCount;
        }
        for (const sup of entry.dish.supplies as any[]) {
          eventCost += sup.unitCost || 0;
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
  });
});

// GET /api/dashboard/procurement
router.get("/procurement", requireAuth, async (req, res) => {
  const eventId = req.query.eventId
    ? parseInt(req.query.eventId as string)
    : undefined;

  // Get active events to aggregate
  let eventIds: number[];
  if (eventId) {
    eventIds = [eventId];
  } else {
    const activeEvents = await db
      .select({ id: eventRequestsTable.id })
      .from(eventRequestsTable)
      .where(
        inArray(eventRequestsTable.status, ["in_progress", "confirmed"] as any),
      );
    eventIds = activeEvents.map((e) => e.id);
  }

  if (eventIds.length === 0) {
    return res.json([]);
  }

  const menuEntries = await db
    .select({
      eventId: eventMenusTable.eventId,
      dish: dishesTable,
    })
    .from(eventMenusTable)
    .innerJoin(dishesTable, eq(eventMenusTable.dishId, dishesTable.id))
    .where(inArray(eventMenusTable.eventId, eventIds));

  // Get event info for labels
  const eventInfos = await db
    .select()
    .from(eventRequestsTable)
    .where(inArray(eventRequestsTable.id, eventIds));
  const eventMap = Object.fromEntries(eventInfos.map((e) => [e.id, e]));

  // Aggregate ingredients
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
      unit: string;
      totalQuantity: number;
      estimatedCost: number;
      events: Set<string>;
    }
  >();

  for (const entry of menuEntries) {
    const eventInfo = eventMap[entry.eventId];
    const eventLabel = eventInfo
      ? `${eventInfo.clientName} (${eventInfo.eventDate})`
      : `Event #${entry.eventId}`;
    const guests = eventInfo?.guestCount ?? 1;

    for (const ing of entry.dish.ingredients as any[]) {
      const key = `${ing.name}__${ing.unit}`;
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, {
          name: ing.name,
          unit: ing.unit,
          totalQuantity: 0,
          estimatedCost: 0,
          events: new Set(),
        });
      }
      const agg = ingredientMap.get(key)!;
      const qty = parseFloat(ing.quantity) || 1;
      agg.totalQuantity += qty * guests;
      agg.estimatedCost += (ing.unitCost || 0) * guests;
      agg.events.add(eventLabel);
    }

    for (const sup of entry.dish.supplies as any[]) {
      const key = sup.name;
      if (!supplyMap.has(key)) {
        supplyMap.set(key, {
          name: sup.name,
          unit: "unit",
          totalQuantity: 0,
          estimatedCost: 0,
          events: new Set(),
        });
      }
      const agg = supplyMap.get(key)!;
      const qty = parseFloat(sup.quantity) || 1;
      agg.totalQuantity += qty;
      agg.estimatedCost += sup.unitCost || 0;
      agg.events.add(eventLabel);
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
      unit: a.unit,
      estimatedCost: Math.round(a.estimatedCost * 100) / 100,
      type: "supply" as const,
      events: Array.from(a.events),
    })),
  ];

  res.json(result);
});

export default router;
