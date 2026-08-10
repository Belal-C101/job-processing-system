// === Job Processing System ===
// 1. Create Job
// 2. List Jobs
// 3. Exit

import * as readline from "node:readline/promises";
import type { Job } from "./types/job.types";

async function jopSystem() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=== Job Processing System ===");

  // Options
  const job = ["1. Create Job", "2. List Jobs", "3. Exit"];
  const jobList: Job[] = [];

  const menu = (): void => {
    for (let i = 0; i < job.length; i++) {
      console.log(job[i]);
    }
  };

  while (true) {
    menu();

    const input = await rl.question("Enter a number: ");
    const trimmedInput = input.trim();

    if (!/^\d+$/.test(trimmedInput)) {
      continue;
    }

    if (trimmedInput === "1") {
      const jobType = await rl.question("Enter Job Type: ");
      const newJob: Job = {
        id: crypto.randomUUID(),
        name: jobType,
        status: "PENDING",
        createdAt: new Date(),
      };
      jobList.push(newJob);
      console.log(newJob);
    } else if (trimmedInput === "2") {
      const jobStatus = [...new Set(jobList.map((job) => job.status))];
      console.log("Choose From: ", jobStatus);
      const statusInput = (
        await rl.question("Write the Status: ")
      ).toUpperCase();
      if (statusInput === "PENDING" || statusInput === "COMPLETED") {
        console.log(jobList.filter((job) => job.status === statusInput));
      } else {
        console.log("Invalid status, Choose from:", "\n", [
          ...new Set(jobList.map((s) => s.status)),
        ]);
      }
    } else if (trimmedInput === "3") {
      console.log(`Choosed: ${job[2]}`, "\n", "GoodBye!");
      break;
    } else {
      console.log("Invalid option, Please Choose From Provided List");
    }
  }

  rl.close();
}

jopSystem();
