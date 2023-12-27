import { Day } from './tools/day.ts';
import { Point } from './tools/geometry.ts';
import { Console } from './tools/console.ts';

const WALL = '#'.charCodeAt(0);
const FREE = '.'.charCodeAt(0);
const DOWN = 'v'.charCodeAt(0);
const UP = '^'.charCodeAt(0);
const LEFT = '<'.charCodeAt(0);
const RIGHT = '>'.charCodeAt(0);

type Fork = {
  from: Point;
  to: Point;
  length: number;
  key: number;
};

type Input = {
  map: Uint8Array[];
  width: number;
  height: number;
  forkSet: Map<number, Fork>;
  forks: Fork[];
};

let VISITED_SIZE = 1;
let WIDTH = 0;
let HEIGHT = 0;

class BitArray {
  data: Uint8Array;

  private constructor() {}

  static fromSize(size: number) {
    const a = new BitArray();

    size = Math.ceil(size / 8);
    a.data = new Uint8Array(size);
    return a;
  }

  clone() {
    const a = new BitArray();
    a.data = Uint8Array.from(this.data);
    return a;
  }

  set(index: number) {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    this.data[idx] |= mask;
  }

  unset(index: number) {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    this.data[idx] = (this.data[idx] | mask) - mask;
  }

  isSet(index: number): boolean {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    return (this.data[idx] & mask) !== 0;
  }
}

class State {
  x: number;
  y: number;
  visited: BitArray;
  steps: number;

  private constructor() {}

  static getStart(input: Input): State {
    HEIGHT = input.height;
    WIDTH = input.width;
    VISITED_SIZE = HEIGHT * WIDTH;

    const s = new State();

    s.x = 1;
    s.y = 0;
    s.steps = 0;
    s.visited = BitArray.fromSize(VISITED_SIZE);
    s.visited.set(State.makeKey(1, 0));

    return s;
  }

  clone(x: number, y: number, steps: number = 1): State {
    const s = new State();
    s.x = x;
    s.y = y;
    s.steps = this.steps + 1;
    s.visited = this.visited.clone();
    s.visited.set(this.shortKey);
    return s;
  }

  static makeKey(x: number, y: number) {
    return x + y * WIDTH;
  }

  get shortKey() {
    return State.makeKey(this.x, this.y);
  }

  jump(input: Input, slippery: boolean): { x1: number; y1: number }[] {
    let choices: { x1: number; y1: number }[];

    let moved = false;
    while (true) {
      choices = [];
      for (const [ox, oy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]) {
        const x1 = this.x + ox;
        const y1 = this.y + oy;
        if (x1 < 0 || y1 < 0 || y1 >= input.height || x1 >= input.width) {
          continue;
        }
        const k = State.makeKey(x1, y1);
        if (this.visited.isSet(k)) {
          continue;
        }
        const c = input.map[y1][x1];
        if (c === WALL) {
          continue;
        }
        if (slippery && c !== FREE) {
          switch (c) {
            case RIGHT:
              if (ox !== -1) {
                choices.push({ x1, y1 });
              }
              break;
            case LEFT:
              if (ox !== 1) {
                choices.push({ x1, y1 });
              }
              break;
            case UP:
              if (oy !== 1) {
                choices.push({ x1, y1 });
              }
              break;
            case DOWN:
              if (oy !== -1) {
                choices.push({ x1, y1 });
              }
              break;
          }
        } else {
          choices.push({ x1, y1 });
        }
      }

      if (choices.length !== 1) {
        if (moved) {
          this.visited.set(this.shortKey);
        }
        return choices;
      }

      this.x = choices[0].x1;
      this.y = choices[0].y1;
      this.steps++;
      this.visited.set(this.shortKey);
      moved = true;
    }
  }

  moves(input: Input, slippery: boolean): State[] {
    let output: State[] = [];

    for (const { x1, y1 } of this.jump(input, slippery)) {
      const k = State.makeKey(x1, y1);
      if (this.visited.isSet(k)) {
        continue;
      }
      const c = input.map[y1][x1];
      if (c === WALL) {
        continue;
      }
      if (c === FREE || !slippery) {
        output.push(this.clone(x1, y1));
      } else {
        const s = this.clone(x1, y1);
        switch (c) {
          case RIGHT:
            s.x += 1;
            break;
          case LEFT:
            s.x -= 1;
            break;
          case UP:
            s.y -= 1;
            break;
          case DOWN:
            s.y += 1;
            break;
          default:
            throw 'Error';
        }
        if (!s.visited.isSet(s.shortKey)) {
          s.visited.set(s.shortKey);
          s.steps++;
          output.push(s);
        }
      }
    }

    return output;
  }
}

export class Day23 extends Day {
  constructor() {
    super(23);
  }

  loadInput(): Input {
    const map = this.readDataFile().map(l => {
      const r: number[] = l.split('').map(c => c.charCodeAt(0));
      return new Uint8Array(r);
    });

    const input = { map, width: map[0].length, height: map.length, forks: [], forkSet: new Map() };

    HEIGHT = input.height;
    WIDTH = input.width;
    VISITED_SIZE = HEIGHT * WIDTH;

    this.findForks(input, { x: 1, y: 0 }, { x: 1, y: 0 });
    return input;
  }

  addFork(input: Input, from: Point, to: Point, length: number): boolean {
    const key1 = (from.x + from.y * WIDTH) * VISITED_SIZE + (to.x + to.y * WIDTH);
    if (input.forkSet.has(key1)) {
      return false;
    }
    const key2 = (to.x + to.y * WIDTH) * VISITED_SIZE + (from.x + from.y * WIDTH);
    if (input.forkSet.has(key2)) {
      throw 'Error';
    }
    const key = input.forks.length / 2;

    const f1 = { from, to, key, length };
    const f2 = { from: to, to: from, key, length };

    input.forks.push(f1, f2);
    input.forkSet.set(key1, { from, to, key, length });
    input.forkSet.set(key2, { from: to, to: from, key, length });
    return true;
  }

  findForks(input: Input, where: Point, start: Point) {
    let previous = { ...start };
    let steps = 0;

    let { x, y } = where;
    if (previous.x !== x || previous.y !== y) {
      steps++;
    }

    while (true) {
      let choices: Point[] = [];
      for (const [ox, oy] of [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ]) {
        const x1 = x + ox;
        const y1 = y + oy;
        if (x1 < 0 || y1 < 0 || y1 >= input.height || x1 >= input.width) {
          continue;
        }
        if (x1 === previous.x && y1 === previous.y) {
          continue;
        }
        if (input.map[y1][x1] !== WALL) {
          choices.push({ x: x1, y: y1 });
        }
      }
      if (choices.length !== 1) {
        const end = { x, y };
        if (this.addFork(input, start, end, steps)) {
          for (const w of choices) {
            this.findForks(input, w, end);
          }
        }
        break;
      }

      steps++;

      previous = { x, y };
      x = choices[0].x;
      y = choices[0].y;
    }
  }

  walkPart1(input: Input) {
    let states: State[] = [State.getStart(input)];

    let target = { x: input.width - 2, y: input.height - 1 };
    let max = 0;

    while (states.length > 0) {
      let state = states.pop();
      if (!state) {
        continue;
      }
      const old = state.steps;
      let moves = state.moves(input, true);
      if (moves.length === 0 && old !== state.steps) {
        moves = [state];
      }

      for (const newState of moves) {
        if (newState.x === target.x && newState.y === target.y) {
          max = Math.max(max, newState.steps);
        } else {
          states.push(newState);
        }
      }
    }
    Console.eraseLine();
    return max;
  }

  maxPart2: number = 0;

  walkPart2(input: Input, steps: number, x: number, y: number, visitedForks: Uint8Array, visitedPoints: Uint8Array): number {
    if (x === input.width - 2 && y === input.height - 1) {
      if (steps > this.maxPart2) {
        this.maxPart2 = steps;
        Console.eraseLine();
        Console.write(`  ${this.maxPart2}`);
        Console.gotoSOL();
      }
      return steps;
    }

    const key = State.makeKey(x, y);
    if (visitedPoints[key]) {
      return 0;
    }

    const forks = input.forks.filter(f => {
      if (f.from.x !== x || f.from.y !== y) {
        return false;
      }
      if (visitedForks[f.key]) {
        return false;
      }
      if (visitedPoints[State.makeKey(f.to.x, f.to.y)]) {
        return false;
      }
      return true;
    });

    visitedPoints[key] = 1;

    let max = 0;
    for (let f of forks) {
      visitedForks[f.key] = 1;
      const d = this.walkPart2(input, steps + f.length, f.to.x, f.to.y, visitedForks, visitedPoints);
      max = Math.max(max, d);
      visitedForks[f.key] = 0;
    }

    visitedPoints[key] = 0;

    return max;
  }

  part1(input: Input): number {
    const answer = this.walkPart1(input);
    return answer;
  }

  part2(input: Input): number {
    const visitedPoints = new Uint8Array(VISITED_SIZE);
    const visitedForks = new Uint8Array(input.forks[input.forks.length - 1].key + 1);
    const answer = this.walkPart2(input, 0, 1, 0, visitedForks, visitedPoints);
    return answer;
  }
}

// new Day23().execute();
