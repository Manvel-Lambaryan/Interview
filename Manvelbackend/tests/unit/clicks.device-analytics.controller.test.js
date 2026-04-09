import test from "node:test";
import assert from "node:assert/strict";
import { getShortUrlDeviceAnalyticsController } from "../../src/modules/clicks/clicks.controller.js";
import { resetPrisma, setPrisma } from "../../src/config/database.js";

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

test("device analytics controller returns grouped device counts", async () => {
  setPrisma({
    shortURL: {
      findUnique: async ({ where }) =>
        where.short_code === "abc123"
          ? { id: "url-1", short_code: "abc123" }
          : null,
    },
    click: {
      groupBy: async () => [
        { device: "desktop", _count: { _all: 4 } },
        { device: "mobile", _count: { _all: 7 } },
        { device: null, _count: { _all: 2 } },
      ],
    },
  });

  try {
    const req = {
      params: { short_code: "abc123" },
      query: { from: "2026-04-01T12:00:00.000Z", to: "2026-04-01" },
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getShortUrlDeviceAnalyticsController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(forwardedError, null);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [
      { device: "desktop", clicks: 4 },
      { device: "mobile", clicks: 7 },
      { device: "unknown", clicks: 2 },
    ]);
  } finally {
    resetPrisma();
  }
});

test("device analytics controller forwards a 404 when the short code is missing", async () => {
  setPrisma({
    shortURL: {
      findUnique: async () => null,
    },
    click: {
      groupBy: async () => [],
    },
  });

  try {
    const req = {
      params: { short_code: "missing" },
      query: {},
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getShortUrlDeviceAnalyticsController(req, res, (error) => {
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
