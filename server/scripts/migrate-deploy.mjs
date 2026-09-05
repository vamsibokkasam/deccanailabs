import { spawnSync } from "node:child_process";

const FAILED_OFFER_LETTERS = "20260905184500_offer_letters";

function runPrisma(args) {
  const result = spawnSync("npx", ["prisma", ...args], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  return result.status ?? 1;
}

let status = runPrisma(["migrate", "deploy"]);

if (status !== 0) {
  console.warn(
    `prisma migrate deploy failed (${status}). Clearing known failed migration ${FAILED_OFFER_LETTERS} and retrying.`
  );
  runPrisma(["migrate", "resolve", "--rolled-back", FAILED_OFFER_LETTERS]);
  status = runPrisma(["migrate", "deploy"]);
}

process.exit(status);
