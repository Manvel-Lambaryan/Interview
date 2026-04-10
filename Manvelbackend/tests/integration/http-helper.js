import { createServer } from "node:http";

export function startTestServer(app) {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port =
        typeof addr === "object" && addr !== null ? addr.port : 0;
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close() {
          return new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          });
        },
      });
    });
    server.on("error", reject);
  });
}


export async function httpRequest(baseUrl, pathname, options = {}) {
  const { parseJson = true, ...init } = options;
  const url = new URL(pathname, baseUrl);
  const res = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const text = await res.text();
  let body = text;
  if (parseJson && text) {
    try {
      body = JSON.parse(text);
    } catch {
    }
  } else if (!parseJson) {
    body = text;
  }
  return { status: res.status, headers: res.headers, body };
}
