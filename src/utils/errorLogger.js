import fs from 'fs';
import path from 'path';

/**
 * Class for logging errors to a file during scanning operations
 */
class ErrorLogger {
  /**
   * Creates an instance of ErrorLogger
   * Initializes log directory and file paths
   */
  constructor() {
    this.logDir = './logs';
    this.logFile = path.join(this.logDir, 'scan-errors.log');

    this.ensureLogDirectory();
  }

  /**
   * Ensures the log directory exists, creates it if it doesn't
   * @private
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  /**
   * Logs an error with context to the error log file
   * @param {string} context - Description of where/when the error occurred
   * @param {Error} error - The error object to log
   */
  logError(context, error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context}\nError: ${error.message}\nStack: ${error.stack}\n\n`;

    fs.appendFileSync(this.logFile, errorMessage);
  }
}

/**
 * Singleton instance of ErrorLogger
 * @type {ErrorLogger}
 */
export const errorLogger = new ErrorLogger();
