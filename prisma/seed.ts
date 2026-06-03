import { createDbClient } from "../src/lib/db";

const prisma = createDbClient();

async function main() {
  await prisma.tier.upsert({
    where: { key: "free" },
    update: {
      name: "Free",
      maxPanels: 1,
      monthlyQuota: 999,
    },
    create: {
      key: "free",
      name: "Free",
      maxPanels: 1,
      monthlyQuota: 999,
    },
  });

  console.log("Seeded default free tier for avatar play MVP.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
