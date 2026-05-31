import { mkdir, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";

async function main() {
  const databasePath = resolve("prisma/dev.db");

  await mkdir(dirname(databasePath), { recursive: true });
  const databaseFile = await open(databasePath, "a");
  await databaseFile.close();

  console.log(`Bootstrap database is ready at ${databasePath}.`);
  console.log("No application models are defined yet, so no tables were created.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
