import { AsyncLocalStorage } from "node:async_hooks";


const storage = new AsyncLocalStorage();


export function runWithRequestContext(requestId, next) {
  storage.run({ requestId }, next);
}

export function getRequestContext() {
  return storage.getStore();
}
