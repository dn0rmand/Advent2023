import { Day } from "./tools/day.ts";

type Input = {
  time: number;
  distance: number;
};

export class Day6 extends Day {
  constructor() {
    super(6);
  }

  loadInput(): Input[] {
    const lines = this.readDataFile();

    const timeStrings = lines[0].substring(5).trim().split(/\s+/);
    const distanceStrings = lines[1].substring(9).trim().split(/\s+/);

    const times = timeStrings.map((v) => +v);
    const distances = distanceStrings.map((v) => +v);

    if (times.length !== distances.length) {
      throw "Invalid input";
    }

    return times.map((t, i) => ({ time: t, distance: distances[i] }));
  }

  isWin(t: number, time: number, distance: number): boolean {
    const d = (time - t) * t;
    return d > distance;
  }

  quickSearch(min, max, time, distance, direction: number): number {
    if (min === max) {
      if (this.isWin(min, time, distance) && !this.isWin(min + direction, time, distance)) {
        return min;
      }
      if (!this.isWin(min, time, distance) && this.isWin(min - direction, time, distance)) {
        return min - direction;
      }
      throw "Error";
    }

    while (min < max) {
      const middle = Math.floor((min + max) / 2);
      if (this.isWin(middle, time, distance)) {
        if (direction > 0) {
          min = middle + 1;
        } else {
          max = middle - 1;
        }
      } else {
        if (direction > 0) {
          max = middle - 1;
        } else {
          min = middle + 1;
        }
      }
    }

    min = Math.max(min, max);
    if (this.isWin(min, time, distance) && !this.isWin(min + direction, time, distance)) {
      return min;
    }
    if (!this.isWin(min, time, distance) && this.isWin(min - direction, time, distance)) {
      return min - direction;
    }
    throw "Error";
  }

  getWins(time: number, distance: number): number {
    const middle = Math.floor(time / 2);
    if (!this.isWin(middle, time, distance)) {
      throw "error";
    }
    const min = this.quickSearch(1, middle - 1, time, distance, -1);
    const max = this.quickSearch(middle + 1, time - 1, time, distance, 1);

    return max - min + 1;
  }

  part1(input: Input[]): number {
    const total = input.reduce((total, { time, distance }) => total * this.getWins(time, distance), 1);
    return total;
  }

  part2(input: Input[]): number {
    const time = +input.reduce((a, { time }) => `${a}${time}`, "");
    const distance = +input.reduce((a, { distance }) => `${a}${distance}`, "");
    return this.getWins(time, distance);
  }
}

// new Day6().execute();
