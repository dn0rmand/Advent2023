import { Day } from "./tools/day.ts";

type Node = { L: string; R: string };
type Map = {
  instructions: string;
  nodes: { [id: string]: Node };
};

export class Day8 extends Day {
  constructor() {
    super(8);
  }

  loadInput(): Map {
    const lines = this.readDataFile();
    const instructions = lines[0];
    const nodes: { [id: string]: Node } = {};

    for (let i = 2; i < lines.length; i++) {
      const matches = lines[i].match(/[A-Z]+/g);
      if (!matches || matches.length !== 3) {
        throw "Input error";
      }
      nodes[matches[0]] = { L: matches[1], R: matches[2] };
    }

    return { instructions, nodes };
  }

  part1(input: Map): number {
    let current = "AAA";
    let steps = 0;
    let instruction = 0;

    while (current != "ZZZ") {
      steps++;
      const i = input.instructions[instruction];
      current = input.nodes[current][i];
      instruction = (instruction + 1) % input.instructions.length;
    }

    return steps;
  }

  navigate(input: Map, start: string): number {
    let steps = 0;
    let instruction = 0;

    while (start[start.length - 1] !== "Z") {
      steps++;
      const i = input.instructions[instruction];
      start = input.nodes[start][i];
      instruction = (instruction + 1) % input.instructions.length;
    }

    return steps;
  }

  gcd(a: number, b: number): number {
    if (a < b) {
      [a, b] = [b, a];
    }

    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  lcm(a: number, b: number): number {
    return (a / this.gcd(a, b)) * b;
  }

  part2(input: Map): number {
    const starts = Object.keys(input.nodes).filter((k) => k[k.length - 1] === "A");
    const steps = starts.map((start) => this.navigate(input, start));
    const answer = steps.reduce((a, s) => (a ? this.lcm(a, s) : s), 0);

    return answer;
  }
}

// new Day8().execute();
