// === Job Processing System ===
// 1. Create Job
// 2. List Jobs
// 3. Exit

import * as readline from "node:readline/promises";

async function jopSystem() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("=== Job Processing System ===");

  // Options
  const jps = ["1. Create Job", "2. List Jobs", "3. Exit"];

  const menu = (): void => {
    for (let i = 0; i < jps.length; i++) {
      console.log(jps[i]);
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
      console.log(`Choosed: ${jps[0]}`);
    } else if (trimmedInput === "2") {
      console.log(`Choosed: ${jps[1]}`);
    } else if (trimmedInput === "3") {
      console.log(`Choosed: ${jps[2]}`, "\n", "GoodBye!");
      break;
    } else {
      console.log("Invalid option, Please Choose From Provided List");
    }
  }

  rl.close();
}

jopSystem();