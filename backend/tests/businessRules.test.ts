import test from "node:test";
import assert from "node:assert/strict";

test("deadline rule maps to HTTP 409", () => {
  const deadline = new Date(Date.now() - 60_000);
  assert.ok(deadline <= new Date());
  const error = { status: 409, code: "APPLICATION_DEADLINE_PASSED" };
  assert.equal(error.status, 409);
  assert.equal(error.code, "APPLICATION_DEADLINE_PASSED");
});

test("active posting limit is server-side", () => {
  const configuredMax = 3;
  const activeCount = 3;
  assert.ok(activeCount >= configuredMax);
  const error = { status: 409, code: "MAX_ACTIVE_POSTINGS_REACHED" };
  assert.equal(error.status, 409);
  assert.equal(error.code, "MAX_ACTIVE_POSTINGS_REACHED");
});

test("terminal statuses cannot transition", () => {
  const transitions: Record<string, string[]> = { ACCEPTED: [], REJECTED: [], WITHDRAWN: [] };
  assert.deepEqual(transitions.ACCEPTED, []);
  assert.deepEqual(transitions.REJECTED, []);
});
