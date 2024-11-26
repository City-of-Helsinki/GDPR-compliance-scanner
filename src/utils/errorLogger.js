import fs from 'fs';
import path from 'path';

class ErrorLogger {
  constructor() {
    this.logDir = './logs';
    this.logFile = path.join(this.logDir, 'scan-errors.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  logError(context, error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context}\nError: ${error.message}\nStack: ${error.stack}\n\n`;

    fs.appendFileSync(this.logFile, errorMessage);
  }
}

export const errorLogger = new ErrorLogger();
