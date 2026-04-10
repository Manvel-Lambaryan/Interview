import test from "node:test";
import assert from "node:assert/strict";
import { resetPrisma, setPrisma } from "../../src/config/database.js";
import { findManyByTagName } from "../../src/modules/urls/urls.repository.js";

test("findManyByTagName queries short URLs through the tag relation in one DB call", async () => {
  let capturedArgs;

  setPrisma({
    shortURL: {
      findMany: async (args) => {
        capturedArgs = args;
        return [];
      },
    },
  });

  try {
    await findManyByTagName("news");

    assert.deepEqual(capturedArgs, {
      where: {
        short_url_tags: {
          some: {
            tag: { name: "news" },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  } finally {
    resetPrisma();
  }
});
