// === Job Processing System ===
// 1. Create Job
// 2. List Jobs
// 3. Exit

import * as readline from "node:readline/promises";

async function jopSystems() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=== Job Processing System ===");

  // Options
  const jps = ["1. Create Job", "2. List Jobs", "3. Exit"];

  for (let i = 0; i < jps.length; i++) {
    console.log(jps[i]);
  }

  const input = await rl.question("Enter a number: ");
  // Convert the text into the actual mathematical number
  const userNumber: number = parseInt(input, 10);

  // Check if the user typed letters instead of a number
  if (!isNaN(userNumber)) {
    if (input === "1") {
      console.log(`Choosed: ${jps[0]}`);
    } else if (input === "2") {
      console.log(`Choosed: ${jps[1]}`);
    } else if (input === "3") {
      console.log(`Choosed: ${jps[2]}`);
    } else {
      console.log("Invalid option");
    }
  }

  // Hang up the intercom so your program can finish and exit
  rl.close();
}

jopSystems();