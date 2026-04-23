import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response, NextFunction } from "express";
import { makeRequireOwner } from "./auth";

const makeRes = () => {
  let statusCode = 0;
  let body: unknown = undefined;
  const res = {
    status(code: number) { statusCode = code; return res; },
    json(b: unknown) { body = b; return res; },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
};

const makeNext = () => {
  const fn: NextFunction & { called: boolean } = Object.assign(
    () => { fn.called = true; },
    { called: false }
  );
  return fn;
};

describe("requireOwner middleware (via makeRequireOwner)", () => {
  before(() => { delete process.env.OWNER_USER_ID; });
  after(() => { delete process.env.OWNER_USER_ID; });

  it("returns 503 when OWNER_USER_ID is not configured (fail closed)", () => {
    delete process.env.OWNER_USER_ID;
    const mw = makeRequireOwner(() => "user_any_123");
    const res = makeRes();
    const next = makeNext();
    mw({} as Request, res, next);
    assert.equal(res.statusCode, 503);
    assert.equal(next.called, false);
  });

  it("returns 401 when no userId (unauthenticated)", () => {
    process.env.OWNER_USER_ID = "user_owner_abc";
    const mw = makeRequireOwner(() => null);
    const res = makeRes();
    const next = makeNext();
    mw({} as Request, res, next);
    assert.equal(res.statusCode, 401);
    assert.equal(next.called, false);
    delete process.env.OWNER_USER_ID;
  });

  it("returns 403 when userId does not match OWNER_USER_ID", () => {
    process.env.OWNER_USER_ID = "user_owner_abc";
    const mw = makeRequireOwner(() => "user_intruder_xyz");
    const res = makeRes();
    const next = makeNext();
    mw({} as Request, res, next);
    assert.equal(res.statusCode, 403);
    assert.equal(next.called, false);
    delete process.env.OWNER_USER_ID;
  });

  it("calls next when userId matches OWNER_USER_ID", () => {
    process.env.OWNER_USER_ID = "user_owner_abc";
    const mw = makeRequireOwner(() => "user_owner_abc");
    const res = makeRes();
    const next = makeNext();
    mw({} as Request, res, next);
    assert.equal(next.called, true);
    delete process.env.OWNER_USER_ID;
  });
});
