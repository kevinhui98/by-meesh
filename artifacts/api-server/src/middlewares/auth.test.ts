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

describe("requireOwner middleware (via makeRequireOwner)", () => {
  before(() => { delete process.env.OWNER_USER_ID; });
  after(() => { delete process.env.OWNER_USER_ID; });

  it("returns 401 when no userId (unauthenticated)", () => {
    const mw = makeRequireOwner(() => null);
    const res = makeRes();
    const nextSpy: NextFunction & { called: boolean } = Object.assign(
      () => { nextSpy.called = true; },
      { called: false }
    );
    mw({} as Request, res, nextSpy);
    assert.equal(res.statusCode, 401);
    assert.equal(nextSpy.called, false);
  });

  it("returns 403 when userId does not match OWNER_USER_ID", () => {
    process.env.OWNER_USER_ID = "user_owner_abc";
    const mw = makeRequireOwner(() => "user_intruder_xyz");
    const res = makeRes();
    const nextSpy: NextFunction & { called: boolean } = Object.assign(
      () => { nextSpy.called = true; },
      { called: false }
    );
    mw({} as Request, res, nextSpy);
    assert.equal(res.statusCode, 403);
    assert.equal(nextSpy.called, false);
    delete process.env.OWNER_USER_ID;
  });

  it("calls next when userId matches OWNER_USER_ID", () => {
    process.env.OWNER_USER_ID = "user_owner_abc";
    const mw = makeRequireOwner(() => "user_owner_abc");
    const res = makeRes();
    const nextSpy: NextFunction & { called: boolean } = Object.assign(
      () => { nextSpy.called = true; },
      { called: false }
    );
    mw({} as Request, res, nextSpy);
    assert.equal(nextSpy.called, true);
    delete process.env.OWNER_USER_ID;
  });

  it("calls next when OWNER_USER_ID is unset (open access for any auth user)", () => {
    delete process.env.OWNER_USER_ID;
    const mw = makeRequireOwner(() => "user_any_123");
    const res = makeRes();
    const nextSpy: NextFunction & { called: boolean } = Object.assign(
      () => { nextSpy.called = true; },
      { called: false }
    );
    mw({} as Request, res, nextSpy);
    assert.equal(nextSpy.called, true);
  });
});
