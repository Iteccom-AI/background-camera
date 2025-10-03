// client-agent/index.js
const io = require("socket.io-client");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// --------- RUNTIME STATE ---------
let socket = null;
let ffmpeg = null;
let currentConfig = null;
// ---------------------------------

// Express app để người dùng nhập cấu hình
const app = express();
const PORT = process.env.PORT || 4000;

// Upload video vào thư mục tạm của project
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

app.use(express.urlencoded({ extended: true }));

// Trang cấu hình đơn giản
app.get("/", (_req, res) => {
  res.send(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Local Camera Sender</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; }
    fieldset { margin-bottom: 16px; }
    label { display:block; margin: 8px 0 4px; }
    input[type=text], input[type=url], select { width: 480px; max-width: 100%; padding: 8px; }
    .row { display:flex; gap:16px; flex-wrap: wrap; align-items:center }
    .hint { font-size: 12px; color:#666 }
    .running { color: green; font-weight: 600; }
    .stopped { color: #a00; font-weight: 600; }
  </style>
  <script>
    async function stopPipeline() {
      await fetch('/stop', { method: 'POST' });
      location.reload();
    }
  </script>
  </head>
  <body>
    <h2>Gửi khung hình qua Socket</h2>
    <p>Trạng thái: <span class="${currentConfig ? 'running' : 'stopped'}">${currentConfig ? 'ĐANG CHẠY' : 'ĐÃ DỪNG'}</span></p>
    <form action="/start" method="post" enctype="multipart/form-data">
      <fieldset>
        <legend>Kết nối</legend>
        <label>Socket URL</label>
        <input name="socketUrl" type="url" placeholder="http://localhost:3000" required value="${currentConfig?.socketUrl || ''}" />

        <label>API Key</label>
        <input name="apiKey" type="text" placeholder="your-api-key" value="${currentConfig?.apiKey || ''}" />
      </fieldset>

      <fieldset>
        <legend>Nguồn video</legend>
        <div class="row">
          <label><input type="radio" name="sourceType" value="usb" ${currentConfig?.sourceType==='usb'?'checked':''}/> USB</label>
          <label><input type="radio" name="sourceType" value="rtsp" ${currentConfig?.sourceType==='rtsp'?'checked':''}/> RTSP</label>
          <label><input type="radio" name="sourceType" value="video" ${currentConfig?.sourceType==='video'?'checked':'checked'}/> Video file</label>
        </div>

        <label>Camera ID</label>
        <input name="cameraId" type="text" placeholder="cam1" value="${currentConfig?.cameraId || 'cam1'}" required />

        <label>USB source (Linux v4l2 ví dụ: /dev/video0, Windows dshow ví dụ: video=USB Camera)</label>
        <input name="usbSource" type="text" placeholder="/dev/video0" value="${currentConfig?.usbSource || ''}" />

        <label>RTSP URL</label>
        <input name="rtspUrl" type="url" placeholder="rtsp://user:pass@ip:554/Streaming/Channels/101" value="${currentConfig?.rtspUrl || ''}" />

        <label>Video file (nếu chọn Video)</label>
        <input name="videoFile" type="file" accept="video/*" />
        <div class="hint">File hiện tại: ${currentConfig?.videoPath ? currentConfig.videoPath : 'chưa có'} </div>

        <label>FPS mong muốn</label>
        <input name="fps" type="text" placeholder="1" value="${currentConfig?.fps || '1'}" />
      </fieldset>

      <div class="row">
        <button type="submit">Start/Restart</button>
        <button type="button" onclick="stopPipeline()">Stop</button>
      </div>
    </form>
  </body>
</html>`);
});

// Bắt đầu pipeline
app.post("/start", upload.single("videoFile"), async (req, res) => {
  try {
    const socketUrl = (req.body.socketUrl || "").trim();
    const apiKey = (req.body.apiKey || "").trim();
    const sourceType = (req.body.sourceType || "video").trim();
    const cameraId = (req.body.cameraId || "cam1").trim();
    const usbSource = (req.body.usbSource || "").trim();
    const rtspUrl = (req.body.rtspUrl || "").trim();
    const fps = String(req.body.fps || "1").trim();

    let videoPath = currentConfig?.videoPath || null;
    if (sourceType === "video") {
      if (req.file && req.file.path) {
        videoPath = req.file.path;
      } else if (!videoPath) {
        return res.status(400).send("Vui lòng upload file video.");
      }
    }

    // Lưu cấu hình
    currentConfig = { socketUrl, apiKey, sourceType, cameraId, usbSource, rtspUrl, fps, videoPath };

    // Restart pipeline
    await stopPipeline();
    await startPipeline(currentConfig);

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi start pipeline");
  }
});

// Dừng pipeline
app.post("/stop", async (_req, res) => {
  try {
    await stopPipeline();
    res.status(200).send("stopped");
  } catch (e) {
    res.status(500).send("error stopping");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Config UI running at http://localhost:${PORT}`);
});

// ---------------- Core logic ----------------
function buildFfmpegArgs(config) {
  const desiredFps = config.fps && Number(config.fps) > 0 ? String(config.fps) : "1";

  if (config.sourceType === "usb") {
    // Linux: v4l2, Windows: dshow (người dùng điền đúng chuỗi thiết bị)
    // Thử v4l2 trước, người dùng có thể sửa nếu cần
    const src = config.usbSource || "/dev/video0";
    const isWindows = process.platform === "win32";
    return isWindows
      ? ["-f", "dshow", "-i", src, "-vf", `fps=${desiredFps}`, "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"]
      : ["-f", "v4l2", "-i", src, "-vf", `fps=${desiredFps}`, "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
  }

  if (config.sourceType === "rtsp") {
    const src = config.rtspUrl;
    return ["-rtsp_transport", "tcp", "-i", src, "-vf", `fps=${desiredFps}`, "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
  }

  // video file
  return ["-re", "-stream_loop", "-1", "-i", config.videoPath, "-vf", `fps=${desiredFps}`, "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
}

async function startPipeline(config) {
  return new Promise((resolve, reject) => {
    try {
      // Kết nối socket
      socket = io(config.socketUrl, { transports: ["websocket"], auth: config.apiKey ? { apiKey: config.apiKey } : undefined });
      console.log(config);
      const args = buildFfmpegArgs(config);
      ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stdout.on("data", (chunk) => {
        const payload = { cameraId: config.cameraId, frame: chunk.toString("base64") };
        if (config.apiKey) payload.apiKey = config.apiKey;
        socket.emit("camera_frame", payload);
      });

      ffmpeg.stderr.on("data", (data) => {
        const msg = data.toString();
        if (!msg.includes("frame=")) {
          console.error("ffmpeg:", msg);
        }
      });

      ffmpeg.on("spawn", () => {
        console.log("ffmpeg started", args.join(" "));
        resolve();
      });

      ffmpeg.on("close", (code) => {
        console.log("ffmpeg exited:", code);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function stopPipeline() {
  // Đóng ffmpeg
  if (ffmpeg && !ffmpeg.killed) {
    try { ffmpeg.kill("SIGTERM"); } catch (_) {}
  }
  ffmpeg = null;

  // Đóng socket
  if (socket && socket.connected) {
    try { socket.disconnect(); } catch (_) {}
  }
  socket = null;
}
