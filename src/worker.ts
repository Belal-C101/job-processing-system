import "dotenv/config";
import { prisma } from "./lib/prisma";
import pLimit from "p-limit";
import { workerQueue } from "./queue";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import type { UUID } from "node:crypto";

const jobQueue = new Queue("WorkerQueue");

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Add a job to the queue
async function addJob() {
  const pendingJobs = await prisma.job.findMany({
    where: { status: "PENDING" },
  });
  if (pendingJobs.length > 0) {
    await workerQueue.addBulk(
      pendingJobs.map((job) => ({
        name: "Queued Job",
        data: job,
        concurrency: 3,
        opts: {
          attempts: 3,
          backoff: {
            type: "fixed",
            delay: 2000,
          },
        },
      })),
    );
    console.log("Jobs added to queue");
  }
  worker();
}

export async function worker() {
  let start = 0;
  const pageSize = 50;
  let hasMore = true;

  while (hasMore) {
    const jobs = await workerQueue.getJobs(
      ["waiting"],
      start,
      start + pageSize - 1,
      true,
    );
    if (jobs.length === 0) {
      hasMore = false;
      break;
    }
    for (const job of jobs) {
      console.log(`Job ID: ${job.id}, Data:`, job.data);
      await job.updateData({
        ...job.data,
        status: "PROCESSING",
      });
      pushUpdate(job.data.id, job.data.status);
    }
    start += pageSize;
  }
}

async function pushUpdate(id: UUID, status: string) {
  let attempts = 0;

      const updateattempts = await prisma.job.update({
        where: { id: id },
        data: { attempts: attempts },
      });
      const update = await prisma.job.update({
        where: { id: id },
        data: { status: status },
      });
  queueCleanUp();
}

async function queueCleanUp() {
  await workerQueue.clean(0, 0, "completed");
  console.log("All completed jobs removed!");
}

addJob();
