export abstract class Day {
  day: number;

  constructor(day: number) {
    this.day = day;
  }

  abstract part1(input: any): number | string;
  abstract part2(input: any): number | string;
  abstract loadInput(): any;

  timeStart(name: string) {
    const key = name.toLowerCase().replace("  ", "-");
    console.time(`day${this.day}:${key}`);
  }

  timeEnd(name: string) {
    const key = name.toLowerCase().replace("  ", "-");
    console.timeLog(`day${this.day}:${key}`, `to ${name === "input" ? "parse" : "execute"} ${name} of day ${this.day}`);
  }

  readDataFile(): string[] {
    const data = Deno.readTextFileSync(`./data/day${this.day}.data`);
    return data.split("\n");
  }

  execute(): void {
    console.log(`--- Advent of Code day ${this.day} ---`);

    this.timeStart("input");
    const input = this.loadInput();
    this.timeEnd("input");

    this.timeStart("part-1");
    console.log(`Part 1: ${this.part1(input)}`);
    this.timeEnd("part-1");

    this.timeStart("part-2");
    console.log(`Part 2: ${this.part2(input)}`);
    this.timeEnd("part-2");
  }
}
