export abstract class Day {
  day: number;
  private fileContent: string[];

  constructor(day: number) {
    this.day = day;
    const data = Deno.readTextFileSync(`./data/day${this.day}.data`);
    this.fileContent = data.split('\n');
  }

  abstract part1(input: any): number | string;
  abstract part2(input: any): number | string;
  abstract loadInput(): any;

  timeStart(name: string) {
    const key = name.toLowerCase().replace('  ', '-');
    console.time(`day${this.day}:${key}`);
  }

  timeEnd(name: string) {
    const key = name.toLowerCase().replace('  ', '-');
    console.timeLog(`day${this.day}:${key}`, `to ${name === 'input' ? 'parse' : 'execute'} ${name} of day ${this.day}`);
  }

  readDataFile(): string[] {
    return this.fileContent;
  }

  execute(): void {
    try {
      console.log(`--- Advent of Code day ${this.day} ---`);

      this.timeStart('total');

      this.timeStart('input');
      const input = this.loadInput();
      this.timeEnd('input');

      this.timeStart('part-1');
      console.log(`Part 1: ${this.part1(input)}`);
      this.timeEnd('part-1');

      this.timeStart('part-2');
      console.log(`Part 2: ${this.part2(input)}`);
      this.timeEnd('part-2');

      this.timeEnd('total');
    } catch (error) {
      debugger;
      throw error;
    }
  }
}
