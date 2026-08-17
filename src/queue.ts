const { Queue, Worker } = require("bullmq");
const redisConnection = require("./lib/redis");

export const workerQueue = new Queue("Worker Queue", {
  connection: redisConnection,
});
