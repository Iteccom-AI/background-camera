const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const configManager = require("../config/config");

const router = express.Router();

// Setup upload directory
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Home page
router.post("/set-config", (req, res) => {
    const config = configManager.getConfig();
    configManager.updateSourceType({
        ...config,
        ...req.body
    });

    res.status(200).send(JSON.stringify({
        success: true,
        config: config
    }));
});

module.exports = router;
