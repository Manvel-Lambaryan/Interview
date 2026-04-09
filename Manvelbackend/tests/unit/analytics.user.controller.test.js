import test from "node:test";
import assert from "node:assert/strict";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { getUserAnalyticsController } from "../../src/modules/analytics/analytics.controller.js";

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

test("user analytics controller returns total clicks for an existing user", async () => {
  setPrisma({
    user: {
      findUnique: async ({ where }) =>
        where.id === "user-1" ? { id: "user-1" } : null,
    },
    click: {
      count: async ({ where }) => {
        assert.deepEqual(where, {
          short_url: {
            user_id: "user-1",
          },
        });
        return 11;
      },
    },
  });

  try {
    const req = {
      params: { id: "user-1" },
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getUserAnalyticsController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(forwardedError, null);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { total_clicks: 11 });
  } finally {
    resetPrisma();
  }
});

test("user analytics controller forwards a 404 when the user is missing", async () => {
  setPrisma({
    user: {
      findUnique: async () => null,
    },
    click: {
      count: async () => 0,
    },
  });

  try {
    const req = {
      params: { id: "missing-user" },
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await getUserAnalyticsController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(res.statusCode, null);
    assert.equal(forwardedError?.statusCode, 404);
    assert.equal(forwardedError?.code, "NOT_FOUND_USER");
    assert.equal(forwardedError?.message, "User not found");
  } finally {
    resetPrisma();
  }
});
