const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Accepts either an ISO datetime string or a plain README-style date (`YYYY-MM-DD`).
 *
 * @param {string | undefined} value
 * @param {"from" | "to"} bound
 * @returns {Date | undefined}
 */
export function parseAnalyticsBound(value, bound) {
  if (!value) {
    return undefined;
  }

  if (ISO_DATE_ONLY_PATTERN.test(value)) {
    const suffix =
      bound === "from" ? "T00:00:00.000Z" : "T23:59:59.999Z";
    return new Date(`${value}${suffix}`);
  }

  return new Date(value);
}

/**
 * @param {{ from?: string; to?: string }} query
 */
export function buildDateRange(query = {}) {
  return {
    from: parseAnalyticsBound(query.from, "from"),
    to: parseAnalyticsBound(query.to, "to"),
  };
}

export function isValidAnalyticsDateInput(value) {
  if (typeof value !== "string") {
    return false;
  }

  const parsed = parseAnalyticsBound(value, "from");
  return !Number.isNaN(parsed.getTime());
}
