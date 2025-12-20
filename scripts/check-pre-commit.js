import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { platform } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWindows = platform() === "win32";
const scriptName = isWindows ? "check-pre-commit.ps1" : "check-pre-commit.sh";
const scriptPath = join(__dirname, scriptName);

let cmd, args;

if (isWindows) {
  cmd = "pwsh";
  args = ["-ExecutionPolicy", "Bypass", "-File", scriptPath];
} else {
  cmd = "bash";
  args = [scriptPath];
}

const res = spawnSync(cmd, args, { stdio: "inherit" });

if (res.error) {
  console.error(`Failed to start ${scriptName}:`, res.error);
  process.exit(1);
}

process.exit(res.status ?? 1);
