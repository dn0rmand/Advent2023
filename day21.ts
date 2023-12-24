import { Day } from './tools/day.ts';
import { Point } from './tools/geometry.ts';

type GardenMap = {
  map: boolean[][];
  start: Point;
  width: number;
  height: number;
  size: number;
};

const BLOCK_OFFSET = 2;
const BLOCK_COUNT = 5;

class Solver {
  map: boolean[][];
  width: number;
  height: number;
  steps: number;
  states: Map<number, Point>;
  newStates: Map<number, Point>;
  blocks: Uint16Array[];
  size: number;

  constructor(garden: GardenMap, steps: number) {
    this.states = new Map();
    this.newStates = new Map();
    this.blocks = [];
    this.size = garden.size;
    this.steps = steps;

    this.map = garden.map;
    this.width = garden.width;
    this.height = garden.height;

    this.states.set(0, garden.start);
  }

  add(x: number, y: number) {
    const x0 = ((x % this.width) + this.width) % this.width;
    const y0 = ((y % this.height) + this.height) % this.height;

    const kx = BLOCK_OFFSET + Math.floor(x / this.width);
    const ky = BLOCK_OFFSET + Math.floor(y / this.height);

    if (this.map[y0][x0]) {
      const key = x + 300 + (y + 300) * 1000;

      if (!this.newStates.has(key)) {
        this.newStates.set(key, { x, y });

        if (kx >= 0 && kx < BLOCK_COUNT && ky >= 0 && ky < BLOCK_COUNT) {
          let r = this.blocks[ky];
          if (!r) {
            r = this.blocks[ky] = new Uint16Array(BLOCK_COUNT);
          }
          r[kx] = (r[kx] || 0) + 1;
        }
      }
    }
  }

  solve(): number {
    for (let step = 1; step <= this.steps; step++) {
      this.newStates.clear();
      this.blocks = [];

      for (const { x, y } of this.states.values()) {
        this.add(x, y - 1);
        this.add(x, y + 1);
        this.add(x - 1, y);
        this.add(x + 1, y);
      }

      [this.states, this.newStates] = [this.newStates, this.states];
    }

    return this.states.size;
  }

  calculate(steps: number): number {
    let x = (steps - 65) / 131;

    const A = this.blocks[2][0] + this.blocks[2][4] + this.blocks[0][2] + this.blocks[4][2];
    const B = this.blocks[0][1] + this.blocks[0][3] + this.blocks[4][1] + this.blocks[4][3];
    const C = this.blocks[1][1] + this.blocks[1][3] + this.blocks[3][3] + this.blocks[3][1];

    const k1 = this.blocks[2][1];
    const k2 = this.blocks[2][2];

    let answer = A + x * B + (x - 1) * C;

    let k = k1;
    while (--x) {
      answer += x * 4 * k;
      k = k === k1 ? k2 : k1;
    }
    answer += k;

    return answer;
  }
}

export class Day21 extends Day {
  constructor() {
    super(21);
  }

  loadInput(): GardenMap {
    let start: Point = { x: 0, y: 0 };
    let size = 0;
    const map = this.readDataFile().map((l: string, y: number) =>
      l.split('').map((c: string, x: number) => {
        if (c === 'S') {
          start = { x, y };
          size++;
          return true;
        }
        if (c === '.') {
          size++;
          return true;
        }
        return false;
      })
    );

    return { map, start, height: map.length, width: map[0].length, size };
  }

  part1(input: GardenMap): number {
    return new Solver(input, 64).solve();
  }

  part2(input: GardenMap): number {
    const steps = 26501365;
    const solver = new Solver(input, 327);

    solver.solve();

    const answer = solver.calculate(steps);
    return answer;
  }
}

// new Day21().execute();
