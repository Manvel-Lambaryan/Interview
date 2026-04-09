import test from "node:test";
import assert from "node:assert/strict";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { findTopShortUrls } from "../../src/modules/analytics/analytics.repository.js";

test("findTopShortUrls builds a DB-level top-N aggregation query", async () => {
  /** @type {import("@prisma/client").Prisma.Sql | undefined} */
  let capturedQuery;

  setPrisma({
    $queryRaw: async (query) => {
      capturedQuery = query;
      return [];
    },
  });

  try {
    await findTopShortUrls(5);

    assert.ok(capturedQuery);
    const sql = capturedQuery.strings.join("?");

    assert.match(sql, /FROM clicks c/i);
    assert.match(sql, /INNER JOIN short_urls su/i);
    assert.match(sql, /GROUP BY su\.id, su\.short_code/i);
    assert.match(sql, /ORDER BY COUNT\(\*\) DESC, su\.short_code ASC/i);
    assert.match(sql, /LIMIT \?/i);
    assert.deepEqual(capturedQuery.values, [5]);
  } finally {
    resetPrisma();
  }
});
