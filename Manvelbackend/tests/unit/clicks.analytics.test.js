import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDateRange,
  isValidAnalyticsDateInput,
  parseAnalyticsBound,
} from "../../src/modules/clicks/clicks.analytics.js";
import { clickAnalyticsQuerySchema } from "../../src/validation/clicks.schema.js";

test("parseAnalyticsBound expands a plain `from` date to the start of the day", () => {
  const parsed = parseAnalyticsBound("2026-04-09", "from");
  assert.equal(parsed?.toISOString(), "2026-04-09T00:00:00.000Z");
});

test("parseAnalyticsBound expands a plain `to` date to the end of the day", () => {
  const parsed = parseAnalyticsBound("2026-04-09", "to");
  assert.equal(parsed?.toISOString(), "2026-04-09T23:59:59.999Z");
});

test("buildDateRange keeps ISO datetime values exact", () => {
  const range = buildDateRange({
    from: "2026-04-09T10:15:00.000Z",
    to: "2026-04-10T12:30:00.000Z",
  });

  assert.equal(range.from?.toISOString(), "2026-04-09T10:15:00.000Z");
  assert.equal(range.to?.toISOString(), "2026-04-10T12:30:00.000Z");
});

test("query schema accepts README-style date filters", () => {
  const parsed = clickAnalyticsQuerySchema.parse({
    from: "2026-04-01",
    to: "2026-04-09",
  });

  assert.deepEqual(parsed, {
    from: "2026-04-01",
    to: "2026-04-09",
  });
});

test("query schema rejects invalid date input", () => {
  assert.equal(isValidAnalyticsDateInput("not-a-date"), false);
  assert.throws(() =>
    clickAnalyticsQuerySchema.parse({
      from: "not-a-date",
    }),
  );
});

test("query schema still rejects reversed ranges", () => {
  assert.throws(() =>
    clickAnalyticsQuerySchema.parse({
      from: "2026-04-10",
      to: "2026-04-09",
    }),
  );
});

test("query schema accepts mixed ISO and date-only values using inclusive bounds", () => {
  const parsed = clickAnalyticsQuerySchema.parse({
    from: "2026-04-09T12:00:00.000Z",
    to: "2026-04-09",
  });

  assert.deepEqual(parsed, {
    from: "2026-04-09T12:00:00.000Z",
    to: "2026-04-09",
  });
});
