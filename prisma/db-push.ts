import { spawn } from "node:child_process";
import { mkdir, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const databaseFilePath = resolve(process.cwd(), "prisma", "dev.db");

async function ensureSqliteFileExists() {
  await mkdir(dirname(databaseFilePath), { recursive: true });
  const handle = await open(databaseFilePath, "a");
  await handle.close();
}

async function runPrismaCommand(commandText: string) {
  const command =
    process.platform === "win32" ? process.env.ComSpec ?? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", `npx ${commandText}`]
      : commandText.split(" ");
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(`${commandText} failed with exit code ${exitCode}.`);
  }
}

async function main() {
  await ensureSqliteFileExists();
  await runPrismaCommand("prisma db push");
  await runPrismaCommand("prisma generate");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
