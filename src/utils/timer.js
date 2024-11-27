import chalk from 'chalk';
import { performance } from 'perf_hooks';

/**
 * Class for tracking and reporting execution times of operations
 */
class Timer {
  /**
   * Creates a new Timer instance
   */
  constructor() {
    /**
     * Storage for timing data
     * @type {Object.<string, {start: number, end?: number, elapsed?: number}>}
     * @private
     */
    this.timings = {};
  }

  /**
   * Starts timing for a labeled operation
   * @param {string} label - Identifier for the operation being timed
   */
  start(label) {
    this.timings[label] = { start: performance.now() };
  }

  /**
   * Ends timing for a labeled operation and logs the elapsed time
   * @param {string} label - Identifier for the operation being timed
   * @throws {Warning} If no start time was found for the label
   */
  end(label) {
    if (this.timings[label] && this.timings[label].start) {
      const end = performance.now();
      const elapsed = end - this.timings[label].start;
      this.timings[label].end = end;
      this.timings[label].elapsed = elapsed;
      const formattedTime = this.formatTime(elapsed);
      // eslint-disable-next-line no-console
      console.log(`${chalk.grey(label)}: ${formattedTime}`);
    } else {
      console.warn(`No start time found for label: ${label}`);
    }
  }

  /**
   * Formats milliseconds into a human-readable string
   * @param {number} milliseconds - Time in milliseconds to format
   * @returns {string} Formatted time string (e.g., "1m 30.00s" or "1.500s")
   * @private
   */
  formatTime(milliseconds) {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${seconds.toFixed(2)}s`;
    } else {
      return `${seconds.toFixed(3)}s`;
    }
  }

  /**
   * Generates a report of all completed timings
   * @returns {Object.<string, {start: number, end: number, elapsed: number, formattedElapsed: string}>}
   */
  getReport() {
    const formattedTimings = {};
    for (const label in this.timings) {
      if (this.timings[label].elapsed) {
        formattedTimings[label] = {
          ...this.timings[label],
          formattedElapsed: this.formatTime(this.timings[label].elapsed)
        };
      }
    }
    return formattedTimings;
  }
}

/**
 * Singleton instance of Timer
 * @type {Timer}
 */
export default new Timer();
