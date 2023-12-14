import { Day } from './tools/day.ts';

export class Day25 extends Day {
  constructor() {
    super(25);
  }

  loadInput(): string[] {
    return this.readDataFile();
  }

  part1(input: string[]): number {
    return 0;
  }

  part2(input: string[]): string {
    return 'Merry Christmas';
  }
}

// new Day25().execute();
