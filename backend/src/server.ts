import app from "./app";

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Backend API running at http://127.0.0.1:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Backend port ${PORT} is already in use. Stop the other process or set PORT to a free port.`);
    process.exit(1);
  }

  console.error("Backend failed to start:", error);
  process.exit(1);
});
