import test from "node:test";
import assert from "node:assert/strict";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { listShortUrlsByTagController } from "../../src/modules/urls/urls.controller.js";
import { validateQuery } from "../../src/middleware/validateQuery.js";
import { listUrlsByTagQuerySchema } from "../../src/validation/urls.schema.js";

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

test("GET /urls?tag returns mapped short URL rows for the given tag", async () => {
  setPrisma({
    shortURL: {
      findMany: async (args) => {
        assert.deepEqual(args, {
          where: {
            short_url_tags: {
              some: {
                tag: { name: "news" },
              },
            },
          },
          orderBy: { created_at: "desc" },
        });

        return [
          {
            id: "url-1",
            user_id: "user-1",
            short_code: "abc123",
            original_url: "https://example.com/story",
            created_at: new Date("2026-04-10T08:00:00.000Z"),
            expires_at: null,
          },
        ];
      },
    },
  });

  try {
    const req = {
      query: { tag: "news" },
    };
    const res = createJsonResponseRecorder();
    let forwardedError = null;

    await listShortUrlsByTagController(req, res, (error) => {
      forwardedError = error;
    });

    assert.equal(forwardedError, null);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [
      {
        id: "url-1",
        user_id: "user-1",
        short_code: "abc123",
        original_url: "https://example.com/story",
        created_at: "2026-04-10T08:00:00.000Z",
        expires_at: null,
      },
    ]);
  } finally {
    resetPrisma();
  }
});

test("GET /urls?tag query validation rejects a missing tag value", () => {
  const middleware = validateQuery(listUrlsByTagQuerySchema);
  const req = {
    query: {},
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
      tag: ["Required"],
    },
  });
});
