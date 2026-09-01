import { Queue } from "bullmq";
import { redisConnection } from "./lib/redis";

export const workerQueue = new Queue("Worker Queue", {
  connection: redisConnection,
});
