import { Day } from './tools/day.ts';
import { Parser } from './tools/parser.ts';

enum Operator {
  GT = '>',
  LT = '<',
}

type Part = {
  x: number;
  m: number;
  a: number;
  s: number;
};

type Condition = {
  property: string;
  operator: Operator;
  value: number;
  target: string;
};

type Workflow = {
  name: string;
  conditions: Condition[];
  defaultTarget: string;
};

type Input = {
  workflows: { [id: string]: Workflow };
  parts: Part[];
};

type Range = {
  from: number;
  to: number;
};

type PartRange = {
  x: Range;
  m: Range;
  a: Range;
  s: Range;
};

export class Day19 extends Day {
  constructor() {
    super(19);
  }

  loadInput(): Input {
    const input: Input = {
      workflows: {},
      parts: [],
    };

    const lines = this.readDataFile();
    for (let line of lines) {
      if (!line) {
        continue;
      }
      const parser = new Parser(line);

      if (parser.peek() === '{') {
        parser.skip(1);
        const part: Part = { x: 0, m: 0, a: 0, s: 0 };
        while (parser.peek() !== '}') {
          const property = parser.getWord();
          parser.expect('=');
          const value = parser.getInt();
          part[property] = value;
          parser.skipIf(',');
        }
        input.parts.push(part);
      } else {
        // Workflow
        const workflow: Workflow = { name: parser.getWord(), conditions: [], defaultTarget: '' };

        parser.expect('{');
        // const [name, data] = line.split('{');
        // const rawConditions = data.split(',');
        while (parser.peek() != '}') {
          const condition: Condition = { target: '', property: '', operator: Operator.GT, value: 0 };
          const name = parser.getWord();
          if (parser.peek() === '}') {
            workflow.defaultTarget = name;
            break;
          } else {
            condition.property = name;
            condition.operator = parser.getChar() === '>' ? Operator.GT : Operator.LT;
            condition.value = parser.getInt();
            parser.expect(':');
            condition.target = parser.getWord();
            workflow.conditions.push(condition);
            parser.skipIf(',');
          }
        }
        input.workflows[workflow.name] = workflow;
      }
    }

    return input;
  }

  evaluate(part: Part, workflow: Workflow): string {
    for (const condition of workflow.conditions) {
      const v = part[condition.property];
      const t = condition.operator === Operator.GT ? v > condition.value : v < condition.value;
      if (t) {
        return condition.target;
      }
    }
    return workflow.defaultTarget;
  }

  process(input: Input): number {
    let total = 0;

    const first = input.workflows['in'];
    for (const part of input.parts) {
      let n = this.evaluate(part, first);

      while (n !== 'A' && n !== 'R') {
        n = this.evaluate(part, input.workflows[n]);
      }
      if (n === 'A') {
        total += part.x + part.m + part.a + part.s;
      }
    }

    return total;
  }

  cloneRange(range: PartRange): PartRange {
    return {
      x: { ...range.x },
      m: { ...range.m },
      a: { ...range.a },
      s: { ...range.s },
    };
  }

  walkTree(input: Input, current: string, range: PartRange): PartRange[] {
    if (current === 'A') {
      return [range];
    } else if (current === 'R') {
      return [];
    }

    const ranges: PartRange[] = [];
    const w = input.workflows[current];
    const r = this.cloneRange(range);

    let addDefault = true;
    for (const c of w.conditions) {
      const x = r[c.property];
      if (c.operator === Operator.GT) {
        if (x.from > c.value) {
          // already the case so they're all true
          ranges.push(...this.walkTree(input, c.target, r));
          addDefault = false;
          break;
        } else if (x.to > c.value) {
          const r1 = this.cloneRange(r);
          r1[c.property].from = c.value + 1;
          ranges.push(...this.walkTree(input, c.target, r1));
          x.to = c.value;
        }
      } else if (c.operator === Operator.LT) {
        if (x.to < c.value) {
          // already the case to it will be true
          ranges.push(...this.walkTree(input, c.target, r));
          addDefault = false;
          break;
        } else if (x.from < c.value) {
          const r1 = this.cloneRange(r);
          r1[c.property].to = c.value - 1;
          ranges.push(...this.walkTree(input, c.target, r1));
          x.from = c.value;
        }
      }
    }
    if (addDefault) {
      ranges.push(...this.walkTree(input, w.defaultTarget, r));
    }
    return ranges;
  }

  part1(input: Input): number {
    return this.process(input);
  }

  equals(r1: Range, r2: Range): boolean {
    return r1.from === r2.from && r1.to === r2.to;
  }

  canMerge(r1: PartRange, r2: PartRange): string {
    if (this.equals(r1.x, r2.x)) {
      if (this.equals(r1.m, r2.m) && this.equals(r1.a, r2.a)) {
        return 's';
      }
      if (this.equals(r1.m, r2.m) && this.equals(r1.s, r2.s)) {
        return 'a';
      }
      if (this.equals(r1.a, r2.a) && this.equals(r1.s, r2.s)) {
        return 'm';
      }

      return '';
    } else if (this.equals(r1.m, r2.m) && this.equals(r1.a, r2.a) && this.equals(r1.s, r2.s)) {
      return 'x';
    } else {
      return '';
    }
  }

  part2(input: Input): number {
    const start: PartRange = {
      x: { from: 1, to: 4000 },
      m: { from: 1, to: 4000 },
      a: { from: 1, to: 4000 },
      s: { from: 1, to: 4000 },
    };

    let ranges = this.walkTree(input, 'in', start);
    let total = 0;

    for (const range of ranges) {
      let v = 1;
      v *= range.x.to - range.x.from + 1;
      v *= range.m.to - range.m.from + 1;
      v *= range.a.to - range.a.from + 1;
      v *= range.s.to - range.s.from + 1;

      total += v;
    }
    return total;
  }
}

new Day19().execute();
