import "dotenv/config";
import { prisma } from "./lib/prisma";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetch() {
  while (true) {
    const newNumberOfJobs = await prisma.job.count({
      where: { status: "PENDING" },
    });

    if (newNumberOfJobs > 0) {
      console.log(`Processing ${newNumberOfJobs} Jobs`);
      await worker();
    }
    console.log("All Jobs Processed");
    await sleep(10000);
  }
}

export async function worker() {
  const jobStatus = await prisma.job.findMany({ where: { status: "PENDING" } });

  for (const job of jobStatus) {
    console.log(`Processing ${job.id}`);
    const jobType = job.type.trim().toUpperCase();

    await prisma.job.update({
      where: { id: job.id },
      data: { status: "PROCESSING" },
    });
    await sleep(2000);
    
    if (jobType === "EMAIL") {
      console.log(`Email Sended`);
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } else if (jobType === "REPORT") {
      console.log("Report Generated");
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } else if (jobType === "IMAGE") {
      console.log("Report Generated");
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } else if (jobType === "IMPORT_CSV") {
      console.log("Report Generated");
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } else if (jobType === "VIDEO_PROCESSING") {
      console.log("Report Generated");
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } else {
      console.log(`Wrong Job Type for Job ID: ${job.id}`);
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "WRONG JOB TYPE" },
      });
      console.log(`Status Changed to: ${job.status}`);
    }
  }
}

fetch();
