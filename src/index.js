// Main application entry point
const express = require("express");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const { engine } = require("express-handlebars");
const { envConfig } = require("./config/env-config");
const path = require("path");
// Use Node's built-in __dirname in CommonJS

// Import modules
const cameraRoutes = require("./routes/cameraRoutes");
const configRoutes = require("./routes/configRoutes");
// Express app setup
const app = express();
const PORT = envConfig.port;

// Live reload setup for development
const liveReloadServer = livereload.createServer();
liveReloadServer.watch("src/views");
liveReloadServer.watch("src/views/layouts");
liveReloadServer.watch("src/views/style"); // Watch CSS directory for changes
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

// Handlebars setup
app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "main",
  cache: false, // disable template caching to see immediate changes
  helpers: {
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    lt: (a, b) => a < b,
    gt: (a, b) => a > b,
    and: (a, b) => a && b,
    or: (a, b) => a || b,
    timestamp: () => Date.now() // Add timestamp for cache busting
  }
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Disable view caching in development to ensure changes reflect immediately
if (envConfig.isDev) {
  app.set("view cache", false);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/", cameraRoutes);
app.use("/config", configRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log("Serving static files from:", path.join(__dirname, "views/style"));

  console.log(`Config UI running at http://0.0.0.0:${PORT}`);
});
