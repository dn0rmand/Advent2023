import { Day } from "./tools/day.ts";
import { Polynomial } from "./tools/polynomial.ts";

export class Day9 extends Day {
  constructor() {
    super(9);
  }

  loadInput(): Polynomial[] {
    const data = this.readDataFile().map((line) => line.split(" ").map((v) => +v));
    return data.map((values) => new Polynomial(values));
  }

  part1(input: Polynomial[]): number {
    const values = input.map((polynomial) => polynomial.get(polynomial.values.length));
    const answer = values.reduce((a, v) => a + v);
    return Number(answer);
  }

  part2(input: Polynomial[]): number {
    const values = input.map((polynomial) => polynomial.get(-1));
    const answer = values.reduce((a, v) => a + v);
    return Number(answer);
  }
}

// new Day9().execute();
