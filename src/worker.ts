import "dotenv/config";
import { prisma } from "./lib/prisma";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetch() {
  console.log("Worker started...\nWaiting for jobs...");
  while (true) {
    const newNumberOfJobs = await prisma.job.count({
      where: { status: "PENDING" },
    });

    if (newNumberOfJobs > 0) {
      console.log(`Processing ${newNumberOfJobs} Jobs`);
      await worker();
    }
    await sleep(10000);
  }
}

export async function worker() {
  const jobStatus = await prisma.job.findMany({ where: { status: "PENDING" } });

  for (const job of jobStatus) {
    console.log(`Processing ${job.id}`);
    const jobType = job.type.trim().toUpperCase();

    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "PROCESSING" },
      });
      await sleep(2000);

      if (jobType === "EMAIL") {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        console.log(`[${job.id}] COMPLETED`);
      } else if (jobType === "REPORT") {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        console.log(`[${job.id}] COMPLETED`);
      } else if (jobType === "IMAGE") {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        console.log(`[${job.id}] COMPLETED`);
      } else if (jobType === "IMPORT_CSV") {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        console.log(`[${job.id}] COMPLETED`);
      } else if (jobType === "VIDEO_PROCESSING") {
        console.log(`[${job.id}] PROCESSING - ${jobType}`);
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "COMPLETED" },
        });
        console.log(`[${job.id}] COMPLETED`);
      } else {
      console.log(`[${job.id}] PROCESSING - ${jobType}`);
      console.log(`[${job.id}] FAILED - Unknown job type: ${jobType}`);
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED" },
      });
    }
    } catch (error) {
      console.log(`[${job.id}] FAILED`);
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED" },
      });
    }
  }
}

fetch();
