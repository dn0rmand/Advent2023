import { Day } from './tools/day.ts';

type Point = {
  x: number;
  y: number;
};

type PointMap = Map<number, Point>;

type GardenMap = {
  map: boolean[][];
  start: Point;
  width: number;
  height: number;
  size: number;
};

class Solver {
  map: boolean[][];
  width: number;
  height: number;
  steps: number;
  states: Map<number, Point>;
  newStates: Map<number, Point>;
  size: number;

  constructor(garden: GardenMap, steps: number) {
    this.states = new Map<number, Point>();
    this.newStates = new Map<number, Point>();
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

    if (this.map[y0][x0]) {
      const key = x + 300 + (y + 300) * 1000;
      this.newStates.set(key, { x, y });
    }
  }

  solve() {
    for (let step = 1; step <= this.steps; step++) {
      this.newStates.clear();

      for (const { x, y } of this.states.values()) {
        this.add(x, y - 1);
        this.add(x, y + 1);
        this.add(x - 1, y);
        this.add(x + 1, y);
      }

      [this.states, this.newStates] = [this.newStates, this.states];
    }
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

  part1Add(input: GardenMap, visited: Set<number>, states: PointMap, x: number, y: number, remaining: number) {
    if (x < 0 || y < 0 || y >= input.height || x >= input.width) {
      return;
    }

    if (input.map[y][x]) {
      const key = x + input.width * y;
      if (visited.has(key)) {
        return;
      }
      if (remaining % 2 === 0) {
        visited.add(key);
      }
      states.set(key, { x, y });
    }
  }

  part1Moves(input: GardenMap, steps: number): number {
    let states: PointMap = new Map();
    let newStates: PointMap = new Map();

    states.set(0, input.start);

    const visited = new Set<number>();

    for (let i = 1; states.size && i <= steps; i++) {
      newStates.clear();
      for (const { x, y } of states.values()) {
        const key = x + y * input.width;
        this.part1Add(input, visited, newStates, x, y - 1, steps - i);
        this.part1Add(input, visited, newStates, x, y + 1, steps - i);
        this.part1Add(input, visited, newStates, x - 1, y, steps - i);
        this.part1Add(input, visited, newStates, x + 1, y, steps - i);
      }
      [states, newStates] = [newStates, states];
    }
    let total = visited.size;
    states.forEach((_, key) => {
      if (!visited.has(key)) {
        total++;
      }
    });
    return total;
  }

  part1(input: GardenMap): number {
    return this.part1Moves(input, 64);
  }

  dump(step: number, input: GardenMap, states: Map<number, PointMap>): string {
    // console.log(`--- STEP: ${step} ---`);
    let data: string[] = [];
    for (let y = 0; y < input.height; y++) {
      for (let x = 0; x < input.width; x++) {
        const k = `${x}:${y}`;
        if (states.has(k)) {
          data.push('O');
        } else if (input.map[y][x]) {
          data.push('.');
        } else {
          data.push('#');
        }
      }
      // console.log(l.join(''));
    }
    return data.join('');
  }

  part2Add(input: GardenMap, visited: Set<string>, states: Map<string, Point>, x: number, y: number, remaining: number) {
    const x0 = ((x % input.width) + input.width) % input.width;
    const y0 = ((y % input.height) + input.height) % input.height;

    const kx = Math.floor(x / input.width);
    const ky = Math.floor(y / input.height);

    if (input.map[y0][x0]) {
      const key = `${x}:${y}`;

      if (visited.has(key)) {
        return;
      }
      if (remaining % 2 === 0) {
        visited.add(key);
      }
      states.set(key, { x, y });
    }
  }

  part2Moves(input: GardenMap, steps: number): number {
    let states = new Map<string, Point>();
    let newStates = new Map<string, Point>();

    states.set('0', input.start);

    const visited = new Set<string>();

    // const freqs = new Map<string, number>();

    for (let i = 1; states.size && i <= steps; i++) {
      newStates.clear();
      for (const { x, y } of states.values()) {
        this.part2Add(input, visited, newStates, x, y - 1, steps - i);
        this.part2Add(input, visited, newStates, x, y + 1, steps - i);
        this.part2Add(input, visited, newStates, x - 1, y, steps - i);
        this.part2Add(input, visited, newStates, x + 1, y, steps - i);
      }
      [states, newStates] = [newStates, states];
      // const key = this.dump(i, input, states);
      // if (freqs.has(key)) {
      //   const o = freqs.get(key) || 0;
      //   console.log(i - o, o);
      // }
      // freqs.set(key, i);
    }

    let total = visited.size;
    states.forEach((_, key) => {
      if (!visited.has(key)) {
        total++;
      }
    });
    return total;
  }

  part2(input: GardenMap): number {
    const steps = 26501365;

    let x = (steps - 65) / 131;
    let answer = 2 * 5846 + 5869 + 5823 + x * (996 + 990 + 978 + 977) + (x - 1) * (6813 + 6804 + 6790 + 6781);
    let k = 7757;
    while (--x) {
      answer += x * 4 * k;
      k = k === 7757 ? 7748 : 7757;
    }
    answer += k;
    return answer;
  }
}

new Day21().execute();
