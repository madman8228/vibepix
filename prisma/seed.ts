import { CatalogKind, PrismaClient } from "@prisma/client";

import { defaultGameplay } from "../src/lib/catalog/default-gameplay";
import { defaultModes } from "../src/lib/catalog/default-modes";
import { defaultStyles } from "../src/lib/catalog/default-styles";
import { createDbClient } from "../src/lib/db";
import type { RecommendationGroup } from "../src/lib/types";

const prisma: PrismaClient = createDbClient();

const defaultTiers = [
  { key: "free", name: "Free", maxPanels: 1, monthlyQuota: 5 },
  { key: "plus", name: "Plus", maxPanels: 4, monthlyQuota: 30 },
];

function toCatalogSeedData(kind: CatalogKind, item: RecommendationGroup) {
  return {
    kind,
    key: item.key,
    title: item.title,
    description: item.description,
    reason: item.reason,
    previewImageUrl: item.previewImageUrl ?? null,
    tags: JSON.stringify(item.tags),
    tierKeys: JSON.stringify(item.tierKeys),
    sortOrder: item.sortOrder,
    isActive: true,
  };
}

async function main() {
  for (const tier of defaultTiers) {
    await prisma.tier.upsert({
      where: { key: tier.key },
      update: tier,
      create: tier,
    });
  }

  const catalogItems = [
    ...defaultStyles.map((item) => toCatalogSeedData(CatalogKind.STYLE, item)),
    ...defaultModes.map((item) => toCatalogSeedData(CatalogKind.MODE, item)),
    ...defaultGameplay.map((item) =>
      toCatalogSeedData(CatalogKind.GAMEPLAY, item),
    ),
  ];

  for (const item of catalogItems) {
    await prisma.catalogItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }

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
