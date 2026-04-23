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
  return makeRequireOwner(resolveUserId)(req, res, next);
}

export function makeRequireOwner(getUserId: (req: Request) => string | null) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const ownerId = process.env.OWNER_USER_ID;
    const isProd = process.env.NODE_ENV === "production";

    if (!ownerId && isProd) {
      res
        .status(503)
        .json({ error: "Server misconfiguration: OWNER_USER_ID is not set" });
      return;
    }

    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (ownerId && userId !== ownerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}
