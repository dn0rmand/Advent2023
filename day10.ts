import { Day } from './tools/day.ts';

type Position = {
  x: number;
  y: number;
  c: string;

  previous: Position | undefined;
};

const directions = {
  '|': [
    { x: 0, y: 1, c: '|LJ' },
    { x: 0, y: -1, c: '|7F' },
  ],
  '-': [
    { x: 1, y: 0, c: '-7J' },
    { x: -1, y: 0, c: '-LF' },
  ],
  L: [
    { x: 1, y: 0, c: '-7J' },
    { x: 0, y: -1, c: '|7F' },
  ],
  J: [
    { x: -1, y: 0, c: '-LF' },
    { x: 0, y: -1, c: '|7F' },
  ],
  '7': [
    { x: -1, y: 0, c: '-LF' },
    { x: 0, y: 1, c: '|LJ' },
  ],
  F: [
    { x: 1, y: 0, c: '-7J' },
    { x: 0, y: 1, c: '|LJ' },
  ],
  S: [
    { x: -1, y: 0, c: '-FL' },
    { x: 1, y: 0, c: '-7J' },
    { x: 0, y: 1, c: '|LJ' },
    { x: 0, y: -1, c: '|F7' },
  ],
};

type Input = {
  data: string[][];
  path: boolean[];
  start: Position;
  width: number;
  height: number;
};

export class Day10 extends Day {
  private input: Input;

  constructor() {
    super(10);
  }

  loadInput(): Input {
    const input = this.readDataFile().map(line => line.split(''));

    let x = 0;
    let y = 0;
    for (y = 0; y < input.length; y++) {
      const line = input[y];
      let found = false;
      for (x = 0; x < line.length; x++) {
        if (line[x] === 'S') {
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }

    return {
      data: input,
      path: [],
      width: input[0].length,
      height: input.length,
      start: { x, y, c: 'S', previous: undefined },
    };
  }

  makeKey(x: number, y: number): number {
    return x + y * this.input.width;
  }

  setAt(x: number, y: number, c: string) {
    const l = this.input.data[y];

    if (l && l[x]) {
      l[x] = c;
    }
  }

  getAt(x: number, y: number, def: string = '.'): string {
    const c = (this.input.data[y] || [])[x] || def;

    return c;
  }

  getFirstMoves(p: Position | undefined = undefined): Position[] {
    const result: Position[] = [];
    p = p || this.input.start;
    for (const move of directions[p.c]) {
      const [x1, y1] = [p.x + move.x, p.y + move.y];
      if (p.previous && p.previous.x === x1 && p.previous.y === y1) {
        continue;
      }
      const c1 = this.getAt(x1, y1);
      if (move.c.includes(c1)) {
        result.push({ x: x1, y: y1, c: c1, previous: p });
      }
    }
    return result;
  }

  getMove(p: Position): Position {
    if (p.c === 'S') {
      throw Error('Should not go back to start');
    }

    for (const move of directions[p.c]) {
      const [x1, y1] = [p.x + move.x, p.y + move.y];
      if (p.previous && p.previous.x === x1 && p.previous.y === y1) {
        continue;
      }
      const c1 = this.getAt(x1, y1);
      if (move.c.includes(c1)) {
        return { x: x1, y: y1, c: c1, previous: p };
      }
    }

    throw 'Should have found a move';
  }

  apply(p1: Position, p2: Position | undefined = undefined) {
    this.input.path[this.makeKey(p1.x, p1.y)] = true;
    if (p2) {
      this.input.path[this.makeKey(p2.x, p2.y)] = true;
    }
  }

  navigate(): number {
    let [p1, p2] = this.getFirstMoves();
    let steps = 1;
    this.apply(this.input.start);

    while (true) {
      this.apply(p1, p2);

      steps++;
      p1 = this.getMove(p1);
      p2 = this.getMove(p2);

      if (p1.x === p2.x && p1.y === p2.y) {
        this.apply(p1);
        break;
      }
    }

    return steps;
  }

  replaceS() {
    const s = this.input.start;
    let [p1, p2] = this.getFirstMoves();
    if (Math.abs(p1.y - p2.y) === 2) {
      this.setAt(s.x, s.y, '|');
    } else if (Math.abs(p1.x - p2.x) === 2) {
      this.setAt(s.x, s.y, '-');
    } else {
      if (p1.y === s.y) {
        [p1, p2] = [p2, p1];
      }
      if (p1.y === s.y) {
        throw 'Not Expected';
      }
      if (p2.x === s.x) {
        throw 'Not Expected';
      }
      if (p1.y === s.y + 1) {
        if (p2.x === s.x + 1) {
          this.setAt(s.x, s.y, 'F');
        } else {
          this.setAt(s.x, s.y, '7');
        }
      } else {
        if (p2.x === s.x + 1) {
          this.setAt(s.x, s.y, 'L');
        } else {
          this.setAt(s.x, s.y, 'J');
        }
      }
    }
  }

  count(): number {
    this.replaceS();

    let total = 0;
    let key = 0;
    for (let y = 0; y < this.input.height; y++) {
      let inside = false;
      for (let x = 0; x < this.input.width; x++, key++) {
        let c = this.getAt(x, y);
        if (this.input.path[key]) {
          if (c === '|') {
            inside = !inside;
          } else if (c === 'L' || c === 'J') {
            inside = !inside;
          }
        } else if (inside) {
          total++;
        }
      }
    }
    return total;
  }

  part1(input: Input): number {
    this.input = input;
    return this.navigate();
  }

  part2(input: Input): number {
    if (!this.input) {
      this.input = input;
      this.navigate();
    }
    const answer = this.count();
    return answer;
  }
}

// new Day10().execute();
