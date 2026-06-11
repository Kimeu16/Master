/**
 * Starts a local MySQL server using the project's mysql-data directory,
 * waits for it to accept connections, and then keeps running.
 * Designed to be spawned by the dev script via concurrently.
 *
 * On SIGINT / SIGTERM it shuts MySQL down cleanly via mysqladmin.
 */

import { spawn, execFileSync } from "node:child_process";
import { createConnection } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const MYSQL_BIN = String.raw`C:\Program Files\MySQL\MySQL Server 8.4\bin`;
const MYSQLD = path.join(MYSQL_BIN, "mysqld.exe");
const MYSQLADMIN = path.join(MYSQL_BIN, "mysqladmin.exe");
const DATA_DIR = path.join(projectRoot, "mysql-data");
const PORT = "3306";

/** Check if something is already listening on the MySQL port */
const isPortOpen = (port, host = "127.0.0.1") =>
  new Promise((resolve) => {
    const socket = createConnection({ port: Number(port), host });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(400, () => {
      socket.destroy();
      resolve(false);
    });
  });

/** Wait until MySQL accepts TCP connections */
const waitForMySQL = async (maxAttempts = 30, delayMs = 1000) => {
  for (let i = 1; i <= maxAttempts; i++) {
    if (await isPortOpen(PORT)) {
      console.log(`[mysql] Ready on port ${PORT}`);
      return true;
    }
    if (i < maxAttempts) {
      process.stdout.write(`[mysql] Waiting for MySQL to start... (${i}/${maxAttempts})\r`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
};

/** Gracefully shut down MySQL via mysqladmin */
const shutdownMySQL = () => {
  console.log("\n[mysql] Shutting down MySQL...");
  try {
    execFileSync(MYSQLADMIN, [
      "--user=root",
      `--password=${process.env.DB_PASSWORD || ""}`,
      "--host=127.0.0.1",
      `--port=${PORT}`,
      "shutdown",
    ], { stdio: "inherit", timeout: 15000 });
    console.log("[mysql] MySQL stopped.");
  } catch {
    console.warn("[mysql] mysqladmin shutdown failed – MySQL may already be stopped.");
  }
};

// ─── Main ───────────────────────────────────────────────────────────────────

// 1. If MySQL is already running, just stay alive
if (await isPortOpen(PORT)) {
  console.log(`[mysql] MySQL is already running on port ${PORT} – nothing to do.`);
  // Keep process alive so concurrently doesn't think it exited
  setInterval(() => {}, 60_000);
} else {
  // 2. Start mysqld
  console.log(`[mysql] Starting MySQL Server...`);
  console.log(`[mysql]   binary : ${MYSQLD}`);
  console.log(`[mysql]   datadir: ${DATA_DIR}`);

  const mysqld = spawn(MYSQLD, [
    `--datadir=${DATA_DIR}`,
    `--port=${PORT}`,
    "--console",
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  // Forward mysqld output with a prefix
  mysqld.stdout?.on("data", (d) => process.stdout.write(`[mysql] ${d}`));
  mysqld.stderr?.on("data", (d) => process.stderr.write(`[mysql] ${d}`));

  mysqld.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[mysql] mysqld exited unexpectedly with code ${code}`);
      process.exit(1);
    }
  });

  // 3. Wait for it to be ready
  if (!(await waitForMySQL())) {
    console.error("[mysql] MySQL did not become ready in time. Check output above.");
    process.exit(1);
  }

  // 4. Clean shutdown on exit
  const cleanup = () => {
    shutdownMySQL();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // On Windows, handle the console close event
  process.on("exit", () => {
    // Attempt shutdown if still running
    try {
      if (!mysqld.killed) {
        execFileSync(MYSQLADMIN, [
          "--user=root",
          `--password=${process.env.DB_PASSWORD || ""}`,
          "--host=127.0.0.1",
          `--port=${PORT}`,
          "shutdown",
        ], { timeout: 10000 });
      }
    } catch {
      // Best effort
    }
  });
}
