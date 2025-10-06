const configManager = require("../config/config");

class ConfigService {
    constructor() {
        this.config = configManager.getConfig();
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
        configManager.setConfig(this.config);
        return configManager.getConfig();
    }

    getConfig() {
        configManager.setConfig(this.config);
        return configManager.getConfig();
    }
}

module.exports = new ConfigService();