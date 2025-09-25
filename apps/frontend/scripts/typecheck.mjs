import { spawn } from "node:child_process";
import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const projectRoot = resolve(dirname(__filename), "..");
const routesFile = resolve(projectRoot, ".next/types/routes.d.ts");

await mkdir(dirname(routesFile), { recursive: true });

try {
  await access(routesFile, constants.F_OK);
} catch {
  await writeFile(routesFile, "export {}\n", "utf8");
}

const tscBin = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(tscBin, ["tsc", "--project", "tsconfig.typecheck.json", "--pretty", "false"], {
  cwd: projectRoot,
  stdio: "inherit",
});

const exitCode = await new Promise((resolvePromise) => {
  child.on("exit", resolvePromise);
});

process.exit(typeof exitCode === "number" ? exitCode : 1);
