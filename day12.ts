import { Day } from './tools/day.ts';

const MAX_WIDTH = 150;

class Input {
  mask: string[];
  counts: number[];
  memoize: number[];

  constructor(mask: string[], counts: number[]) {
    this.mask = mask;
    this.counts = counts;
    this.memoize = [];
  }

  private makeKey(maskIndex: number, countIndex: number, current: number): number {
    const key = (current * MAX_WIDTH + maskIndex) * MAX_WIDTH + countIndex;
    return key;
  }

  private hasMore(idx: number, expect: string = '#'): boolean {
    for (let i = idx; i < this.mask.length; i++) {
      if (this.mask[i] === expect) {
        return true;
      }
    }
    return false;
  }

  private resolve(maskIndex: number, countIndex: number, current: number): number {
    if (countIndex === this.counts.length) {
      return current || this.hasMore(maskIndex) ? 0 : 1;
    } else if (maskIndex === this.mask.length) {
      return 0;
    }

    const expected = this.counts[countIndex];

    if (current > expected) {
      return 0;
    }

    const key = this.makeKey(maskIndex, countIndex, current);
    if (this.memoize[key] !== undefined) {
      return this.memoize[key];
    }

    const next = this.mask[maskIndex];
    let total = 0;

    if (next === '.') {
      if (current) {
        if (current !== expected) {
          this.memoize[key] = 0;
          return 0;
        } else {
          total = this.resolve(maskIndex + 1, countIndex + 1, 0);
          this.memoize[key] = total;
          return total;
        }
      } else {
        total = this.resolve(maskIndex + 1, countIndex, 0);
        this.memoize[key] = total;
        return total;
      }
    }
    if (next === '#') {
      total = this.resolve(maskIndex + 1, countIndex, current + 1);
      this.memoize[key] = total;
      return total;
    } else if (next === '?') {
      if (expected === current) {
        // as to be dot
        total = this.resolve(maskIndex + 1, countIndex + 1, 0);
      } else {
        total = 0;
        if (!current) {
          // try .
          total += this.resolve(maskIndex + 1, countIndex, 0);
        }
        // try #
        total += this.resolve(maskIndex + 1, countIndex, current + 1);
      }
      this.memoize[key] = total;
      return total;
    } else {
      this.memoize[key] = 0;
      return 0;
    }
  }

  unfold() {
    this.mask = [...this.mask, '?', ...this.mask, '?', ...this.mask, '?', ...this.mask, '?', ...this.mask];
    this.counts = [...this.counts, ...this.counts, ...this.counts, ...this.counts, ...this.counts];
  }

  solve(unfold: boolean): number {
    const oldMask = this.mask;
    const oldCounts = this.counts;
    if (unfold) {
      this.unfold();
    }

    let total;
    this.memoize = [];

    if (this.mask[this.mask.length - 1] !== '.') {
      this.mask.push('.');
      total = this.resolve(0, 0, 0);
      this.mask.pop();
    } else {
      total = this.resolve(0, 0, 0);
    }

    this.counts = oldCounts;
    this.mask = oldMask;
    return total;
  }
}

export class Day12 extends Day {
  constructor() {
    super(12);
  }

  loadInput(): Input[] {
    const lines = this.readDataFile();
    const input: Input[] = lines.map(line => {
      const [m, v] = line.split(' ');
      const mask = m.split('');
      const counts: number[] = v.split(',').map(v => +v);
      return new Input(mask, counts);
    });

    return input;
  }

  part1(inputs: Input[]): number {
    const counts = inputs.map(input => input.solve(false));
    const answer = counts.reduce((a: number, c: number) => a + c, 0);
    return answer;
  }

  part2(inputs: Input[]): number {
    const counts = inputs.map(input => input.solve(true));
    const answer = counts.reduce((a: number, c: number) => a + c, 0);
    return answer;
  }
}

// new Day12().execute();
