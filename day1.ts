import { Day } from "./tools/day.ts";

export class Day1 extends Day {
  constructor() {
    super(1);
  }

  loadInput(): string[] {
    return this.readDataFile();
  }

  part1(input: string[]): number {
    const answer = input.reduce((count: number, line: string) => {
      const matches = line.match(/\d/gi);
      if (!matches) {
        throw "error";
      }
      return count + 10 * +matches[0] + +matches[matches.length - 1];
    }, 0);

    return answer;
  }

  part2(input: string[]): number {
    const convertor = {
      on: 1,
      tw: 2,
      thre: 3,
      four: 4,
      fiv: 5,
      six: 6,
      seve: 7,
      eigh: 8,
      nin: 9,
    };
    const convert = (value) => convertor[value] || +value;
    const regex = new RegExp(
      /\d|on(?=e)|tw(?=o)|thre(?=e)|four|fiv(?=e)|six|seve(?=n)|eigh(?=t)|nin(?=e)/gi
    );
    return input.reduce((count: number, line: string) => {
      const matches = line.match(regex);
      if (!matches) {
        throw "error";
      }
      const first = matches[0];
      const last = matches[matches.length - 1];
      return count + convert(first) * 10 + convert(last);
    }, 0);
  }
}

// new Day1().execute();
