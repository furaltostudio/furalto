const http = require("http");
const app = require("./app");
const { env, connectDatabase } = require("./config");
const { initSocket } = require("./services/socket.service");

const startServer = async () => {
  try {
    env.assertProductionEnv();
    await connectDatabase();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`CORS origin: ${env.corsOrigin}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
