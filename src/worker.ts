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
};

async function pushUpdate(id: UUID, status: string) {
  const update = await prisma.job.update({ where: { id: id }, data: {status: status} })
}

async function fetchh() {
  console.log("Worker started...\nWaiting for jobs...");
  while (true) {
    const newNumberOfJobs = await prisma.job.count({
      where: { status: "PENDING" },
    });

    if (newNumberOfJobs > 0) {
      console.log(`Processing ${newNumberOfJobs} Jobs`);
      await worker();
      console.log("Worker started...\nWaiting for jobs...");
    }
    await sleep(10000);
  }
}

export async function fetchData(job: any) {
  const status = ["COMPLETED", "FAILED", "PENDING"] as const;
  const types = ["EMAIL", "REPORT", "IMAGE", "IMPORT_CSV", "VIDEO_PROCESSING"];
  let attempts = job.attempts;
  while (attempts < 3) {
    try {
      attempts += 1;
      await prisma.job.update({
        where: { id: job.id },
        data: { attempts: attempts },
      });
      console.log(`Processing ${job.id}`);
      const jobType = job.type.trim().toUpperCase();
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "PROCESSING" },
      });
      await sleep(5000);

      if (types.includes(jobType)) {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: status[0] },
        });
        console.log(`[${job.id}] COMPLETED \n -----------`);
        await sleep(5000);
        break;
      } else {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        console.log(
          `[${job.id}] FAILED - Unknown job type: ${jobType}  \n -----------`,
        );
        await prisma.job.update({
          where: { id: job.id },
          data: { status: status[1] },
        });
        await sleep(5000);
        break;
      }
    } catch (error) {
      if (attempts < 3) {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: status[2] },
        });

        console.log(`[${job.id}] Retrying... Attempt ${attempts + 1}`);
      } else {
        try {
          console.error(`Maximum attempts reached`);
          await prisma.job.update({
            where: { id: job.id },
            data: { status: status[1] },
          });
        } catch (e) {
          console.error(`Failed Setting job [${job.id}] to: ${status[1]}`, e);
        }
      }
    }
  }
}

addJob();
