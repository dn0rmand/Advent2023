import { Day } from './tools/day.ts';
import { Point } from './tools/geometry.ts';
import { BitArray } from './tools/BitArray.ts';

const WALL = '#'.charCodeAt(0);
const FREE = '.'.charCodeAt(0);
const DOWN = 'v'.charCodeAt(0);
const UP = '^'.charCodeAt(0);
const LEFT = '<'.charCodeAt(0);
const RIGHT = '>'.charCodeAt(0);

type Fork = {
  to: Point;
  length: number;
  key: number;
};

type Input = {
  map: Uint8Array[];
  width: number;
  height: number;
  totalLength: number;
  forks: Fork[][];
};

let VISITED_SIZE = 1;
let WIDTH = 0;
let HEIGHT = 0;

class State {
  x: number;
  y: number;
  visited: BitArray;
  steps: number;
  key: number;

  static makeKey(x: number, y: number) {
    return x + y * WIDTH;
  }

  private constructor(x: number, y: number, steps: number, visited: BitArray) {
    this.x = x;
    this.y = y;
    this.steps = steps;
    this.visited = visited;
    this.key = State.makeKey(x, y);
  }

  static getStart(input: Input): State {
    HEIGHT = input.height;
    WIDTH = input.width;
    VISITED_SIZE = HEIGHT * WIDTH;

    const state = new State(1, 0, 0, BitArray.withSize(VISITED_SIZE));

    state.visited.set(state.key);

    return state;
  }

  clone(x: number, y: number): State {
    const state = new State(x, y, this.steps + 1, this.visited.clone());
    state.visited.set(state.key);
    return state;
  }

  jump(input: Input, slippery: boolean): { x1: number; y1: number }[] {
    let choices: { x1: number; y1: number }[];

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
        return choices;
      }

      this.x = choices[0].x1;
      this.y = choices[0].y1;
      this.key = State.makeKey(this.x, this.y);
      this.steps++;
      this.visited.set(this.key);
    }
  }

  moves(input: Input, slippery: boolean): State[] {
    const output: State[] = [];

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
            s.key++;
            break;
          case LEFT:
            s.x -= 1;
            s.key++;
            break;
          case UP:
            s.y -= 1;
            s.key -= WIDTH;
            break;
          case DOWN:
            s.y += 1;
            s.key += WIDTH;
            break;
          default:
            throw 'Error';
        }
        if (!s.visited.isSet(s.key)) {
          s.visited.set(s.key);
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

    const input = { map, width: map[0].length, height: map.length, forks: [], totalLength: 0 };

    HEIGHT = input.height;
    WIDTH = input.width;
    VISITED_SIZE = HEIGHT * WIDTH;

    this.findForks(input, { x: 1, y: 0 }, { x: 1, y: 0 }, new Uint8Array(VISITED_SIZE));
    return input;
  }

  addFork(input: Input, from: Point, to: Point, length: number): boolean {
    const k1 = State.makeKey(from.x, from.y);
    const k2 = State.makeKey(to.x, to.y);
    const f1 = { key: k1, length, to: from };
    const f2 = { key: k2, length, to };

    if ((input.forks[k2] || []).some(f => f.key === k1)) {
      return false;
    }
    if ((input.forks[k1] || []).some(f => f.key === k2)) {
      return false;
    }

    input.totalLength += length;

    // TO to FROM
    if (!input.forks[k2]) {
      input.forks[k2] = [f1];
    } else {
      input.forks[k2].push(f1);
      input.forks[k2].sort((f1, f2) => f2.length - f1.length);
    }

    // FROM to TO
    if (!input.forks[k1]) {
      input.forks[k1] = [f2];
    } else {
      input.forks[k1].push(f2);
      input.forks[k1].sort((f1, f2) => f2.length - f1.length);
    }

    return true;
  }

  findForks(input: Input, where: Point, start: Point, visitedPoints: Uint8Array) {
    let previous = { ...start };
    let steps = 0;

    let { x, y } = where;
    const wKey = State.makeKey(x, y);
    if (visitedPoints[wKey]) {
      return;
    }
    visitedPoints[wKey] = 1;
    if (previous.x !== x || previous.y !== y) {
      steps++;
    }

    while (true) {
      const choices: Point[] = [];

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
        const endKey = State.makeKey(x, y);
        if (visitedPoints[endKey]) {
          break;
        }
        visitedPoints[endKey] = 0;
        if (this.addFork(input, start, end, steps)) {
          for (const w of choices) {
            this.findForks(input, w, end, visitedPoints);
          }
        }
        visitedPoints[endKey] = 0;
        break;
      }

      steps++;

      previous = { x, y };
      x = choices[0].x;
      y = choices[0].y;
    }
  }

  walkPart1(input: Input) {
    const states: State[] = [State.getStart(input)];

    const target = { x: input.width - 2, y: input.height - 1 };
    let max = 0;

    while (states.length > 0) {
      const state = states.pop();
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

    return max;
  }

  maxPart2 = 0;

  walkPart2(input: Input, remaining: number, steps: number, x: number, y: number, visitedPoints: Uint8Array): number {
    if (x === input.width - 2 && y === input.height - 1) {
      if (steps > this.maxPart2) {
        this.maxPart2 = steps;
      }
      return steps;
    }

    const key = State.makeKey(x, y);
    if (visitedPoints[key] || steps + remaining <= this.maxPart2) {
      return this.maxPart2;
    }

    visitedPoints[key] = 1;

    const forks = (input.forks[key] || []).filter(f => !visitedPoints[f.key]);

    let max = this.maxPart2;
    let left = remaining;

    forks.forEach(f => (left -= f.length));

    for (const fork of forks) {
      if (steps + fork.length + left <= this.maxPart2) {
        break;
      }
      const d = this.walkPart2(input, left, steps + fork.length, fork.to.x, fork.to.y, visitedPoints);
      max = Math.max(max, d);
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
    const answer = this.walkPart2(input, input.totalLength, 0, 1, 0, visitedPoints);
    return answer;
  }
}

// new Day23().execute();
