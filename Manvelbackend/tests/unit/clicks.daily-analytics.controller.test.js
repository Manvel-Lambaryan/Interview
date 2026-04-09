import test from "node:test";
import assert from "node:assert/strict";
import { getShortUrlDailyAnalyticsController } from "../../src/modules/clicks/clicks.controller.js";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { validateQuery } from "../../src/middleware/validateQuery.js";
import { clickAnalyticsQuerySchema } from "../../src/validation/clicks.schema.js";

function createJsonResponseRecorder() {
  return {
    statusCode: null,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test("daily analytics controller returns a JSON array with date/clicks rows", async () => {
  setPrisma({
    shortURL: {
      findUnique: async ({ where }) =>
        where.short_code === "abc123"
          ? { id: "url-1", short_code: "abc123" }
          : null,
    },
    $queryRaw: async () => [
      { date: new Date("2026-04-01T00:00:00.000Z"), clicks: 2 },
      { date: new Date("2026-04-02T00:00:00.000Z"), clicks: 5 },
    ],
  });

  try {
    const req = {
      params: { short_code: "abc123" },
      query: { from: "2026-04-01", to: "2026-04-02" },
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getShortUrlDailyAnalyticsController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(forwardedError, null);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [
      { date: "2026-04-01", clicks: 2 },
      { date: "2026-04-02", clicks: 5 },
    ]);
  } finally {
    resetPrisma();
  }
});

test("daily analytics controller forwards a 404 when the short code is missing", async () => {
  setPrisma({
    shortURL: {
      findUnique: async () => null,
    },
    $queryRaw: async () => [],
  });

  try {
    const req = {
      params: { short_code: "missing" },
      query: {},
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getShortUrlDailyAnalyticsController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(res.statusCode, null);
    assert.equal(forwardedError?.statusCode, 404);
    assert.equal(forwardedError?.code, "NOT_FOUND_URL");
    assert.equal(forwardedError?.message, "Short URL not found");
  } finally {
    resetPrisma();
  }
});

test("daily analytics query validation rejects reversed date ranges", () => {
  const middleware = validateQuery(clickAnalyticsQuerySchema);
  const req = {
    query: { from: "2026-04-10", to: "2026-04-09" },
  };
  const res = createJsonResponseRecorder();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    error: "Validation failed",
    details: {
      from: ["`from` must be earlier than or equal to `to`"],
    },
  });
});
