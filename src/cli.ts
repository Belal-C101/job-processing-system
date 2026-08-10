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
  const job = ["1. Create Job", "2. List Jobs", "3. Edit Job", "4. Exit"];
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
        type: jobType,
        status: "PENDING",
        createdAt: new Date(),
      };
      jobList.push(newJob);
      console.log("\n=== Added Job ===");
      console.log(
        "ID: " + newJob.id,
        "\nType: " + newJob.type,
        "\nStatus: " + newJob.status,
        "\nCreated At: " + newJob.createdAt,
      );
    } else if (trimmedInput === "2") {
      if (jobList.length === 0) {
        console.log("No jobs at the moment");
      }
      const listBy = [
        "1. List All Jobs",
        "2. List Jobs By Status",
        "3. List Jobs By Type",
        "4. List Job By ID",
      ];
      const listMenu = (): void => {
        for (let i = 0; i < job.length; i++) {
          console.log(listBy[i]);
        }
      };
      listMenu();
      const choice = await rl.question("Enter a Number: ");
      const trimmedChoice = choice.trim();
      if (trimmedChoice === "1") {
        console.log("\n=== ALl Jobs ===");
        jobList.forEach((job) => {
          console.log(
            "ID: " + job.id,
            "\nType: " + job.type,
            "\nStatus: " + job.status,
            "\nCreated At: " + job.createdAt,
            "\n\n----------------\n\n",
          );
        });
      } else if (trimmedChoice === "2") {
        const jobStatus = [...new Set(jobList.map((job) => job.status))];
        console.log("Choose From: ", jobStatus);
        const statusInput = (
          await rl.question("Write the Status: ")
        ).toUpperCase();
        if (statusInput === "PENDING" || statusInput === "COMPLETED") {
          const filteredJobs = jobList.filter(
            (job) => job.status === statusInput,
          );
          if (filteredJobs.length === 0) {
            console.log("No jobs at the moment");
          } else {
            console.log("\n=== Jobs ===");
            filteredJobs.forEach((job) => {
              console.log(
                "ID: " + job.id,
                "\nType: " + job.type,
                "\nStatus: " + job.status,
                "\nCreated At: " + job.createdAt,
                "\n\n----------------\n\n",
              );
            });
          }
        } else {
          console.log("Invalid status, Choose from:", "\n", [
            ...new Set(jobList.map((s) => s.status)),
          ]);
        }
      } else if (trimmedChoice === "3") {
        const type = [...new Set(jobList.map((s) => s.type))];
        if (jobList.length === 0) {
          console.log("No jobs at the moment");
        }
        console.log("Choose From: ", type);
        const tInput = await rl.question("Write the Job Type: ");
        if (type.includes(tInput)) {
          const filteredJobs = jobList.filter((job) => job.type === tInput);

          console.log("\n=== Jobs ===");
          filteredJobs.forEach((job) => {
            console.log(
              "ID: " + job.id,
              "\nType: " + job.type,
              "\nStatus: " + job.status,
              "\nCreated At: " + job.createdAt,
              "\n\n----------------\n\n",
            );
          });
        } else {
          console.log("Invalid Type, Choose from:", "\n", [
            ...new Set(jobList.map((s) => s.type)),
          ]);
        }
      } else if (trimmedChoice === "4") {
        if (jobList.length === 0) {
          console.log("No jobs at the moment");
        }
        const id = [...new Set(jobList.map((s) => s.id))];
        const idInput = await rl.question("Paste the Job id: ");
        if (id.includes(idInput)) {
          const filteredJobs = jobList.filter((job) => job.id === idInput);

          console.log("\n=== Jobs ===");
          filteredJobs.forEach((job) => {
            console.log(
              "ID: " + job.id,
              "\nType: " + job.type,
              "\nStatus: " + job.status,
              "\nCreated At: " + job.createdAt,
              "\n\n----------------\n\n",
            );
          });
        }
      }
    } else if (trimmedInput === "3") {
      console.log(`Choosed: ${job[2]}`, "\n", "Comming Soon");
    } else if (trimmedInput === "4") {
      console.log(`Choosed: ${job[3]}`, "\n", "GoodBye!");
      break;
    } else {
      console.log("Invalid option, Please Choose From Provided List");
    }
  }

  rl.close();
}

jopSystem();
