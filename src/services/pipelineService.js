// Pipeline orchestration service
const socketService = require('./socketService');
const ffmpegService = require('./ffmpegService');

class PipelineService {
  constructor() {
    this.isRunning = false;
  }

  async start(config) {
    try {
      await this.stop(); // Ensure clean state
      
      console.log('Starting pipeline with config:', config);
      
      // Connect to socket server
      await socketService.connect(config);
      
      // Start FFmpeg process
      await ffmpegService.start(config, (payload) => {
        socketService.emitFrame(payload);
      });
      
      this.isRunning = true;
      console.log('Pipeline started successfully');
      
    } catch (error) {
      console.error('Error starting pipeline:', error);
      await this.stop(); // Clean up on error
      throw error;
    }
  }

  async stop() {
    try {
      console.log('Stopping pipeline...');
      
      // Stop FFmpeg
      ffmpegService.stop();
      
      // Disconnect socket
      socketService.disconnect();
      
      this.isRunning = false;
      console.log('Pipeline stopped');
      
    } catch (error) {
      console.error('Error stopping pipeline:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      socketConnected: socketService.getConnectionStatus(),
      ffmpegRunning: ffmpegService.getStatus().isRunning
    };
  }
}

module.exports = new PipelineService();
