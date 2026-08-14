// === Job Processing System ===
// 1. Create Job
// 2. List Jobs
// 3. Exit
import "dotenv/config";
import { prisma } from "./lib/prisma";
import * as readline from "node:readline/promises";

export async function jobSystem() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=== Job Processing System ===");

  // Options
  const job = ["1. Create Job", "2. List Jobs", "3. Edit Job", "4. Exit"];

  const menu = (): void => {
    for (let i = 0; i < job.length; i++) {
      console.log(job[i]);
    }
  };

  while (true) {
    menu();

    const input = await rl.question("Enter a number: ");
    const trimmedInput = input.trim();
    const hasRecords = await prisma.job.findFirst({
      select: { id: true },
    });

    if (!/^\d+$/.test(trimmedInput)) {
      continue;
    }

    if (trimmedInput === "1") {
      const jobType = await rl.question("Enter Job Type: ");
      const newJob = await prisma.job.create({
        data: {
          type: jobType,
        },
      });
    } else if (trimmedInput === "2") {
      const allJobs = await prisma.job.findMany({
        select: { id: true, type: true, status: true, createdAt: true },
      });
      if (!hasRecords) {
        console.log("No jobs Yet the moment");
        continue;
      }
      const listBy = [
        "1. List All Jobs",
        "2. List Jobs By Status",
        "3. List Jobs By Type",
        "4. List Job By ID",
      ];
      const listMenu = (): void => {
        for (let i = 0; i < listBy.length; i++) {
          console.log(listBy[i]);
        }
      };
      listMenu();
      const choice = await rl.question("Enter a Number: ");
      const trimmedChoice = choice.trim();
      if (trimmedChoice === "1") {
        console.log("\n=== ALl Jobs ===");
        allJobs.forEach((job) => {
          console.log(
            "ID: " + job.id,
            "\nType: " + job.type,
            "\nStatus: " + job.status,
            "\nCreated At: " + job.createdAt,
            "\n\n----------------\n\n",
          );
        });
      } else if (trimmedChoice === "2") {
        const Status = [...new Set(allJobs.map((job) => job.status))];
        console.log("Choose From: ", Status);
        const jobStatus = await rl.question("Enter Job Status: ");
        const job = await prisma.job.findMany({
          where: { status: jobStatus },
        });

        console.log("\n=== Job ===");

        job.forEach((job) => {
          console.log(
            "ID: " + job.id,
            "\nType: " + job.type,
            "\nStatus: " + job.status,
            "\nCreated At: " + job.createdAt,
            "\n\n----------------\n\n",
          );
        });
      } else if (trimmedChoice === "3") {
        const type = [...new Set(allJobs.map((t) => t.type))];
        console.log("Choose From: ", type);
        const jobType = await rl.question("Enter Job Type: ");
        const job = await prisma.job.findMany({
          where: { type: jobType },
        });

        console.log("\n=== Job ===");

        job.forEach((job) => {
          console.log(
            "ID: " + job.id,
            "\nType: " + job.type,
            "\nStatus: " + job.status,
            "\nCreated At: " + job.createdAt,
            "\n\n----------------\n\n",
          );
        });
      } else if (trimmedChoice === "4") {
        const jobId = await rl.question("Enter Job ID: ");
        const job = await prisma.job.findUnique({
          where: { id: jobId.trim() },
        });

        console.log("\n=== Job ===");

        console.log(
          "ID: " + job?.id,
          "\nType: " + job?.type,
          "\nStatus: " + job?.status,
          "\nCreated At: " + job?.createdAt,
          "\n\n----------------\n\n",
        );
      }
    } else if (trimmedInput === "3") {
      if (!hasRecords) {
        console.log("No jobs Yet the moment");
        continue;
      }
      const jobId = await rl.question("Enter Job ID: ");

      const updatetBy = ["1. Update Job Type", "2. Update Job Status"];
      const updateMenu = (): void => {
        for (let i = 0; i < updatetBy.length; i++) {
          console.log(updatetBy[i]);
        }
      };
      updateMenu();
      const updateInput = (await rl.question("Enter a Number: ")).trim();
      if (updateInput === "1") {
        const newType = await rl.question("Enter New Type: ");
        const updateType = await prisma.job.update({
          where: { id: jobId.trim() },
          data: { type: newType },
        });
        console.log("\n=== Job ===");
        console.log(
          "ID: " + updateType.id,
          "\nType: " + updateType.type,
          "\nStatus: " + updateType.status,
          "\nCreated At: " + updateType.createdAt,
          "\n\n----------------\n\n",
        );
      } else if (updateInput === "2") {
        const newStatus = await rl.question("Enter New Status: ");
        const updateStatus = await prisma.job.update({
          where: { id: jobId.trim() },
          data: { status: newStatus },
        });
        console.log("\n=== Job ===");
        console.log(
          "ID: " + updateStatus.id,
          "\nType: " + updateStatus.type,
          "\nStatus: " + updateStatus.status,
          "\nCreated At: " + updateStatus.createdAt,
          "\n\n----------------\n\n",
        );
      }
    } else if (trimmedInput === "4") {
      console.log(`Choosed: ${job[3]}`, "\n", "GoodBye!");
      break;
    } else {
      console.log("Invalid option, Please Choose From Provided List");
    }
  }

  rl.close();
}

jobSystem();
