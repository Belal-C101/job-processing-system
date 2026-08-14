import "dotenv/config";

const port = Number(process.env.PORT ?? "3000");

export const env = {
  PORT: Number.isInteger(port) && port > 0 ? port : 3000,
  DATABASE_URL: process.env.DATABASE_URL ?? "",
};
