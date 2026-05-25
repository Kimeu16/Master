import { spawn } from "node:child_process";
import http from "node:http";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const backendHealthUrl = "http://127.0.0.1:5000/api/health";
const children = [];

const quoteWindowsArg = (arg) => {
  if (!/[\s&()^|<>]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '""')}"`;
};

const spawnProcess = (name, command, args) => {
  const child =
    process.platform === "win32"
      ? spawn("cmd.exe", ["/d", "/s", "/c", [command, ...args].map(quoteWindowsArg).join(" ")], {
          stdio: "inherit",
          shell: false,
        })
      : spawn(command, args, {
          stdio: "inherit",
          shell: false,
        });

  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal || code === 0) return;
    console.error(`${name} exited with code ${code}`);
    shutdown(code ?? 1);
  });

  return child;
};

const checkBackend = () =>
  new Promise((resolve) => {
    const request = http.get(backendHealthUrl, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(500, () => {
      request.destroy();
      resolve(false);
    });
  });

const waitForBackend = async () => {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await checkBackend()) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
};

const shutdown = (code = 0) => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
};

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

if (await checkBackend()) {
  console.log("Backend already running at http://127.0.0.1:5000");
} else {
  spawnProcess("backend", npmCommand, ["--prefix", "backend", "run", "dev"]);

  if (!(await waitForBackend())) {
    console.error("Backend did not become ready at http://127.0.0.1:5000. Check the backend terminal output above.");
    shutdown(1);
  }
}

spawnProcess("frontend", npmCommand, ["run", "dev:frontend"]);
