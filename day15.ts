import { Day } from './tools/day.ts';

const COMMA = ','.charCodeAt(0);
const EQUAL = '='.charCodeAt(0);
const MINUS = '-'.charCodeAt(0);
const ZERO = '0'.charCodeAt(0);
const NINE = '9'.charCodeAt(0);

type Lense = {
  label: string;
  focal: number;
};

export class Day15 extends Day {
  constructor() {
    super(15);
  }

  loadInput(): string {
    return this.readDataFile()[0];
  }

  part1(input: string): number {
    let total = 0;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      if (c === COMMA) {
        total += hash;
        hash = 0;
      } else {
        hash = ((hash + c) * 17) % 256;
      }
    }
    total += hash;
    return total;
  }

  add(box: Lense[], label: string, focal: number) {
    if (focal < 1 || focal > 9) {
      throw 'error: Invalid focal';
    }
    const l = box.find(l => l.label === label);
    if (l) {
      l.focal = focal;
    } else {
      box.push({ label, focal });
    }
  }

  remove(box: Lense[], label: string) {
    const l = box.findIndex(l => l.label === label);
    if (l >= 0) {
      box.splice(l, 1);
    }
  }

  process(box: Lense[], op: number, label: string, focal: number) {
    if (op === EQUAL) {
      this.add(box, label, focal);
    } else if (op === MINUS) {
      this.remove(box, label);
    } else {
      throw 'Error';
    }
  }

  boxPower(box: Lense[]): number {
    const power = box.reduce((power, lense, index) => power + (index + 1) * lense.focal, 0);
    return power;
  }

  part2(input: string): number {
    const boxes: Lense[][] = [];

    for (let b = 0; b < 256; b++) {
      boxes[b] = [];
    }

    let hash = 0;
    let label = '';
    let op = 0;
    let focal = 0;

    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      if (c === COMMA) {
        this.process(boxes[hash], op, label, focal);
        hash = 0;
        label = '';
        op = 0;
        focal = 0;
      } else {
        if (c === EQUAL || c === MINUS) {
          op = c;
        } else if (c >= ZERO && c <= NINE) {
          focal = c - ZERO;
        } else {
          label += String.fromCharCode(c);
          hash = ((hash + c) * 17) % 256;
        }
      }
    }

    this.process(boxes[hash], op, label, focal);

    const answer = boxes.reduce((power, box, index) => power + (index + 1) * this.boxPower(box), 0);
    return answer;
  }
}

// new Day15().execute();
