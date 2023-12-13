import { Day } from './tools/day.ts';
import { Uint46Array } from './tools/Uint46Array.ts';

const MAX_WIDTH = 150;
const MAX_KEY = 16000;

const $memoize = new Uint46Array(MAX_KEY);

class Input {
  mask: string[];
  counts: number[];

  constructor(mask: string[], counts: number[]) {
    this.mask = mask;
    this.counts = counts;
  }

  private makeKey(maskIndex: number, countIndex: number): number {
    const key = maskIndex * MAX_WIDTH + countIndex;
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

  private resolve(maskIndex: number, countIndex: number): number {
    if (countIndex >= this.counts.length) {
      if (this.hasMore(maskIndex)) {
        return 0;
      }
      return 1;
    }

    let key = this.makeKey(maskIndex, countIndex, 0);
    let total = $memoize.get(key);

    if (total !== undefined) {
      return total;
    }

    while (maskIndex < this.mask.length && this.mask[maskIndex] === '.') {
      maskIndex++;
    }

    const nextCount = this.counts[countIndex];

    if (maskIndex + nextCount >= this.mask.length) {
      return $memoize.set(key, 0);
    }

    if (this.mask[maskIndex] === '#') {
      if (maskIndex + nextCount >= this.mask.length) {
        return $memoize.set(key, 0);
      }
      if (this.mask[maskIndex + nextCount] === '#') {
        return $memoize.set(key, 0);
      }
      for (let l = 0; l < nextCount; l++) {
        if (this.mask[maskIndex + l] === '.') {
          return $memoize.set(key, 0);
        }
      }
      return $memoize.set(key, this.resolve(maskIndex + nextCount + 1, countIndex + 1));
    } else if (this.mask[maskIndex] === '?') {
      let total = 0;
      // Assume a #
      if (maskIndex + nextCount >= this.mask.length) {
        total = 0;
      } else if (this.mask[maskIndex + nextCount] === '#') {
        total = 0;
      } else {
        total = 1;
        for (let l = 0; l < nextCount; l++) {
          if (this.mask[maskIndex + l] === '.') {
            total = 0;
            break;
          }
        }
        if (total) {
          total = this.resolve(maskIndex + nextCount + 1, countIndex + 1);
        }
      }

      return $memoize.set(key, total + this.resolve(maskIndex + 1, countIndex));
    } else {
      throw new Error('Should not get here');
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

    $memoize.clear();

    if (this.mask[this.mask.length - 1] !== '.') {
      this.mask.push('.');
      total = this.resolve(0, 0);
      this.mask.pop();
    } else {
      total = this.resolve(0, 0);
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
    const x = inputs[1].solve(true);

    const counts = inputs.map(input => input.solve(true));
    const answer = counts.reduce((a: number, c: number) => a + c, 0);
    return answer;
  }
}

new Day12().execute();
