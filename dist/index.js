"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// client-agent/index.js
var io = require("socket.io-client");
var express = require("express");
var multer = require("multer");
var fs = require("fs");
var path = require("path");
var _require = require("child_process"),
  spawn = _require.spawn;

// --------- RUNTIME STATE ---------
var socket = null;
var ffmpeg = null;
var currentConfig = null;
// ---------------------------------

// Express app để người dùng nhập cấu hình
var app = express();
var PORT = process.env.PORT || 4000;

// Upload video vào thư mục tạm của project
var uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true
  });
}
var upload = multer({
  dest: uploadsDir
});
app.use(express.urlencoded({
  extended: true
}));

// Trang cấu hình đơn giản
app.get("/", function (_req, res) {
  var _currentConfig, _currentConfig2, _currentConfig3, _currentConfig4, _currentConfig5, _currentConfig6, _currentConfig7, _currentConfig8, _currentConfig9, _currentConfig0;
  res.send("<!doctype html>\n<html lang=\"vi\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>Local Camera Sender</title>\n  <style>\n    body { font-family: system-ui, sans-serif; margin: 24px; }\n    fieldset { margin-bottom: 16px; }\n    label { display:block; margin: 8px 0 4px; }\n    input[type=text], input[type=url], select { width: 480px; max-width: 100%; padding: 8px; }\n    .row { display:flex; gap:16px; flex-wrap: wrap; align-items:center }\n    .hint { font-size: 12px; color:#666 }\n    .running { color: green; font-weight: 600; }\n    .stopped { color: #a00; font-weight: 600; }\n  </style>\n  <script>\n    async function stopPipeline() {\n      await fetch('/stop', { method: 'POST' });\n      location.reload();\n    }\n  </script>\n  </head>\n  <body>\n    <h2>G\u1EEDi khung h\xECnh qua Socket</h2>\n    <p>Tr\u1EA1ng th\xE1i: <span class=\"".concat(currentConfig ? 'running' : 'stopped', "\">").concat(currentConfig ? 'ĐANG CHẠY' : 'ĐÃ DỪNG', "</span></p>\n    <form action=\"/start\" method=\"post\" enctype=\"multipart/form-data\">\n      <fieldset>\n        <legend>K\u1EBFt n\u1ED1i</legend>\n        <label>Socket URL</label>\n        <input name=\"socketUrl\" type=\"url\" placeholder=\"http://localhost:3000\" required value=\"").concat(((_currentConfig = currentConfig) === null || _currentConfig === void 0 ? void 0 : _currentConfig.socketUrl) || '', "\" />\n\n        <label>API Key</label>\n        <input name=\"apiKey\" type=\"text\" placeholder=\"your-api-key\" value=\"").concat(((_currentConfig2 = currentConfig) === null || _currentConfig2 === void 0 ? void 0 : _currentConfig2.apiKey) || '', "\" />\n      </fieldset>\n\n      <fieldset>\n        <legend>Ngu\u1ED3n video</legend>\n        <div class=\"row\">\n          <label><input type=\"radio\" name=\"sourceType\" value=\"usb\" ").concat(((_currentConfig3 = currentConfig) === null || _currentConfig3 === void 0 ? void 0 : _currentConfig3.sourceType) === 'usb' ? 'checked' : '', "/> USB</label>\n          <label><input type=\"radio\" name=\"sourceType\" value=\"rtsp\" ").concat(((_currentConfig4 = currentConfig) === null || _currentConfig4 === void 0 ? void 0 : _currentConfig4.sourceType) === 'rtsp' ? 'checked' : '', "/> RTSP</label>\n          <label><input type=\"radio\" name=\"sourceType\" value=\"video\" ").concat(((_currentConfig5 = currentConfig) === null || _currentConfig5 === void 0 ? void 0 : _currentConfig5.sourceType) === 'video' ? 'checked' : 'checked', "/> Video file</label>\n        </div>\n\n        <label>Camera ID</label>\n        <input name=\"cameraId\" type=\"text\" placeholder=\"cam1\" value=\"").concat(((_currentConfig6 = currentConfig) === null || _currentConfig6 === void 0 ? void 0 : _currentConfig6.cameraId) || 'cam1', "\" required />\n\n        <label>USB source (Linux v4l2 v\xED d\u1EE5: /dev/video0, Windows dshow v\xED d\u1EE5: video=USB Camera)</label>\n        <input name=\"usbSource\" type=\"text\" placeholder=\"/dev/video0\" value=\"").concat(((_currentConfig7 = currentConfig) === null || _currentConfig7 === void 0 ? void 0 : _currentConfig7.usbSource) || '', "\" />\n\n        <label>RTSP URL</label>\n        <input name=\"rtspUrl\" type=\"url\" placeholder=\"rtsp://user:pass@ip:554/Streaming/Channels/101\" value=\"").concat(((_currentConfig8 = currentConfig) === null || _currentConfig8 === void 0 ? void 0 : _currentConfig8.rtspUrl) || '', "\" />\n\n        <label>Video file (n\u1EBFu ch\u1ECDn Video)</label>\n        <input name=\"videoFile\" type=\"file\" accept=\"video/*\" />\n        <div class=\"hint\">File hi\u1EC7n t\u1EA1i: ").concat((_currentConfig9 = currentConfig) !== null && _currentConfig9 !== void 0 && _currentConfig9.videoPath ? currentConfig.videoPath : 'chưa có', " </div>\n\n        <label>FPS mong mu\u1ED1n</label>\n        <input name=\"fps\" type=\"text\" placeholder=\"1\" value=\"").concat(((_currentConfig0 = currentConfig) === null || _currentConfig0 === void 0 ? void 0 : _currentConfig0.fps) || '1', "\" />\n      </fieldset>\n\n      <div class=\"row\">\n        <button type=\"submit\">Start/Restart</button>\n        <button type=\"button\" onclick=\"stopPipeline()\">Stop</button>\n      </div>\n    </form>\n  </body>\n</html>"));
});

// Bắt đầu pipeline
app.post("/start", upload.single("videoFile"), /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(req, res) {
    var _currentConfig1, socketUrl, apiKey, sourceType, cameraId, usbSource, rtspUrl, fps, videoPath, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          socketUrl = (req.body.socketUrl || "").trim();
          apiKey = (req.body.apiKey || "").trim();
          sourceType = (req.body.sourceType || "video").trim();
          cameraId = (req.body.cameraId || "cam1").trim();
          usbSource = (req.body.usbSource || "").trim();
          rtspUrl = (req.body.rtspUrl || "").trim();
          fps = String(req.body.fps || "1").trim();
          videoPath = ((_currentConfig1 = currentConfig) === null || _currentConfig1 === void 0 ? void 0 : _currentConfig1.videoPath) || null;
          if (!(sourceType === "video")) {
            _context.n = 2;
            break;
          }
          if (!(req.file && req.file.path)) {
            _context.n = 1;
            break;
          }
          videoPath = req.file.path;
          _context.n = 2;
          break;
        case 1:
          if (videoPath) {
            _context.n = 2;
            break;
          }
          return _context.a(2, res.status(400).send("Vui lòng upload file video."));
        case 2:
          // Lưu cấu hình
          currentConfig = {
            socketUrl: socketUrl,
            apiKey: apiKey,
            sourceType: sourceType,
            cameraId: cameraId,
            usbSource: usbSource,
            rtspUrl: rtspUrl,
            fps: fps,
            videoPath: videoPath
          };

          // Restart pipeline
          _context.n = 3;
          return stopPipeline();
        case 3:
          _context.n = 4;
          return startPipeline(currentConfig);
        case 4:
          res.redirect("/");
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
          console.error(_t);
          res.status(500).send("Lỗi khi start pipeline");
        case 6:
          return _context.a(2);
      }
    }, _callee, null, [[0, 5]]);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

// Dừng pipeline
app.post("/stop", /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_req, res) {
    var _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          _context2.n = 1;
          return stopPipeline();
        case 1:
          res.status(200).send("stopped");
          _context2.n = 3;
          break;
        case 2:
          _context2.p = 2;
          _t2 = _context2.v;
          res.status(500).send("error stopping");
        case 3:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 2]]);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
app.listen(PORT, '0.0.0.0', function () {
  console.log("Config UI running at http://localhost:".concat(PORT));
});

// ---------------- Core logic ----------------
function buildFfmpegArgs(config) {
  var desiredFps = config.fps && Number(config.fps) > 0 ? String(config.fps) : "1";
  if (config.sourceType === "usb") {
    // Linux: v4l2, Windows: dshow (người dùng điền đúng chuỗi thiết bị)
    // Thử v4l2 trước, người dùng có thể sửa nếu cần
    var src = config.usbSource || "/dev/video0";
    var isWindows = process.platform === "win32";
    return isWindows ? ["-f", "dshow", "-i", src, "-vf", "fps=".concat(desiredFps), "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"] : ["-f", "v4l2", "-i", src, "-vf", "fps=".concat(desiredFps), "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
  }
  if (config.sourceType === "rtsp") {
    var _src = config.rtspUrl;
    return ["-rtsp_transport", "tcp", "-i", _src, "-vf", "fps=".concat(desiredFps), "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
  }

  // video file
  return ["-re", "-stream_loop", "-1", "-i", config.videoPath, "-vf", "fps=".concat(desiredFps), "-vcodec", "mjpeg", "-f", "image2pipe", "pipe:1"];
}
function startPipeline(_x5) {
  return _startPipeline.apply(this, arguments);
}
function _startPipeline() {
  _startPipeline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(config) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, new Promise(function (resolve, reject) {
            try {
              // Kết nối socket
              socket = io(config.socketUrl, {
                transports: ["websocket"],
                auth: config.apiKey ? {
                  apiKey: config.apiKey
                } : undefined
              });
              var args = buildFfmpegArgs(config);
              ffmpeg = spawn("ffmpeg", args);
              ffmpeg.stdout.on("data", function (chunk) {
                var payload = {
                  cameraId: config.cameraId,
                  frame: chunk.toString("base64")
                };
                if (config.apiKey) payload.apiKey = config.apiKey;
                socket.emit("camera_frame", payload);
              });
              ffmpeg.stderr.on("data", function (data) {
                var msg = data.toString();
                if (!msg.includes("frame=")) {
                  console.error("ffmpeg:", msg);
                }
              });
              ffmpeg.on("spawn", function () {
                console.log("ffmpeg started", args.join(" "));
                resolve();
              });
              ffmpeg.on("close", function (code) {
                console.log("ffmpeg exited:", code);
              });
            } catch (e) {
              reject(e);
            }
          }));
      }
    }, _callee3);
  }));
  return _startPipeline.apply(this, arguments);
}
function stopPipeline() {
  return _stopPipeline.apply(this, arguments);
}
function _stopPipeline() {
  _stopPipeline = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          // Đóng ffmpeg
          if (ffmpeg && !ffmpeg.killed) {
            try {
              ffmpeg.kill("SIGTERM");
            } catch (_) {}
          }
          ffmpeg = null;

          // Đóng socket
          if (socket && socket.connected) {
            try {
              socket.disconnect();
            } catch (_) {}
          }
          socket = null;
        case 1:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return _stopPipeline.apply(this, arguments);
}