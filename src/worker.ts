import "dotenv/config";
import { prisma } from "./lib/prisma";
import pLimit from "p-limit";
import { workerQueue } from "./queue";
import { Queue, UnrecoverableError, Worker } from "bullmq";
import { redisConnection } from "./lib/redis";
import { Redis } from "ioredis";
import type { UUID } from "node:crypto";

const jobQueue = new Queue("WorkerQueue");

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Add a job to the queue

export async function worker() {
  const types = ["EMAIL", "REPORT", "IMAGE", "IMPORT_CSV", "VIDEO_PROCESSING"];
  new Worker(
    "Worker Queue",
    async (job) => {
      if (types.includes(job.data.type)) {
        await pushUpdate(job.data.id, "COMPLETED", job.attemptsMade);
      } else {
        pushUpdate(job.data.id, "FAILED (UNKNOWN_TYPE)", job.attemptsMade);
        throw new UnrecoverableError("UNKNOWN_TYPE");
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
    },
  );
}

async function pushUpdate(id: UUID, status: string, attempts: number) {
  await prisma.job.update({
    where: { id: id },
    data: { status: status, attempts: attempts },
  });
}

async function queueCleanUp() {
  await workerQueue.clean(0, 0, "completed");
  console.log("All completed jobs removed!");
}

worker();
queueCleanUp();
