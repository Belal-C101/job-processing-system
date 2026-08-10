export type Job = {
  id: string;
  name: string;
  status: "PENDING" | "COMPLETED";
  createdAt: Date;
};
