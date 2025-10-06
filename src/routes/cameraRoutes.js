// Camera routes
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const configManager = require("../config/config");
const pipelineService = require("../services/pipelineService");

const router = express.Router();

// Setup upload directory
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

// Home page
router.get("/", (_req, res) => {
  res.render("home", { currentConfig: configManager.getConfig() });
});

// Start pipeline
router.post("/start", upload.single("videoFile"), async (req, res) => {
  try {
    const config = configManager.setConfig(req.body);

    // Handle video file upload
    if (config.sourceType === "video") {
      if (req.file && req.file.path) {
        configManager.updateVideoPath(req.file.path);
      } else if (!config.videoPath) {
        return res.status(400).send("Vui lòng upload file video.");
      }
    }

    // Validate configuration
    const validation = configManager.validateConfig();
    if (!validation.valid) {
      return res.status(400).send(validation.error);
    }

    // Start pipeline
    await pipelineService.start(configManager.getConfig());

    res.redirect("/");
  } catch (error) {
    console.error("Error starting pipeline:", error);
    res.status(500).send("Lỗi khi start pipeline");
  }
});

// Stop pipeline
router.post("/stop", async (_req, res) => {
  try {
    await pipelineService.stop();
    res.status(200).send("stopped");
  } catch (error) {
    console.error("Error stopping pipeline:", error);
    res.status(500).send("error stopping");
  }
});

// Get status
router.get("/status", (_req, res) => {
  const status = pipelineService.getStatus();
  res.json({
    pipeline: status,
    config: configManager.getConfig()
  });
});

module.exports = router;
