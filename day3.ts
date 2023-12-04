import { Day } from "./tools/day.ts";

type Value = {
  value: number;
  y: number;
  x: number;
  width: number;
  hasSymbols: boolean;
};

class Day3Input {
  private height: number = 0;
  private width: number = 0;
  private symbols: { [id: number]: number[] } = {};

  public gears: { [id: number]: number[] } = {};
  public values: Value[] = [];

  makeKey(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return -1;
    } else {
      return x + y * this.width;
    }
  }

  *inputIterator(input: string[]): Generator<{ x: number; y: number; c: string; digit: boolean; symbol: boolean }> {
    for (let y = 0; y < this.height; y++) {
      const line = input[y];
      let wasDigit = false;
      for (let x = 0; x < this.width; x++) {
        const c = line[x];
        if (c >= "0" && c <= "9") {
          wasDigit = true;
          yield { x, y, c, digit: true, symbol: false };
        } else if (c !== ".") {
          wasDigit = false;
          yield { x, y, c, digit: false, symbol: true };
        } else if (wasDigit) {
          wasDigit = false;
          yield { x, y, c, digit: false, symbol: false };
        }
      }
    }
  }

  addSymbol(c: string, key: number) {
    this.symbols[key] = [];

    if (c === "*") {
      this.gears[key] = [];
    }
  }

  addValue(value: Value, key: number | undefined = undefined) {
    if (key !== undefined) {
      if (this.symbols[key]) {
        value.hasSymbols = true;
        this.symbols[key].push(value.value);
      }
      if (this.gears[key]) {
        value.hasSymbols = true;
        this.gears[key].push(value.value);
      }
    } else {
      for (let x = value.x - 1; x <= value.x + value.width; x++) {
        this.addValue(value, this.makeKey(x, value.y - 1));
        this.addValue(value, this.makeKey(x, value.y));
        this.addValue(value, this.makeKey(x, value.y + 1));
      }
    }
  }

  mapInput(input: string[]) {
    let value: Value | undefined = undefined;

    for (const { x, y, c, digit, symbol } of this.inputIterator(input)) {
      if (digit) {
        if (value !== undefined) {
          value.width++;
          value.value = value.value * 10 + +c;
        } else {
          value = { value: +c, y, x, width: 1, hasSymbols: false };
        }
      } else {
        if (value) {
          this.values.push(value);
          value = undefined;
        }
        if (symbol) {
          this.addSymbol(c, this.makeKey(x, y));
        }
      }
    }

    if (value) {
      this.values.push(value);
    }

    this.values.forEach((value) => this.addValue(value));
  }

  constructor(input: string[]) {
    this.height = input.length;
    this.width = input[0].length;
    this.mapInput(input);
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
    const total = input.values.reduce((sum: number, value: Value) => sum + (value.hasSymbols ? value.value : 0), 0);
    return total;
  }

  part2(input: Day3Input): number {
    const goodGears: number[] = Object.values(input.gears)
      .filter((numbers: number[]) => numbers.length === 2)
      .map((values: number[]) => values[0] * values[1]);
    const answer = goodGears.reduce((a: number, v: number) => a + v);
    return answer;
  }
}

// new Day3().execute();
