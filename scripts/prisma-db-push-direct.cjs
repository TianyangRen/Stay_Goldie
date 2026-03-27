/* Run `prisma db push` using DIRECT_URL (e.g. Supabase Session pooler :5432). Avoids Transaction pooler :6543 for CLI. */
require("dotenv/config");
const { spawnSync } = require("node:child_process");

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error("Missing DIRECT_URL in environment (.env).");
  process.exit(1);
}

process.env.DATABASE_URL = direct;

const r = spawnSync("npx", ["prisma", "db", "push"], {
  stdio: "inherit",
  shell: true,
  cwd: require("node:path").join(__dirname, ".."),
});

process.exit(r.status ?? 1);
