import chalk from 'chalk';
import { performance } from 'perf_hooks';

class Timer {
  constructor() {
    this.timings = {};
  }

  start(label) {
    this.timings[label] = { start: performance.now() };
  }

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

export default new Timer();
