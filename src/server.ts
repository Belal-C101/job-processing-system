import "dotenv/config";

import { env } from "./config/env";
import { assertDatabaseConnection, disconnectDatabase } from "./lib/prisma.js";

async function createSimpleApp() {
  const http = await import("node:http");
  return http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ ok: true, message: "Job processing system is running" }),
    );
  });
}

async function start(): Promise<void> {
  await assertDatabaseConnection();

  const app = await createSimpleApp();
  const server = app.listen(env.PORT, () => {
    console.log(`Job processing API started on port ${env.PORT}`);
  });

  let shuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`Graceful shutdown started for ${signal}`);

    const timeout = setTimeout(() => {
      console.error("Graceful shutdown timed out");
      process.exit(1);
    }, 10_000).unref();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    clearTimeout(timeout);

    await disconnectDatabase();

    console.log("Graceful shutdown complete");
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

start().catch((error: unknown) => {
  console.error("Failed to start Job processing API", error);
  process.exit(1);
});
