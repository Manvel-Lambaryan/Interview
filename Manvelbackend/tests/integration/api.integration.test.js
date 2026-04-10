import test from "node:test";
import assert from "node:assert/strict";

process.env.DATABASE_URL ??=
  "postgresql://test:test@127.0.0.1:5432/test_db_integration";
process.env.NODE_ENV ??= "test";
process.env.LOG_LEVEL ??= "silent";

const [{ createApp }, { resetPrisma, setPrisma }] = await Promise.all([
  import("../../src/app.js"),
  import("../../src/config/database.js"),
]);

import { httpRequest, startTestServer } from "./http-helper.js";

const SAMPLE_USER_ID = "550e8400-e29b-41d4-a716-446655440001";

test("GET unknown path returns 404 JSON", async () => {
  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(
      server.baseUrl,
      "/does-not-exist",
      { method: "GET" },
    );
    assert.equal(status, 404);
    assert.equal(body.error, "Not Found: GET /does-not-exist");
  } finally {
    await server.close();
  }
});

test("GET /health returns 200 when database ping succeeds", async () => {
  setPrisma({
    $queryRaw: async () => [{ "?column?": 1 }],
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(server.baseUrl, "/health", {
      method: "GET",
    });
    assert.equal(status, 200);
    assert.deepEqual(body, { status: "ok", database: "up" });
  } finally {
    await server.close();
    resetPrisma();
  }
});

test("GET /health returns 503 when database ping fails", async () => {
  setPrisma({
    $queryRaw: async () => {
      throw new Error("connection refused");
    },
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(server.baseUrl, "/health", {
      method: "GET",
    });
    assert.equal(status, 503);
    assert.deepEqual(body, { status: "unhealthy", database: "down" });
  } finally {
    await server.close();
    resetPrisma();
  }
});

test("POST /users with invalid body returns 400 validation", async () => {
  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(server.baseUrl, "/users", {
      method: "POST",
      body: JSON.stringify({}),
    });
    assert.equal(status, 400);
    assert.equal(body.error, "Validation failed");
    assert.ok(body.details);
  } finally {
    await server.close();
  }
});

test("POST /users returns 201 and user JSON when Prisma succeeds", async () => {
  setPrisma({
    user: {
      create: async ({ data }) => ({
        id: SAMPLE_USER_ID,
        name: data.name,
        email: data.email,
        created_at: new Date("2024-06-01T12:00:00.000Z"),
      }),
    },
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(server.baseUrl, "/users", {
      method: "POST",
      body: JSON.stringify({
        name: "Integration User",
        email: "integration@example.com",
      }),
    });
    assert.equal(status, 201);
    assert.equal(body.id, SAMPLE_USER_ID);
    assert.equal(body.name, "Integration User");
    assert.equal(body.email, "integration@example.com");
    assert.equal(body.created_at, "2024-06-01T12:00:00.000Z");
  } finally {
    await server.close();
    resetPrisma();
  }
});

test("GET /users/:id/analytics returns 400 for invalid UUID param", async () => {
  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(
      server.baseUrl,
      "/users/not-a-uuid/analytics",
      { method: "GET" },
    );
    assert.equal(status, 400);
    assert.equal(body.error, "Validation failed");
  } finally {
    await server.close();
  }
});

test("GET /users/:id/analytics returns total_clicks when user exists", async () => {
  setPrisma({
    user: {
      findUnique: async ({ where }) =>
        where.id === SAMPLE_USER_ID
          ? { id: SAMPLE_USER_ID }
          : null,
    },
    click: {
      count: async () => 42,
    },
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(
      server.baseUrl,
      `/users/${SAMPLE_USER_ID}/analytics`,
      { method: "GET" },
    );
    assert.equal(status, 200);
    assert.deepEqual(body, { total_clicks: 42 });
  } finally {
    await server.close();
    resetPrisma();
  }
});

test("register user, create short URL, redirect records a click (stateful mock)", async () => {
  const clickCreates = [];
  let storedShortUrl = null;

  setPrisma({
    user: {
      create: async ({ data }) => ({
        id: SAMPLE_USER_ID,
        name: data.name,
        email: data.email,
        created_at: new Date("2024-06-01T12:00:00.000Z"),
      }),
      findUnique: async ({ where }) =>
        where.id === SAMPLE_USER_ID
          ? {
              id: SAMPLE_USER_ID,
              name: "U",
              email: "u@example.com",
              created_at: new Date(),
            }
          : null,
    },
    shortURL: {
      create: async ({ data }) => {
        storedShortUrl = {
          id: "770e8400-e29b-41d4-a716-446655440099",
          user_id: data.user_id,
          short_code: data.short_code,
          original_url: data.original_url,
          expires_at: data.expires_at,
          created_at: new Date("2024-06-01T12:00:00.000Z"),
        };
        return storedShortUrl;
      },
      findUnique: async ({ where }) => {
        if (!storedShortUrl) return null;
        if (
          "short_code" in where &&
          where.short_code === storedShortUrl.short_code
        ) {
          return storedShortUrl;
        }
        return null;
      },
      findMany: async () => [],
      deleteMany: async () => ({ count: 0 }),
    },
    click: {
      create: async ({ data }) => {
        clickCreates.push(data);
        return { id: "click-id", ...data };
      },
      count: async () => 0,
    },
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const reg = await httpRequest(server.baseUrl, "/users", {
      method: "POST",
      body: JSON.stringify({
        name: "Flow User",
        email: "flow@example.com",
      }),
    });
    assert.equal(reg.status, 201);

    const created = await httpRequest(server.baseUrl, "/urls", {
      method: "POST",
      body: JSON.stringify({
        user_id: SAMPLE_USER_ID,
        original_url: "https://example.com/landing",
      }),
    });
    assert.equal(created.status, 201);
    const shortCode = created.body.short_code;
    assert.equal(typeof shortCode, "string");
    assert.equal(shortCode.length, 6);

    const url = new URL(`/urls/${shortCode}`, server.baseUrl);
    const redirectRes = await fetch(url, {
      method: "GET",
      redirect: "manual",
    });
    assert.equal(redirectRes.status, 302);
    assert.equal(
      redirectRes.headers.get("location"),
      "https://example.com/landing",
    );

    assert.equal(clickCreates.length, 1);
    assert.equal(clickCreates[0].short_url_id, storedShortUrl.id);
    assert.ok(typeof clickCreates[0].ip_address === "string");
  } finally {
    await server.close();
    resetPrisma();
  }
});

test("POST /urls/:short_code/click returns 201", async () => {
  setPrisma({
    shortURL: {
      findUnique: async () => ({
        id: "770e8400-e29b-41d4-a716-446655440099",
        short_code: "Ab12xY",
        original_url: "https://example.com",
        user_id: SAMPLE_USER_ID,
        expires_at: null,
        created_at: new Date(),
      }),
    },
    click: {
      create: async () => ({ id: "c1" }),
    },
  });

  const app = createApp();
  const server = await startTestServer(app);
  try {
    const { status, body } = await httpRequest(
      server.baseUrl,
      "/urls/Ab12xY/click",
      {
        method: "POST",
        body: JSON.stringify({ country: "AM", device: "desktop" }),
      },
    );
    assert.equal(status, 201);
    assert.deepEqual(body, { message: "Click recorded" });
  } finally {
    await server.close();
    resetPrisma();
  }
});
