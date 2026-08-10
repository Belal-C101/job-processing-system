export type Job = {
  id: string;
  type: string;
  status: "PENDING" | "COMPLETED";
  createdAt: Date;
};
