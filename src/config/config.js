// Configuration management
class ConfigManager {
  constructor() {
    this.currentConfig = null;
  }

  setConfig(config) {
    this.currentConfig = {
      socketUrl: (config.socketUrl || "").trim(),
      apiKey: (config.apiKey || "").trim(),
      sourceType: (config.sourceType || "video").trim(),
      cameraId: (config.cameraId || "cam1").trim(),
      usbSource: (config.usbSource || "").trim(),
      rtspUrl: (config.rtspUrl || "").trim(),
      fps: String(config.fps || "1").trim(),
      videoPath: config.videoPath || this.currentConfig?.videoPath || null
    };
    return this.currentConfig;
  }

  getConfig() {
    return this.currentConfig;
  }

  updateVideoPath(videoPath) {
    if (this.currentConfig) {
      this.currentConfig.videoPath = videoPath;
    }
  }

  updateSourceType(sourceType, params = {}) {
    
    if (!this.currentConfig) {
      this.currentConfig = {};
    }
    
    const normalized = String(sourceType || "").trim().toLowerCase();
    if (!["video", "usb", "rtsp"].includes(normalized)) {
      return { valid: false, error: "Invalid source type. Use 'video', 'usb', or 'rtsp'" };
    }

    this.currentConfig.sourceType = normalized;

    // Clear unrelated fields and set relevant one(s)
    if (normalized === "video") {
      this.currentConfig.videoPath = (params.videoPath ?? this.currentConfig.videoPath ?? null);
      this.currentConfig.usbSource = "";
      this.currentConfig.rtspUrl = "";
    } else if (normalized === "usb") {
      this.currentConfig.usbSource = (params.usbSource || "").trim();
      this.currentConfig.videoPath = null;
      this.currentConfig.rtspUrl = "";
    } else if (normalized === "rtsp") {
      this.currentConfig.rtspUrl = (params.rtspUrl || "").trim();
      this.currentConfig.videoPath = null;
      this.currentConfig.usbSource = "";
    }

    if (params.fps !== undefined) {
      this.currentConfig.fps = String(params.fps).trim();
    }

    return this.validateConfig();
  }

  validateConfig() {
    if (!this.currentConfig) return { valid: false, error: "No configuration set" };
    
    if (!this.currentConfig.socketUrl) {
      return { valid: false, error: "Socket URL is required" };
    }

    if (this.currentConfig.sourceType === "video" && !this.currentConfig.videoPath) {
      return { valid: false, error: "Video file is required for video source type" };
    }

    if (this.currentConfig.sourceType === "usb" && !this.currentConfig.usbSource) {
      return { valid: false, error: "USB source is required for USB source type" };
    }

    if (this.currentConfig.sourceType === "rtsp" && !this.currentConfig.rtspUrl) {
      return { valid: false, error: "RTSP URL is required for RTSP source type" };
    }

    return { valid: true };
  }
}

module.exports = new ConfigManager();
