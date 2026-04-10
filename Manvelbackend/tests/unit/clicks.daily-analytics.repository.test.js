import test from "node:test";
import assert from "node:assert/strict";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { countDailyClicksByShortUrlId } from "../../src/modules/analytics/analytics.repository.js";

test("countDailyClicksByShortUrlId builds a grouped ascending SQL query", async () => {
  let capturedQuery;

  setPrisma({
    $queryRaw: async (query) => {
      capturedQuery = query;
      return [];
    },
  });

  try {
    await countDailyClicksByShortUrlId("url-1", {
      from: new Date("2026-04-01T00:00:00.000Z"),
      to: new Date("2026-04-09T23:59:59.999Z"),
    });

    assert.ok(capturedQuery);
    const sql = capturedQuery.strings.join("?");

    assert.match(sql, /SELECT\s+DATE\(c\.clicked_at\) AS date/i);
    assert.match(sql, /GROUP BY DATE\(c\.clicked_at\)/i);
    assert.match(sql, /ORDER BY DATE\(c\.clicked_at\) ASC/i);
    assert.deepEqual(capturedQuery.values, [
      "url-1",
      new Date("2026-04-01T00:00:00.000Z"),
      new Date("2026-04-09T23:59:59.999Z"),
    ]);
  } finally {
    resetPrisma();
  }
});
