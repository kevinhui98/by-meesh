import { Router } from "express";
import { db } from "@workspace/db";
import { eventRequestsTable } from "@workspace/db";
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

const createEventSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string(),
  eventDate: z.string(),
  guestCount: z.number().int(),
  eventType: z.string(),
  restrictions: z.string().nullish(),
  notes: z.string().nullish(),
});

const updateEventSchema = z.object({
  status: z.enum(["new", "in_progress", "confirmed"]).optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.number().int().optional(),
  eventType: z.string().optional(),
  restrictions: z.string().nullish(),
  notes: z.string().nullish(),
});

function formatEvent(e: typeof eventRequestsTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
  };
}

// GET /api/events
router.get("/", requireAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  let query = db.select().from(eventRequestsTable);
  if (status && ["new", "in_progress", "confirmed"].includes(status)) {
    query = query.where(
      eq(eventRequestsTable.status, status as "new" | "in_progress" | "confirmed"),
    ) as typeof query;
  }
  const events = await query.orderBy(eventRequestsTable.createdAt);
  res.json(events.map(formatEvent));
});

// POST /api/events - public (customer submission)
router.post("/", async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
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

// GET /api/events/:id
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const [event] = await db
    .select()
    .from(eventRequestsTable)
    .where(eq(eventRequestsTable.id, id));
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json(formatEvent(event));
});

// PATCH /api/events/:id
router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
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
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json(formatEvent(event));
});

// DELETE /api/events/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(eventRequestsTable).where(eq(eventRequestsTable.id, id));
  res.status(204).end();
});

export default router;
