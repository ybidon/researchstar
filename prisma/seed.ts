import { PrismaClient, MetricCode } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@researchstar.com" },
    update: {},
    create: {
      email: "admin@researchstar.com",
      username: "admin",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create Tesla company
  const tesla = await prisma.company.upsert({
    where: { ticker: "TSLA" },
    update: {},
    create: {
      ticker: "TSLA",
      name: "Tesla, Inc.",
      description:
        "Tesla designs, develops, manufactures, and sells electric vehicles, energy storage systems, and solar products.",
      sector: "Consumer Cyclical",
      industry: "Auto Manufacturers",
    },
  });
  console.log("Created company:", tesla.name);

  // Create a sample competition for Q4 2025 (next upcoming earnings)
  const earningsDate = new Date("2026-01-29T21:00:00Z"); // After market close
  const submissionOpen = new Date("2026-01-15T00:00:00Z");
  const submissionClose = new Date("2026-01-28T23:59:59Z"); // 1 day before earnings

  const competition = await prisma.competition.upsert({
    where: {
      companyId_quarter_fiscalYear: {
        companyId: tesla.id,
        quarter: 4,
        fiscalYear: 2025,
      },
    },
    update: {},
    create: {
      companyId: tesla.id,
      title: "Tesla Q4 2025 Earnings",
      description:
        "Predict Tesla's Q4 2025 earnings metrics. Submit your predictions before the earnings call!",
      quarter: 4,
      fiscalYear: 2025,
      earningsDate,
      submissionOpen,
      submissionClose,
      status: "OPEN",
      metrics: {
        create: [
          {
            name: "Revenue",
            code: MetricCode.REVENUE,
            description: "Total revenue in billions USD",
            unit: "B",
            weight: 0.25,
            order: 0,
          },
          {
            name: "EPS (Earnings Per Share)",
            code: MetricCode.EPS,
            description: "GAAP earnings per share in USD",
            unit: "$",
            weight: 0.25,
            order: 1,
          },
          {
            name: "Net Income",
            code: MetricCode.NET_INCOME,
            description: "Net income in billions USD",
            unit: "B",
            weight: 0.2,
            order: 2,
          },
          {
            name: "Forward Revenue Guidance",
            code: MetricCode.FORWARD_REVENUE_GUIDANCE,
            description: "Expected revenue guidance for next quarter in billions USD",
            unit: "B",
            weight: 0.15,
            order: 3,
          },
          {
            name: "Forward EPS Guidance",
            code: MetricCode.FORWARD_EPS_GUIDANCE,
            description: "Expected EPS guidance for next quarter in USD",
            unit: "$",
            weight: 0.15,
            order: 4,
          },
        ],
      },
    },
    include: {
      metrics: true,
    },
  });
  console.log("Created competition:", competition.title);
  console.log("With metrics:", competition.metrics.map((m) => m.name).join(", "));

  // Create a Q3 2025 completed competition as an example
  const q3EarningsDate = new Date("2025-10-22T20:00:00Z");
  const q3SubmissionOpen = new Date("2025-10-01T00:00:00Z");
  const q3SubmissionClose = new Date("2025-10-21T23:59:59Z");

  const q3Competition = await prisma.competition.upsert({
    where: {
      companyId_quarter_fiscalYear: {
        companyId: tesla.id,
        quarter: 3,
        fiscalYear: 2025,
      },
    },
    update: {},
    create: {
      companyId: tesla.id,
      title: "Tesla Q3 2025 Earnings",
      description: "Predict Tesla's Q3 2025 earnings metrics.",
      quarter: 3,
      fiscalYear: 2025,
      earningsDate: q3EarningsDate,
      submissionOpen: q3SubmissionOpen,
      submissionClose: q3SubmissionClose,
      status: "COMPLETED",
      metrics: {
        create: [
          {
            name: "Revenue",
            code: MetricCode.REVENUE,
            description: "Total revenue in billions USD",
            unit: "B",
            weight: 0.25,
            order: 0,
          },
          {
            name: "EPS (Earnings Per Share)",
            code: MetricCode.EPS,
            description: "GAAP earnings per share in USD",
            unit: "$",
            weight: 0.25,
            order: 1,
          },
          {
            name: "Net Income",
            code: MetricCode.NET_INCOME,
            description: "Net income in billions USD",
            unit: "B",
            weight: 0.2,
            order: 2,
          },
          {
            name: "Forward Revenue Guidance",
            code: MetricCode.FORWARD_REVENUE_GUIDANCE,
            description: "Expected revenue guidance for next quarter in billions USD",
            unit: "B",
            weight: 0.15,
            order: 3,
          },
          {
            name: "Forward EPS Guidance",
            code: MetricCode.FORWARD_EPS_GUIDANCE,
            description: "Expected EPS guidance for next quarter in USD",
            unit: "$",
            weight: 0.15,
            order: 4,
          },
        ],
      },
    },
    include: {
      metrics: true,
    },
  });
  console.log("Created completed competition:", q3Competition.title);

  console.log("\nSeeding completed!");
  console.log("\nYou can log in as admin with:");
  console.log("Email: admin@researchstar.com");
  console.log("Password: Admin123!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
