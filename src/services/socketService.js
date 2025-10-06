// Socket.IO service for camera communication
const io = require("socket.io-client");

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(config) {
    return new Promise((resolve, reject) => {
      try {
        this.disconnect(); // Disconnect existing connection if any

        this.socket = io(config.socketUrl, { 
          transports: ["websocket"], 
          auth: config.apiKey ? { apiKey: config.apiKey } : undefined 
        });

        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.isConnected = true;
          this.socket.emit('join_room', { room: config.cameraId, apiKey: config.apiKey });
          resolve();
        });

        this.socket.on('joined_room', (data) => {
          console.log(`Joined room: ${data.room}`);
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.isConnected = false;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  emitFrame(payload) {
    if (this.socket && this.isConnected) {
      this.socket.emit("camera_frame", payload);
    }
  }

  disconnect() {
    if (this.socket && this.isConnected) {
      try {
        this.socket.disconnect();
      } catch (error) {
        console.error('Error disconnecting socket:', error);
      }
    }
    this.socket = null;
    this.isConnected = false;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

module.exports = new SocketService();
