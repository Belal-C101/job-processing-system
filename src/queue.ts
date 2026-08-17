const { Queue, Worker } = require("bullmq");
const redisConnection = require("./redis-connection");

export const workerQueue = new Queue("Worker Queue", {
  connection: redisConnection,
});
