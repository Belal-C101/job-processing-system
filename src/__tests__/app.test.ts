import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";

const mockPrisma = {
  job: {
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("../lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("../config/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  },
}));

const mockRl = {
  question: vi.fn(),
  close: vi.fn(),
};

const mockCreateInterface = vi.fn(() => mockRl);

vi.mock("node:readline/promises", () => ({
  createInterface: mockCreateInterface,
}));

const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("Worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("worker finds no pending jobs and resolves immediately", async () => {
    mockPrisma.job.findMany.mockResolvedValue([]);

    const { worker } = await import("../worker");
    const result = worker();

    await vi.advanceTimersByTimeAsync(0);

    expect(mockPrisma.job.findMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
    });

    await result;
  });

  it("fetchData marks known job types as COMPLETED", async () => {
    const job = {
      id: "job-1",
      type: "EMAIL",
      status: "PENDING",
      attempts: 0,
      createdAt: new Date(),
    };

    mockPrisma.job.update.mockResolvedValue({
      ...job,
      attempts: 1,
      status: "PROCESSING",
    });

    const { fetchData } = await import("../worker");
    const result = fetchData(job);

    await vi.advanceTimersByTimeAsync(10_000);

    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: { attempts: 1 },
    });
    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: { status: "PROCESSING" },
    });
    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: { status: "COMPLETED" },
    });

    await result;
  });

  it("fetchData marks unknown job types as FAILED", async () => {
    const job = {
      id: "job-2",
      type: "UNKNOWN_TYPE",
      status: "PENDING",
      attempts: 0,
      createdAt: new Date(),
    };

    mockPrisma.job.update.mockResolvedValue({
      ...job,
      attempts: 1,
      status: "PROCESSING",
    });

    const { fetchData } = await import("../worker");
    const result = fetchData(job);

    await vi.advanceTimersByTimeAsync(10_000);

    expect(mockPrisma.job.update).toHaveBeenCalledWith({
      where: { id: job.id },
      data: { status: "FAILED" },
    });

    await result;
  });

  it("fetchData retries on error and makes multiple update calls", async () => {
    const job = {
      id: "job-3",
      type: "EMAIL",
      status: "PENDING",
      attempts: 0,
      createdAt: new Date(),
    };

    mockPrisma.job.update.mockRejectedValue(new Error("db error"));

    const { fetchData } = await import("../worker");
    const result = fetchData(job);

    await result.catch(() => {});

    expect(mockPrisma.job.update.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("worker processes multiple jobs concurrently", async () => {
    const jobs = [
      {
        id: "job-1",
        type: "EMAIL",
        status: "PENDING",
        attempts: 0,
        createdAt: new Date(),
      },
      {
        id: "job-2",
        type: "REPORT",
        status: "PENDING",
        attempts: 0,
        createdAt: new Date(),
      },
    ];

    mockPrisma.job.findMany.mockResolvedValue(jobs);
    mockPrisma.job.update.mockResolvedValue({
      id: "job",
      type: "EMAIL",
      status: "PROCESSING",
      attempts: 1,
      createdAt: new Date(),
    });

    const { worker } = await import("../worker");
    const result = worker();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(mockPrisma.job.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.job.update).toHaveBeenCalledTimes(jobs.length * 3);

    await result;
  });
});

describe("CLI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockRl.question.mockClear();
    mockRl.close.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders main menu options", async () => {
    mockRl.question.mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(logSpy).toHaveBeenCalledWith("=== Job Processing System ===");
    expect(logSpy).toHaveBeenCalledWith("1. Create Job");
    expect(logSpy).toHaveBeenCalledWith("2. List Jobs");
    expect(logSpy).toHaveBeenCalledWith("3. Edit Job");
    expect(logSpy).toHaveBeenCalledWith("4. Exit");
    expect(mockRl.question).toHaveBeenCalledWith("Enter a number: ");

    await result;
  });

  it("continues on invalid non-numeric input", async () => {
    mockRl.question.mockResolvedValueOnce("abc").mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(mockRl.question).toHaveBeenCalledTimes(2);

    await result;
  });

  it("shows no jobs message when listing with no records", async () => {
    mockPrisma.job.findFirst.mockResolvedValue(null);
    mockPrisma.job.findMany.mockResolvedValue([]);
    mockRl.question.mockResolvedValueOnce("2").mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(logSpy).toHaveBeenCalledWith("No jobs Yet the moment");

    await result;
  });

  it("lists all jobs when choosing list option 1", async () => {
    const jobs = [
      { id: "1", type: "EMAIL", status: "PENDING", createdAt: new Date() },
      { id: "2", type: "REPORT", status: "COMPLETED", createdAt: new Date() },
    ];

    mockPrisma.job.findFirst.mockResolvedValue({ id: "1" });
    mockPrisma.job.findMany.mockResolvedValue(jobs);
    mockRl.question
      .mockResolvedValueOnce("2")
      .mockResolvedValueOnce("1")
      .mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(logSpy).toHaveBeenCalledWith("\n=== ALl Jobs ===");
    expect(
      logSpy.mock.calls.some((call) =>
        call.some((arg) => typeof arg === "string" && arg.includes("ID: 1")),
      ),
    ).toBe(true);
    expect(
      logSpy.mock.calls.some((call) =>
        call.some(
          (arg) => typeof arg === "string" && arg.includes("Type: EMAIL"),
        ),
      ),
    ).toBe(true);

    await result;
  });

  it("exits gracefully on option 4", async () => {
    mockRl.question.mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(logSpy).toHaveBeenCalledWith("Choosed: 4. Exit", "\n", "GoodBye!");
    expect(mockRl.close).toHaveBeenCalled();

    await result;
  });

  it("logs invalid option for out-of-range numeric input", async () => {
    mockRl.question.mockResolvedValueOnce("5").mockResolvedValueOnce("4");

    const { jobSystem } = await import("../cli");
    const result = jobSystem();

    await vi.advanceTimersByTimeAsync(0);

    expect(logSpy).toHaveBeenCalledWith(
      "Invalid option, Please Choose From Provided List",
    );

    await result;
  });
});
