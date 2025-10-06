const dotenv = require("dotenv");
dotenv.config();

const envConfig = {
  port: parseInt(process.env.PORT || "3001", 10),
  socketUrl: process.env.SOCKET_URL || "http://localhost:4000",
  apiKey: process.env.API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
};

module.exports = { envConfig };
