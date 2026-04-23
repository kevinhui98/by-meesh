import { Router, Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { eventRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { z } from "zod";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const createEventSchema = z.object({
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  eventDate: z.string().min(1),
  guestCount: z.number().int().positive(),
  eventType: z.string().min(1),
  restrictions: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const updateEventSchema = z.object({
  status: z.enum(["new", "in_progress", "confirmed"]).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.number().int().positive().optional(),
  eventType: z.string().optional(),
  restrictions: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

function formatEvent(e: typeof eventRequestsTable.$inferSelect) {
  return { ...e, createdAt: e.createdAt.toISOString() };
}

// GET /api/events — auth required
router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  const status = req.query["status"] as string | undefined;
  const validStatuses = ["new", "in_progress", "confirmed"] as const;

  const rows = await db.select().from(eventRequestsTable);
  const filtered =
    status && (validStatuses as readonly string[]).includes(status)
      ? rows.filter((e) => e.status === status)
      : rows;

  const sorted = filtered.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
  res.json(sorted.map(formatEvent));
});

// POST /api/events — public (customer booking)
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db
    .insert(eventRequestsTable)
    .values({
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      eventDate: parsed.data.eventDate,
      guestCount: parsed.data.guestCount,
      eventType: parsed.data.eventType,
      restrictions: parsed.data.restrictions ?? null,
      notes: parsed.data.notes ?? null,
      status: "new",
    })
    .returning();
  res.status(201).json(formatEvent(event));
});

// GET /api/events/:id — auth required
router.get(
  "/:id",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [event] = await db
      .select()
      .from(eventRequestsTable)
      .where(eq(eventRequestsTable.id, id));
    if (!event) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatEvent(event));
  },
);

// PATCH /api/events/:id — auth required
router.patch(
  "/:id",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const updateData: Partial<typeof eventRequestsTable.$inferInsert> = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.clientName !== undefined)
      updateData.clientName = parsed.data.clientName;
    if (parsed.data.clientEmail !== undefined)
      updateData.clientEmail = parsed.data.clientEmail;
    if (parsed.data.eventDate !== undefined)
      updateData.eventDate = parsed.data.eventDate;
    if (parsed.data.guestCount !== undefined)
      updateData.guestCount = parsed.data.guestCount;
    if (parsed.data.eventType !== undefined)
      updateData.eventType = parsed.data.eventType;
    if (parsed.data.restrictions !== undefined)
      updateData.restrictions = parsed.data.restrictions ?? null;
    if (parsed.data.notes !== undefined)
      updateData.notes = parsed.data.notes ?? null;

    const [event] = await db
      .update(eventRequestsTable)
      .set(updateData)
      .where(eq(eventRequestsTable.id, id))
      .returning();
    if (!event) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatEvent(event));
  },
);

// DELETE /api/events/:id — auth required
router.delete(
  "/:id",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    await db.delete(eventRequestsTable).where(eq(eventRequestsTable.id, id));
    res.status(204).end();
  },
);

export default router;
