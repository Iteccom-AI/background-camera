// FFmpeg service for video processing
const { spawn } = require("child_process");

class FfmpegService {
  constructor() {
    this.process = null;
    this.isRunning = false;
  }

  buildArgs(config) {
    const desiredFps = config.fps && Number(config.fps) > 0 ? String(config.fps) : "1";
    const commonArgs = ["-vf", `fps=${desiredFps}`, "-vcodec", "mjpeg", "-q:v", "2", "-f", "image2pipe", "pipe:1"];

    switch (config.sourceType) {
      case "usb":
        const src = config.usbSource || "/dev/video0";
        const isWindows = process.platform === "win32";
        if (isWindows) {
          const normalized = this.normalizeDshowVideoInput(src);
          return ["-f", "dshow", "-i", normalized, ...commonArgs];
        }
        return ["-f", "v4l2", "-i", src, ...commonArgs];

      case "rtsp":
        return ["-rtsp_transport", "tcp", "-i", config.rtspUrl, ...commonArgs];

      case "video":
      default:
        return ["-re", "-stream_loop", "-1", "-i", config.videoPath, ...commonArgs];
    }
  }

  normalizeDshowVideoInput(input) {
    // Return clean device name for dshow
    if (!input) return 'video=USB Camera';
    
    const trimmed = String(input).trim();
    const lower = trimmed.toLowerCase();

    // If it's an alternative name (@device_...), use it directly
    if (trimmed.startsWith('@device')) {
      return `video=${trimmed}`;
    }

    // Extract device name from various input formats
    let deviceName = trimmed;

    // If already has video= prefix, extract the device name
    if (lower.startsWith('video=')) {
      const raw = trimmed.slice(6).trim();
      
      // Alternative name format
      if (raw.startsWith('@device')) {
        return `video=${raw}`;
      }
      
      // Remove existing quotes if present
      if (raw.startsWith('"') && raw.endsWith('"')) {
        deviceName = raw.slice(1, -1);
      } else {
        deviceName = raw;
      }
    } 
    // If user provided device label in quotes
    else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      deviceName = trimmed.slice(1, -1);
    }

    // For simple device names without special chars, use directly
    // For names with parentheses from browser, strip them
    // Browser gives: "Wed Camera (32e6:9221)"
    // FFmpeg expects: "Wed Camera"
    const match = deviceName.match(/^(.+?)\s*\([^)]+\)$/);
    if (match) {
      deviceName = match[1].trim();
    }

    return `video=${deviceName}`;
  }

  start(config, onFrameCallback) {
    return new Promise((resolve, reject) => {
      try {
        this.stop(); // Stop existing process if any

        const args = this.buildArgs(config);
        this.process = spawn("ffmpeg", args);

        let frameBuffer = Buffer.alloc(0);

        this.process.stdout.on("data", (chunk) => {
          frameBuffer = Buffer.concat([frameBuffer, chunk]);
          frameBuffer = this.processFrameBuffer(frameBuffer, config, onFrameCallback);
        });

        this.process.stderr.on("data", (data) => {
          const msg = data.toString();
          if (!msg.includes("frame=")) {
            console.error("ffmpeg:", msg);
          }
        });

        this.process.on("spawn", () => {
          console.log("ffmpeg started", args.join(" "));
          this.isRunning = true;
          resolve();
        });

        this.process.on("close", (code) => {
          console.log("ffmpeg exited:", code);
          this.isRunning = false;
        });

        this.process.on("error", (error) => {
          console.error("ffmpeg error:", error);
          this.isRunning = false;
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  processFrameBuffer(frameBuffer, config, onFrameCallback) {
    let searchStart = 0;
    const soi = Buffer.from([0xFF, 0xD8]); // Start Of Image
    const eoi = Buffer.from([0xFF, 0xD9]); // End Of Image

    while (true) {
      const startIndex = frameBuffer.indexOf(soi, searchStart);
      if (startIndex === -1) {
        // No SOI found; drop data before current buffer end
        frameBuffer = Buffer.alloc(0);
        break;
      }

      const endIndex = frameBuffer.indexOf(eoi, startIndex + 2);
      if (endIndex === -1) {
        // Partial frame: keep from SOI onwards for next chunk
        frameBuffer = frameBuffer.slice(startIndex);
        break;
      }

      const completeFrame = frameBuffer.slice(startIndex, endIndex + 2);

      if (completeFrame.length > 2) {
        const payload = {
          cameraId: config.cameraId,
          frame: completeFrame.toString("base64")
        };
        if (config.apiKey) payload.apiKey = config.apiKey;
        onFrameCallback(payload);
      }

      // Continue searching after this frame
      searchStart = endIndex + 2;

      // If we've consumed all available complete frames, cut the buffer to leftover
      if (searchStart >= frameBuffer.length) {
        frameBuffer = Buffer.alloc(0);
        break;
      }
    }

    return frameBuffer;
  }

  stop() {
    if (this.process && !this.process.killed) {
      try {
        this.process.kill("SIGTERM");
      } catch (error) {
        console.error('Error stopping ffmpeg:', error);
      }
    }
    this.process = null;
    this.isRunning = false;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      process: this.process
    };
  }
}

module.exports = new FfmpegService();