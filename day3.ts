import { Day } from "./tools/day.ts";

const HEIGHT = 140;
const WIDTH = 140;

type Num = {
  value: number;
  x: number;
  y: number;
};

class Day3Input {
  private input: string[];
  private height: number = 0;
  private width: number = 0;

  makeKey(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return -1;
    } else {
      return x + y * this.width;
    }
  }

  get(x: number, y: number): string {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return ".";
    }
    return this.input[y][x];
  }

  *symbolIterator(): Generator<{ x: number; y: number; c: string }> {
    for (let y = 0; y < this.height; y++) {
      const line = this.input[y];
      for (let x = 0; x < this.width; x++) {
        const c = line[x];
        if (c !== "." && (c < "0" || c > "9")) {
          yield { x, y, c };
        }
      }
    }
  }

  getValueAt(x: number, y: number, left: boolean, right: boolean): Num | undefined {
    let c = this.get(x, y);
    if (c < "0" || c > "9") {
      return undefined;
    }
    let X = x;
    const value: string[] = [c];
    if (left) {
      while (true) {
        c = this.get(X - 1, y);
        if (c < "0" || c > "9") {
          break;
        }
        value.unshift(c);
        X--;
      }
    }

    if (right) {
      for (let i = 1; ; i++) {
        c = this.get(x + i, y);
        if (c < "0" || c > "9") {
          break;
        }
        value.push(c);
      }
    }

    return { x, y, value: +value.join("") };
  }

  constructor(input: string[]) {
    this.input = input;
    this.height = input.length;
    this.width = input[0].length;
  }
}

export class Day3 extends Day {
  constructor() {
    super(3);
  }

  loadInput(): Day3Input {
    const input = this.readDataFile();
    return new Day3Input(input);
  }

  part1(input: Day3Input): number {
    const visited: boolean[] = [];

    let answer: number = 0;

    const add = (value: Num | undefined): Num | undefined => {
      if (value !== undefined) {
        const k = input.makeKey(value.x, value.y);
        if (!visited[k]) {
          visited[k] = true;
          answer += value.value;
        }
        return value;
      }
    };

    for (const { x, y } of input.symbolIterator()) {
      const up = add(input.getValueAt(x, y - 1, true, true));
      const down = add(input.getValueAt(x, y + 1, true, true));
      const left = add(input.getValueAt(x - 1, y, true, false));
      const right = add(input.getValueAt(x + 1, y, false, true));

      if (!up && !left) {
        add(input.getValueAt(x - 1, y - 1, true, true));
      }
      if (!down && !left) {
        add(input.getValueAt(x - 1, y + 1, true, true));
      }
      if (!up && !right) {
        add(input.getValueAt(x + 1, y - 1, true, true));
      }
      if (!down && !right) {
        add(input.getValueAt(x + 1, y + 1, true, true));
      }
    }

    return answer;
  }

  part2(input: Day3Input): number {
    let answer = 0;
    let newValues: number[];
    let visited: boolean[];

    const add = (value: Num | undefined): Num | undefined => {
      if (newValues.length < 2 && value !== undefined) {
        const k = input.makeKey(value.x, value.y);
        if (!visited[k]) {
          visited[k] = true;
          newValues.push(value.value);
        }
      }
      return value;
    };

    for (const { x, y, c } of input.symbolIterator()) {
      if (c !== "*") {
        continue;
      }

      newValues = [];
      visited = [];
      const up = add(input.getValueAt(x, y - 1, true, true));
      const down = add(input.getValueAt(x, y + 1, true, true));
      const left = add(input.getValueAt(x - 1, y, true, false));
      const right = add(input.getValueAt(x + 1, y, false, true));

      if (!up && !left) {
        add(input.getValueAt(x - 1, y - 1, true, true));
      }
      if (!down && !left) {
        add(input.getValueAt(x - 1, y + 1, true, true));
      }
      if (!up && !right) {
        add(input.getValueAt(x + 1, y - 1, true, true));
      }
      if (!down && !right) {
        add(input.getValueAt(x + 1, y + 1, true, true));
      }

      if (newValues.length === 2) {
        answer += newValues[0] * newValues[1];
      }
    }

    return answer;
  }
}

// new Day3().execute();
