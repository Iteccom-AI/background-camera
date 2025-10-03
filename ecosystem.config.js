module.exports = {
  apps: [
    {
      name: "background-camera",
      cwd: "/media/jiduy/workplace/data/ai-drowning-realtime/background-camera",
      script: "dist/app.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 4000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000
      },
      max_memory_restart: "300M",
      time: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};

