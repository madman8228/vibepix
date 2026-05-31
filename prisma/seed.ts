import { CatalogKind, PrismaClient } from "@prisma/client";

import { defaultGameplay } from "../src/lib/catalog/default-gameplay";
import { defaultModes } from "../src/lib/catalog/default-modes";
import { defaultStyles } from "../src/lib/catalog/default-styles";
import { createDbClient } from "../src/lib/db";

const prisma: PrismaClient = createDbClient();

const defaultTiers = [
  { key: "free", name: "Free", maxPanels: 1, monthlyQuota: 5 },
  { key: "plus", name: "Plus", maxPanels: 4, monthlyQuota: 30 },
];

async function main() {
  await prisma.work.deleteMany();
  await prisma.job.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.promptTemplate.deleteMany();
  await prisma.modelRoute.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.tier.deleteMany();

  await prisma.tier.createMany({
    data: defaultTiers,
  });

  await prisma.catalogItem.createMany({
    data: [
      ...defaultStyles.map((item) => ({
        kind: CatalogKind.STYLE,
        key: item.id,
        title: item.title,
        description: item.description,
        reason: item.reason,
        previewImageUrl: item.previewImageUrl ?? null,
        tags: JSON.stringify(item.tags),
        tierKeys: JSON.stringify(item.tierKeys),
        sortOrder: item.sortOrder,
      })),
      ...defaultModes.map((item) => ({
        kind: CatalogKind.MODE,
        key: item.id,
        title: item.title,
        description: item.description,
        reason: item.reason,
        previewImageUrl: item.previewImageUrl ?? null,
        tags: JSON.stringify(item.tags),
        tierKeys: JSON.stringify(item.tierKeys),
        sortOrder: item.sortOrder,
      })),
      ...defaultGameplay.map((item) => ({
        kind: CatalogKind.GAMEPLAY,
        key: item.id,
        title: item.title,
        description: item.description,
        reason: item.reason,
        previewImageUrl: item.previewImageUrl ?? null,
        tags: JSON.stringify(item.tags),
        tierKeys: JSON.stringify(item.tierKeys),
        sortOrder: item.sortOrder,
      })),
    ],
  });

  console.log(
    `Seeded ${defaultTiers.length} tiers and ${
      defaultStyles.length + defaultModes.length + defaultGameplay.length
    } catalog items.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
