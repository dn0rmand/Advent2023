import { Day } from "./tools/day.ts";

type Data = { id: number; winning: Set<number>; numbers: number[]; count: number };

export class Day4 extends Day {
  constructor() {
    super(4);
  }

  parseNumbers(line: string, regex: RegExp): number[] {
    let matches = line.match(regex);
    if (matches == null) {
      return [];
    }
    const numbers = matches[0]
      .trim()
      .split(/\s+/)
      .map((d) => +d);
    if (numbers.includes(0)) {
      return numbers;
    }
    return numbers;
  }

  loadInput(): Data[] {
    const input: Data[] = [];

    for (const line of this.readDataFile()) {
      const id = +(line.match(/(?<=Card\s*)\d+(?=:\s)/) || [0])[0];
      const numbers = this.parseNumbers(line, /(?<=\|)(\s+\d+)+/g);
      const winning = this.parseNumbers(line, /(?<=:)(\s+\d+)+(?=\s+|)/g).reduce((a: Set<number>, d: any) => {
        a.add(+d);
        return a;
      }, new Set<number>());
      input.push({ id, winning, numbers, count: 1 });
    }
    return input;
  }

  part1(input: Data[]): number {
    let total = 0;
    for (const { winning, numbers } of input) {
      const score = numbers.reduce((a, v) => (winning.has(v) ? (a ? a * 2 : 1) : a), 0);
      total += score;
    }
    return total;
  }

  part2(input: Data[]): number {
    let total = 0;
    for (let i = 0; i < input.length; i++) {
      const { winning, numbers, count } = input[i];
      total += count;

      const score = numbers.reduce((a, v) => a + (winning.has(v) ? 1 : 0), 0);
      for (let j = 1; i + j < input.length && j <= score; j++) {
        input[i + j].count += count;
      }
    }

    return total;
  }
}

// new Day4().execute();
