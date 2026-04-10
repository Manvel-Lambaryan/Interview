import { AsyncLocalStorage } from "node:async_hooks";

/** @typedef {{ requestId: string }} RequestContextStore */

const storage = new AsyncLocalStorage();

/**
 * @param {string} requestId
 * @param {() => void} next
 */
export function runWithRequestContext(requestId, next) {
  storage.run({ requestId }, next);
}

/**
 * @returns {RequestContextStore | undefined}
 */
export function getRequestContext() {
  return storage.getStore();
}
