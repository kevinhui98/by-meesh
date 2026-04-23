import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

function resolveUserId(req: Request): string | null {
  return getAuth(req)?.userId ?? null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!resolveUserId(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  const userId = resolveUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ownerId = process.env.OWNER_USER_ID;
  if (ownerId && userId !== ownerId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export function makeRequireOwner(getUserId: (req: Request) => string | null) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const ownerId = process.env.OWNER_USER_ID;
    if (ownerId && userId !== ownerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
