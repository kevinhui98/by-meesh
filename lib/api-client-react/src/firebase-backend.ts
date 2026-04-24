import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type { BackendHandler } from "./custom-fetch";
import type {
  CostLine,
  CreateDishBody,
  CreateEventBody,
  DashboardSummary,
  Dish,
  DishCostGroup,
  EventCost,
  EventRequest,
  EventRequestStatus,
  Ingredient,
  IngredientAggregate,
  MenuEntry,
  ProcurementItem,
  SetEventMenuBody,
  Supply,
  SupplyAggregate,
  UpdateDishBody,
  UpdateEventBody,
} from "./generated/api.schemas";

const DISHES = "dishes";
const EVENTS = "events";
const MENUS = "menus";
const COUNTERS = "_counters";

type ApiError = {
  status: number;
  message: string;
};

function apiError(status: number, message: string): Error {
  const err = new Error(message) as Error & ApiError;
  (err as Error & ApiError).status = status;
  return err;
}

async function nextId(db: Firestore, name: string): Promise<number> {
  const ref = doc(db, COUNTERS, name);
  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.exists() ? (snap.data().value as number) : 0) || 0;
    const next = current + 1;
    tx.set(ref, { value: next });
    return next;
  });
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseQuery(url: string): { path: string; params: URLSearchParams } {
  const [path, search = ""] = url.split("?");
  return { path, params: new URLSearchParams(search) };
}

function asNumber(s: string | undefined): number | undefined {
  if (s == null || s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

async function listAll<T>(db: Firestore, col: string): Promise<T[]> {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map((d) => d.data() as T);
}

async function getById<T>(
  db: Firestore,
  col: string,
  id: number,
): Promise<T | null> {
  const snap = await getDoc(doc(db, col, String(id)));
  return snap.exists() ? (snap.data() as T) : null;
}

async function writeById<T extends { id: number }>(
  db: Firestore,
  col: string,
  value: T,
): Promise<void> {
  await setDoc(doc(db, col, String(value.id)), value);
}

async function deleteById(db: Firestore, col: string, id: number): Promise<void> {
  await deleteDoc(doc(db, col, String(id)));
}

// ---------------------------------------------------------------------------
// Domain handlers
// ---------------------------------------------------------------------------

async function handleDishes(
  db: Firestore,
  method: string,
  idPart: string | undefined,
  body: unknown,
): Promise<unknown> {
  if (!idPart) {
    if (method === "GET") {
      const dishes = await listAll<Dish>(db, DISHES);
      return dishes.sort((a, b) => b.id - a.id);
    }
    if (method === "POST") {
      const payload = body as CreateDishBody;
      const id = await nextId(db, DISHES);
      const dish: Dish = {
        id,
        name: payload.name,
        description: payload.description ?? null,
        recipe: payload.recipe ?? null,
        prep: payload.prep ?? null,
        service: payload.service ?? null,
        flatware: payload.flatware ?? null,
        category: payload.category ?? null,
        targetGp: payload.targetGp ?? null,
        ingredients: payload.ingredients ?? [],
        supplies: payload.supplies ?? [],
        createdAt: nowIso(),
      };
      await writeById(db, DISHES, dish);
      return dish;
    }
    throw apiError(405, `Method ${method} not allowed on /api/dishes`);
  }

  const id = Number(idPart);
  if (!Number.isFinite(id)) throw apiError(400, `Invalid dish id: ${idPart}`);

  if (method === "GET") {
    const dish = await getById<Dish>(db, DISHES, id);
    if (!dish) throw apiError(404, `Dish ${id} not found`);
    return dish;
  }
  if (method === "PUT") {
    const existing = await getById<Dish>(db, DISHES, id);
    if (!existing) throw apiError(404, `Dish ${id} not found`);
    const patch = body as UpdateDishBody;
    const updated: Dish = {
      ...existing,
      ...("name" in patch && patch.name !== undefined ? { name: patch.name } : {}),
      ...("description" in patch ? { description: patch.description ?? null } : {}),
      ...("recipe" in patch ? { recipe: patch.recipe ?? null } : {}),
      ...("prep" in patch ? { prep: patch.prep ?? null } : {}),
      ...("service" in patch ? { service: patch.service ?? null } : {}),
      ...("flatware" in patch ? { flatware: patch.flatware ?? null } : {}),
      ...("category" in patch ? { category: patch.category ?? null } : {}),
      ...("targetGp" in patch ? { targetGp: patch.targetGp ?? null } : {}),
      ...(patch.ingredients ? { ingredients: patch.ingredients } : {}),
      ...(patch.supplies ? { supplies: patch.supplies } : {}),
    };
    await writeById(db, DISHES, updated);
    return updated;
  }
  if (method === "DELETE") {
    await deleteById(db, DISHES, id);
    return null;
  }
  throw apiError(405, `Method ${method} not allowed on /api/dishes/${id}`);
}

async function handleEventsCollection(
  db: Firestore,
  method: string,
  params: URLSearchParams,
  body: unknown,
): Promise<unknown> {
  if (method === "GET") {
    const statusFilter = params.get("status") as EventRequestStatus | null;
    const events = await listAll<EventRequest>(db, EVENTS);
    const filtered = statusFilter
      ? events.filter((e) => e.status === statusFilter)
      : events;
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  if (method === "POST") {
    const payload = body as CreateEventBody;
    const id = await nextId(db, EVENTS);
    const event: EventRequest = {
      id,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      clientPhone: payload.clientPhone,
      eventDate: payload.eventDate,
      guestCount: payload.guestCount,
      eventType: payload.eventType,
      eventLocation: payload.eventLocation,
      restrictions: payload.restrictions ?? null,
      notes: payload.notes ?? null,
      status: "new",
      createdAt: nowIso(),
    };
    await writeById(db, EVENTS, event);
    return event;
  }
  throw apiError(405, `Method ${method} not allowed on /api/events`);
}

async function handleEventItem(
  db: Firestore,
  method: string,
  id: number,
  body: unknown,
): Promise<unknown> {
  if (method === "GET") {
    const event = await getById<EventRequest>(db, EVENTS, id);
    if (!event) throw apiError(404, `Event ${id} not found`);
    return event;
  }
  if (method === "PUT") {
    const existing = await getById<EventRequest>(db, EVENTS, id);
    if (!existing) throw apiError(404, `Event ${id} not found`);
    const patch = body as UpdateEventBody;
    const updated: EventRequest = {
      ...existing,
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.clientName ? { clientName: patch.clientName } : {}),
      ...(patch.clientEmail ? { clientEmail: patch.clientEmail } : {}),
      ...(patch.clientPhone ? { clientPhone: patch.clientPhone } : {}),
      ...(patch.eventDate ? { eventDate: patch.eventDate } : {}),
      ...(patch.guestCount != null ? { guestCount: patch.guestCount } : {}),
      ...(patch.eventType ? { eventType: patch.eventType } : {}),
      ...(patch.eventLocation ? { eventLocation: patch.eventLocation } : {}),
      ...("restrictions" in patch ? { restrictions: patch.restrictions ?? null } : {}),
      ...("notes" in patch ? { notes: patch.notes ?? null } : {}),
    };
    await writeById(db, EVENTS, updated);
    return updated;
  }
  if (method === "DELETE") {
    await deleteById(db, EVENTS, id);
    await deleteDoc(doc(db, MENUS, String(id))).catch(() => {});
    return null;
  }
  throw apiError(405, `Method ${method} not allowed on /api/events/${id}`);
}

interface StoredMenuEntry {
  dishId: number;
  course: string;
  sortOrder: number;
  quantity: number;
}

interface StoredMenu {
  eventId: number;
  entries: StoredMenuEntry[];
}

async function getStoredMenu(db: Firestore, eventId: number): Promise<StoredMenu> {
  const snap = await getDoc(doc(db, MENUS, String(eventId)));
  if (!snap.exists()) return { eventId, entries: [] };
  const data = snap.data() as StoredMenu;
  // Backfill quantity for legacy entries that may not have it
  return {
    ...data,
    entries: (data.entries ?? []).map((e) => ({ ...e, quantity: e.quantity ?? 1 })),
  };
}

async function hydrateMenu(db: Firestore, stored: StoredMenu): Promise<MenuEntry[]> {
  const sorted = [...stored.entries].sort((a, b) => a.sortOrder - b.sortOrder);
  const out: MenuEntry[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const dish = await getById<Dish>(db, DISHES, entry.dishId);
    if (!dish) continue;
    out.push({
      id: i + 1,
      eventId: stored.eventId,
      dishId: entry.dishId,
      course: entry.course,
      sortOrder: entry.sortOrder,
      quantity: entry.quantity ?? 1,
      dish,
    });
  }
  return out;
}

async function handleEventMenu(
  db: Firestore,
  method: string,
  eventId: number,
  body: unknown,
): Promise<unknown> {
  if (method === "GET") {
    const stored = await getStoredMenu(db, eventId);
    return hydrateMenu(db, stored);
  }
  if (method === "PUT") {
    const payload = body as SetEventMenuBody;
    const stored: StoredMenu = {
      eventId,
      entries: (payload.entries ?? []).map((e) => ({
        dishId: e.dishId,
        course: e.course,
        sortOrder: e.sortOrder,
        quantity: e.quantity ?? 1,
      })),
    };
    await setDoc(doc(db, MENUS, String(eventId)), stored);
    return hydrateMenu(db, stored);
  }
  throw apiError(405, `Method ${method} not allowed on /api/events/${eventId}/menu`);
}

function computeCost(
  eventId: number,
  guestCount: number,
  entries: MenuEntry[],
  margin: number,
): EventCost {
  const lines: CostLine[] = [];
  const dishGroups: DishCostGroup[] = [];
  let atCost = 0;

  for (const entry of entries) {
    const dishQuantity = entry.quantity ?? 1;
    let dishAtCost = 0;

    for (const ing of entry.dish.ingredients) {
      const qty = Number(ing.quantity) * guestCount * dishQuantity;
      const totalCost = qty * ing.unitCost;
      atCost += totalCost;
      dishAtCost += totalCost;
      lines.push({
        name: ing.name,
        quantity: String(qty),
        unitCost: ing.unitCost,
        totalCost,
        type: "ingredient",
        dishName: entry.dish.name,
      });
    }
    for (const sup of entry.dish.supplies) {
      const qty = Number(sup.quantity) * guestCount * dishQuantity;
      const totalCost = qty * sup.unitCost;
      atCost += totalCost;
      dishAtCost += totalCost;
      lines.push({
        name: sup.name,
        quantity: String(qty),
        unitCost: sup.unitCost,
        totalCost,
        type: "supply",
        dishName: entry.dish.name,
      });
    }

    dishGroups.push({
      dishId: entry.dishId,
      dishName: entry.dish.name,
      quantity: dishQuantity,
      atCost: dishAtCost,
    });
  }

  return {
    eventId,
    guestCount,
    atCost,
    margin,
    totalPrice: atCost * margin,
    lines,
    dishGroups,
  };
}

async function handleEventCost(
  db: Firestore,
  method: string,
  eventId: number,
  params: URLSearchParams,
): Promise<unknown> {
  if (method !== "GET") {
    throw apiError(405, `Method ${method} not allowed on /api/events/${eventId}/cost`);
  }
  const margin = asNumber(params.get("margin") ?? undefined) ?? 1;
  const event = await getById<EventRequest>(db, EVENTS, eventId);
  if (!event) throw apiError(404, `Event ${eventId} not found`);
  const stored = await getStoredMenu(db, eventId);
  const entries = await hydrateMenu(db, stored);
  return computeCost(eventId, event.guestCount, entries, margin);
}

async function handleDashboardSummary(
  db: Firestore,
  method: string,
): Promise<DashboardSummary> {
  if (method !== "GET") {
    throw apiError(405, `Method ${method} not allowed on /api/dashboard/summary`);
  }

  const [events, dishes] = await Promise.all([
    listAll<EventRequest>(db, EVENTS),
    listAll<Dish>(db, DISHES),
  ]);

  const menusSnap = await getDocs(collection(db, MENUS));
  const storedMenus = menusSnap.docs.map((d) => d.data() as StoredMenu);
  const dishById = new Map<number, Dish>(dishes.map((d) => [d.id, d]));

  let totalEstimatedRevenue = 0;
  let totalAtCost = 0;
  const ingredientTotals = new Map<string, IngredientAggregate>();
  const supplyTotals = new Map<string, SupplyAggregate>();
  const flatwareSet = new Set<string>();

  const eventById = new Map(events.map((e) => [e.id, e]));

  for (const menu of storedMenus) {
    const event = eventById.get(menu.eventId);
    if (!event) continue;
    const guests = event.guestCount;

    for (const entry of menu.entries) {
      const dish = dishById.get(entry.dishId);
      if (!dish) continue;
      const dishQuantity = (entry as StoredMenuEntry).quantity ?? 1;

      for (const ing of dish.ingredients) {
        const qty = Number(ing.quantity) * guests * dishQuantity;
        const cost = qty * ing.unitCost;
        totalAtCost += cost;
        const key = `${ing.name}::${ing.unit}`;
        const prev = ingredientTotals.get(key);
        if (prev) {
          prev.totalQuantity += qty;
          prev.totalCost += cost;
        } else {
          ingredientTotals.set(key, {
            name: ing.name,
            unit: ing.unit,
            totalQuantity: qty,
            totalCost: cost,
          });
        }
      }
      for (const sup of dish.supplies) {
        const qty = Number(sup.quantity) * guests * dishQuantity;
        const cost = qty * sup.unitCost;
        totalAtCost += cost;
        const prev = supplyTotals.get(sup.name);
        if (prev) {
          prev.totalQuantity += qty;
          prev.totalCost += cost;
        } else {
          supplyTotals.set(sup.name, {
            name: sup.name,
            totalQuantity: qty,
            totalCost: cost,
          });
        }
      }
      if (dish.flatware) flatwareSet.add(dish.flatware);
    }
  }

  totalEstimatedRevenue = totalAtCost; // margin unknown at summary level

  const now = Date.now();
  const upcomingEvents = events
    .filter((e) => new Date(e.eventDate).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    )
    .slice(0, 5);

  return {
    totalEvents: events.length,
    newEvents: events.filter((e) => e.status === "new").length,
    inProgressEvents: events.filter((e) => e.status === "in_progress").length,
    confirmedEvents: events.filter((e) => e.status === "confirmed").length,
    totalDishes: dishes.length,
    totalEstimatedRevenue,
    totalAtCost,
    upcomingEvents,
    ingredientTotals: [...ingredientTotals.values()],
    supplyTotals: [...supplyTotals.values()],
    flatwareRequired: [...flatwareSet],
  };
}

async function handleProcurement(
  db: Firestore,
  method: string,
  params: URLSearchParams,
): Promise<ProcurementItem[]> {
  if (method !== "GET") {
    throw apiError(405, `Method ${method} not allowed on /api/procurement`);
  }
  const eventIdFilter = asNumber(params.get("eventId") ?? undefined);

  const [events, dishes] = await Promise.all([
    listAll<EventRequest>(db, EVENTS),
    listAll<Dish>(db, DISHES),
  ]);
  const menusSnap = await getDocs(collection(db, MENUS));
  const storedMenus = menusSnap.docs.map((d) => d.data() as StoredMenu);
  const dishById = new Map<number, Dish>(dishes.map((d) => [d.id, d]));
  const eventById = new Map(events.map((e) => [e.id, e]));

  const ingredientAgg = new Map<
    string,
    { item: ProcurementItem; quantity: number }
  >();
  const supplyAgg = new Map<
    string,
    { item: ProcurementItem; quantity: number }
  >();

  for (const menu of storedMenus) {
    if (eventIdFilter != null && menu.eventId !== eventIdFilter) continue;
    const event = eventById.get(menu.eventId);
    if (!event) continue;
    const eventLabel = `${event.clientName} — ${event.eventDate}`;

    for (const entry of menu.entries) {
      const dish = dishById.get(entry.dishId);
      if (!dish) continue;
      const dishQuantity = (entry as StoredMenuEntry).quantity ?? 1;

      for (const ing of dish.ingredients) {
        const qty = Number(ing.quantity) * event.guestCount * dishQuantity;
        const cost = qty * ing.unitCost;
        const key = `${ing.name}::${ing.unit}`;
        const prev = ingredientAgg.get(key);
        if (prev) {
          prev.quantity += qty;
          prev.item.totalQuantity = String(prev.quantity);
          prev.item.estimatedCost += cost;
          if (!prev.item.events.includes(eventLabel)) {
            prev.item.events.push(eventLabel);
          }
        } else {
          ingredientAgg.set(key, {
            quantity: qty,
            item: {
              name: ing.name,
              totalQuantity: String(qty),
              unit: ing.unit,
              estimatedCost: cost,
              type: "ingredient",
              events: [eventLabel],
            },
          });
        }
      }
      for (const sup of dish.supplies) {
        const qty = Number(sup.quantity) * event.guestCount * dishQuantity;
        const cost = qty * sup.unitCost;
        const key = sup.name;
        const prev = supplyAgg.get(key);
        if (prev) {
          prev.quantity += qty;
          prev.item.totalQuantity = String(prev.quantity);
          prev.item.estimatedCost += cost;
          if (!prev.item.events.includes(eventLabel)) {
            prev.item.events.push(eventLabel);
          }
        } else {
          supplyAgg.set(key, {
            quantity: qty,
            item: {
              name: sup.name,
              totalQuantity: String(qty),
              unit: "",
              estimatedCost: cost,
              type: "supply",
              events: [eventLabel],
            },
          });
        }
      }
    }
  }

  return [
    ...[...ingredientAgg.values()].map((x) => x.item),
    ...[...supplyAgg.values()].map((x) => x.item),
  ];
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export function createFirebaseBackend(db: Firestore): BackendHandler {
  return {
    async handle(method, url, body): Promise<unknown> {
      const { path, params } = parseQuery(url);
      const segments = path.replace(/^\/api\/?/, "").split("/").filter(Boolean);

      const [resource, a, b] = segments;

      if (resource === "healthz") {
        return { status: "ok" };
      }

      if (resource === "dishes") {
        return handleDishes(db, method, a, body);
      }

      if (resource === "events") {
        if (!a) return handleEventsCollection(db, method, params, body);
        const id = Number(a);
        if (!Number.isFinite(id)) throw apiError(400, `Invalid event id: ${a}`);
        if (!b) return handleEventItem(db, method, id, body);
        if (b === "menu") return handleEventMenu(db, method, id, body);
        if (b === "cost") return handleEventCost(db, method, id, params);
        throw apiError(404, `Unknown event subroute: ${b}`);
      }

      if (resource === "dashboard" && a === "summary") {
        return handleDashboardSummary(db, method);
      }

      if (resource === "procurement") {
        return handleProcurement(db, method, params);
      }

      throw apiError(404, `No handler for ${method} ${url}`);
    },
  };
}
