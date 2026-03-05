import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@shakdol.com" },
    update: {},
    create: {
      email: "admin@shakdol.com",
      fullName: "מנהל המערכת",
      age: 30,
      role: "ADMIN",
      status: "ACTIVE",
      termsAcceptedAt: new Date(),
    },
  });

  console.log("Admin user created:", admin.email);

  // Create default settings
  const defaultSettings = [
    { key: "timerDuration", value: "60" },
    { key: "maxWordLength", value: "12" },
    { key: "maxMeaningSentences", value: "2" },
    { key: "maxDailySubmissions", value: "10" },
    { key: "suspendDuration24h", value: "24" },
    { key: "suspendDuration10d", value: "240" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
