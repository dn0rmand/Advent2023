import { Day } from './tools/day.ts';

export class Day9 extends Day {
  constructor() {
    super(9);
  }

  loadInput(): number[][] {
    const data = this.readDataFile().map(line => line.split(' ').map(v => +v));
    return data;
  }

  process(values: number[]): number[] {
    if (values.length === 0) {
      throw 'Error';
    }
    if (!values.some(a => a !== values[0])) {
      values.push(values[0]);
      return values;
    }
    let newValues = values.reduce((a: number[], v: number, i: number) => {
      if (i) {
        a.push(v - values[i - 1]);
      }
      return a;
    }, []);

    newValues = this.process(newValues);
    const extra = newValues[newValues.length - 1] + values[values.length - 1];
    values.push(extra);
    return values;
  }

  solve(values: number[]): number {
    values = this.process(values);
    return values[values.length - 1];
  }

  part1(input: number[][]): number {
    const values = input.map(values => this.solve(values));
    const answer = values.reduce((a, v) => a + v);
    return answer;
  }

  part2(input: number[][]): number {
    const values = input.map(values => this.solve(values.reverse()));
    const answer = values.reduce((a, v) => a + v);
    return answer;
  }
}

// new Day9().execute();
