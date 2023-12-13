import { Day } from './tools/day.ts';

type Input = {
  data: string[];
  width: number;
  height: number;
};

export class Day13 extends Day {
  smudges: number = 0;

  constructor() {
    super(13);
  }

  loadInput(): Input[] {
    const lines = this.readDataFile();
    const inputs: Input[] = [];
    let input: Input | undefined = undefined;

    for (const line of lines) {
      if (line.length > 0) {
        if (input === undefined) {
          input = { data: [line], width: line.length, height: 1 };
        } else {
          input.data.push(line);
          input.height++;
          if (line.length !== input.width) {
            throw 'Not right input';
          }
        }
      } else if (input !== undefined) {
        inputs.push(input);
        input = undefined;
      }
    }
    if (input !== undefined) {
      inputs.push(input);
    }
    return inputs;
  }

  isMatchColumn(input: Input, x1: number, x2: number): number {
    let smudges = 0;
    for (let y = 0; y < input.height; y++) {
      const c1 = input.data[y][x1];
      const c2 = input.data[y][x2];
      if (c1 !== c2) {
        smudges++;
        if (smudges > this.smudges) {
          break;
        }
      }
    }
    return smudges;
  }

  isMatchRow(input: Input, y1: number, y2: number): number {
    let smudges = 0;
    for (let x = 0; x < input.width; x++) {
      const c1 = input.data[y1][x];
      const c2 = input.data[y2][x];
      if (c1 !== c2) {
        smudges++;
        if (smudges > this.smudges) {
          break;
        }
      }
    }
    return smudges;
  }

  findVerticalMirror(input: Input): number {
    let xr, xl;

    xr = input.width - 1;
    let start = xr % 2 ? 0 : 1;
    for (xl = start; xl < xr; xl += 2) {
      let smudges = this.isMatchColumn(input, xl, xr);
      if (smudges <= this.smudges) {
        for (let x1 = xl + 1, x2 = xr - 1; x1 < x2; x1++, x2--) {
          smudges += this.isMatchColumn(input, x1, x2);
          if (smudges > this.smudges) {
            break;
          }
        }
        if (smudges === this.smudges) {
          return Math.floor((xl + xr) / 2);
        }
      }
    }

    xl = 0;
    for (let xr = input.width - 1 - start; xr > xl; xr -= 2) {
      let smudges = this.isMatchColumn(input, xl, xr);
      if (smudges <= this.smudges) {
        for (let x1 = xl + 1, x2 = xr - 1; x1 < x2; x1++, x2--) {
          smudges += this.isMatchColumn(input, x1, x2);
          if (smudges > this.smudges) {
            break;
          }
        }
        if (smudges === this.smudges) {
          return Math.floor((xl + xr) / 2);
        }
      }
    }

    return -1;
  }

  findHorizontalMirror(input: Input): number {
    let yu, yd;

    yd = input.height - 1;
    let start = yd % 2 ? 0 : 1;

    for (yu = start; yu < yd; yu += 2) {
      let smudges = this.isMatchRow(input, yu, yd);
      if (smudges <= this.smudges) {
        for (let y1 = yu + 1, y2 = yd - 1; y1 < y2; y1++, y2--) {
          smudges += this.isMatchRow(input, y1, y2);
          if (smudges > this.smudges) {
            break;
          }
        }
        if (smudges === this.smudges) {
          return Math.floor((yu + yd) / 2);
        }
      }
    }

    yu = 0;
    for (yd = input.height - 1 - start; yd > yu; yd -= 2) {
      let smudges = this.isMatchRow(input, yu, yd);
      if (smudges <= this.smudges) {
        for (let y1 = yu + 1, y2 = yd - 1; y1 < y2; y1++, y2--) {
          smudges += this.isMatchRow(input, y1, y2);
          if (smudges > this.smudges) {
            break;
          }
        }
        if (smudges === this.smudges) {
          return Math.floor((yu + yd) / 2);
        }
      }
    }
    return -1;
  }

  findMirrors(input: Input): number {
    const x = this.findVerticalMirror(input);

    if (x >= 0) {
      return x + 1;
    }

    const y = this.findHorizontalMirror(input);

    if (y >= 0) {
      return 100 * (y + 1);
    }

    throw 'No Mirror found';
  }

  part1(inputs: Input[]): number {
    this.smudges = 0;

    const answer = inputs.reduce((sum, input) => sum + this.findMirrors(input), 0);
    return answer;
  }

  part2(inputs: Input[]): number {
    this.smudges = 1;

    const answer = inputs.reduce((sum, input) => sum + this.findMirrors(input), 0);
    return answer;
  }
}

// new Day13().execute();
