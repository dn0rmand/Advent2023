import { Day } from './tools/day.ts';
import { gcd } from './tools/bigintHelper.ts';
import { Tracer } from './tools/tracer.ts';

const MAX = 500;

type Hailstone = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

class Value {
  numerator: bigint;
  divisor: bigint;

  static ONE = new Value(1n, 1n);
  static ZERO = new Value(0n, 1n);

  static from(value: number): Value {
    return new Value(BigInt(value), 1n);
  }

  constructor(numerator: bigint, divisor: bigint) {
    const g = gcd(numerator, divisor);
    numerator = numerator / g;
    divisor = divisor / g;

    if (divisor < 0n) {
      numerator = -numerator;
      divisor = -divisor;
    }

    this.numerator = numerator;
    this.divisor = divisor;
  }

  get isZero(): boolean {
    return this.numerator === 0n;
  }

  add(other: Value): Value {
    const n = this.numerator * other.divisor + other.numerator * this.divisor;
    const d = this.divisor * this.divisor;
    return new Value(n, d);
  }

  minus(other: Value): Value {
    const n = this.numerator * other.divisor - other.numerator * this.divisor;
    const d = this.divisor * this.divisor;
    return new Value(n, d);
  }

  negate(): Value {
    return new Value(-this.numerator, this.divisor);
  }

  times(other: Value): Value {
    const n = this.numerator * other.numerator;
    const d = this.divisor * other.divisor;
    return new Value(n, d);
  }

  dividedBy(other: Value): Value {
    const n = this.numerator * other.divisor;
    const d = this.divisor * other.numerator;
    if (!d) {
      throw 'Dividing by 0';
    }
    return new Value(n, d);
  }

  equals(other: Value): boolean {
    return this.divisor === other.divisor && this.numerator === other.numerator;
  }

  valueOf(): bigint {
    if (this.divisor !== 1n) {
      throw 'Invalid value';
    }
    return this.numerator;
  }

  toString(): string {
    if (this.divisor === 1n) {
      return `${this.numerator}`;
    } else {
      return `(${this.numerator}/${this.divisor})`;
    }
  }
}

class Variable {
  name: string;
  count: Value;

  static DUMMY = new Variable('dummy', Value.ZERO);

  constructor(name: string, count: Value) {
    this.name = name;
    this.count = count;
  }

  evaluate(value: Value): Value {
    const v = this.count.times(value);
    return v;
  }

  toString() {
    return `${this.count.toString()}*${this.name}`;
  }
}

class Equation {
  name: string;
  constant: Value;
  time: Variable;

  constructor(name: string, constant: Value, time: Variable) {
    this.name = name;
    this.constant = constant;
    this.time = time;
  }

  toString() {
    if (this.time.count.isZero) {
      return `${this.name} = ${this.constant.toString()}`;
    } else {
      return `${this.name} = ${this.constant.toString()} + (${this.time.toString()})`;
    }
  }
}

class System {
  equations: Equation[];
  variables: { [id: string]: Value };

  constructor(equations: Equation[]) {
    this.equations = equations;
    this.variables = {};
  }

  get(name: string): Value {
    return this.variables[name];
  }

  setVariable(name: string, value: Value): boolean {
    if (name.startsWith('t')) {
      // can't be in the past

      if (value.numerator < 0n) {
        return false;
      }
    } else if (value.divisor !== 1n) {
      return false;
    }

    if (this.variables[name] !== undefined) {
      if (!this.variables[name].equals(value)) {
        return false; // wrong
      }
    }
    this.variables[name] = value;
    return true;
  }

  extraReduce(): boolean {
    let done = false;

    const eqs = this.equations.filter(e => e.time.name[0] === 'v');
    if (eqs.length < 2) {
      return false;
    }

    const e = eqs[0];

    for (let i = 1; i < eqs.length; i++) {
      const e3 = eqs[i];
      if (e3.time.name === e.time.name) {
        const ct = e.constant.minus(e3.constant);
        const cb = e3.time.count.minus(e.time.count);
        if (cb.isZero) {
          continue;
        }
        e3.constant = ct.dividedBy(cb);
        e3.time = Variable.DUMMY;
        e3.name = e.time.name;
        done = true;
      }
    }
    return done;
  }

  reduce(): boolean {
    const solved = this.equations.filter(e => e.time.count.isZero);
    if (solved.length === 0) {
      return this.extraReduce();
    } else {
      this.equations = this.equations.filter(e => !e.time.count.isZero);
    }

    for (const e of solved) {
      if (!this.setVariable(e.name, e.constant)) {
        return false;
      }
    }

    for (const e of this.equations) {
      if (this.variables[e.name] !== undefined) {
        const C = this.variables[e.name].minus(e.constant);
        const T = e.time;
        const v = C.dividedBy(T.count);

        e.name = T.name;
        e.constant = v;
        e.time = Variable.DUMMY;
        if (!this.setVariable(T.name, v)) {
          return false;
        }
      } else if (this.variables[e.time.name] !== undefined) {
        const c = e.time.evaluate(this.variables[e.time.name]);
        e.constant = e.constant.add(c);
        e.time = Variable.DUMMY;
      }
    }

    return true;
  }

  solve(): boolean {
    while (this.equations.length) {
      if (!this.reduce()) {
        return false;
      }
    }
    return true;
  }
}

export class Day24 extends Day {
  constructor() {
    super(24);
  }

  loadInput(): Hailstone[] {
    return this.readDataFile().map(line => {
      const [point, velocity] = line.split('@');
      const [x, y, z] = point.split(',').map(v => +v);
      const [vx, vy, vz] = velocity.split(',').map(v => +v);

      return { x, y, z, vx, vy, vz };
    });
  }

  round(value: number): number {
    return +value.toFixed(12);
  }

  part1(stones: Hailstone[]): number {
    const min = 200000000000000;
    const max = 400000000000000;

    let total = 0;
    for (let i = 0; i < stones.length - 1; i++) {
      const { x: xa1, y: ya1, vx: vxa, vy: vya } = stones[i];
      const [xa2, ya2] = [xa1 + vxa, ya1 + vya];

      const a1 = (ya2 - ya1) / (xa2 - xa1);
      const b1 = ya1 - a1 * xa1;

      for (let j = i + 1; j < stones.length; j++) {
        const { x: xb1, y: yb1, vx: vxb, vy: vyb } = stones[j];
        const [xb2, yb2] = [xb1 + vxb, yb1 + vyb];

        const a2 = (yb2 - yb1) / (xb2 - xb1);
        const b2 = yb1 - a2 * xb1;

        if (a1 === a2) {
          continue;
        }

        const x = (b2 - b1) / (a1 - a2);
        const y = a1 * x + b1;
        if (x < min || x > max || y < min || y > max) {
          continue;
        }
        const t1 = vxa ? (x - xa1) / vxa : (y - ya1) / vya;
        const t2 = vxb ? (x - xb1) / vxb : (y - yb1) / vyb;
        if (t1 < 0 || t2 < 0) {
          // That's the past
          continue;
        }

        total++;
      }
    }

    return total;
  }

  trySolveXY(stones: Hailstone[], xyz: string, vx0: number, vy0: number): System | undefined {
    let unknown = 2;
    let equations: Equation[] = [];

    const x0: string = xyz[0] + '0';
    const y0: string = xyz[1] + '0';

    let ok = false;
    for (let i = 0; i < stones.length; i++) {
      const s = stones[i];
      const t = `t${i}`;
      const x = s[xyz[0]];
      const vx = s['v' + xyz[0]];
      const y = s[xyz[1]];
      const vy = s['v' + xyz[1]];
      if (vx === vx0 || vy === vy0) {
        ok = true;
        equations.push(new Equation(x0, Value.from(x), new Variable(t, Value.from(vx - vx0))));
        equations.push(new Equation(y0, Value.from(y), new Variable(t, Value.from(vy - vy0))));
      } else if (unknown > equations.length) {
        equations.push(new Equation(x0, Value.from(x), new Variable(t, Value.from(vx - vx0))));
        equations.push(new Equation(y0, Value.from(y), new Variable(t, Value.from(vy - vy0))));
        unknown += 1;
      } else if (ok) {
        break;
      }
    }
    if (!ok) {
      return undefined;
    }

    const system = new System(equations);
    if (system.solve()) {
      // Verify

      const $x0 = system.get(x0);
      const $y0 = system.get(y0);

      for (let i = 0; i < stones.length; i++) {
        const stone = stones[i];
        const x: number = stone[xyz[0]];
        const y: number = stone[xyz[1]];
        const vx: number = stone['v' + xyz[0]];
        const vy: number = stone['v' + xyz[1]];
        const X = Value.from(x);
        const Y = Value.from(y);
        const VX = Value.from(vx - vx0);
        const VY = Value.from(vy - vy0);

        if (vx === vx0 && vy === vy0) {
          return undefined;
        } else if (vx === vx0) {
          if (!X.equals($x0)) {
            return undefined;
          }
          const ty = $y0.minus(Y).dividedBy(VY);
          if (!system.setVariable(`t${i}`, ty)) {
            return undefined;
          }
        } else if (vy === vy0) {
          if (!Y.equals($y0)) {
            return undefined;
          }
          const tx = $x0.minus(X).dividedBy(VX);
          if (!system.setVariable(`t${i}`, tx)) {
            return undefined;
          }
        } else {
          const tx = $x0.minus(X).dividedBy(VX);
          const ty = $y0.minus(Y).dividedBy(VY);
          if (!tx.equals(ty)) {
            return undefined;
          }
          if (!system.setVariable(`t${i}`, tx)) {
            return undefined;
          }
        }
      }

      return this.trySolveZ(stones, xyz[2], system);
    }

    return undefined;
  }

  trySolveZ(stones: Hailstone[], property: string, system: System): System | undefined {
    system.equations = stones.map((s, i) => {
      const z = s[property];
      const vz = s['v' + property];
      const t = system.get(`t${i}`);
      const Z = Value.from(z);
      const VZ = Value.from(vz);

      return new Equation(property + '0', Z.add(t.times(VZ)), new Variable(`v${property}0`, t.negate()));
    });

    if (system.solve()) {
      return system;
    }

    return undefined;
  }

  distinct(values: number[]): number[] {
    values.sort((a, b) => a - b);
    return values.filter((v, i) => i === 0 || v !== values[i - 1]);
  }

  part2(stones: Hailstone[]): string {
    let result: System | undefined;

    const vxs = this.distinct(stones.map(s => s.vx));
    const vys = this.distinct(stones.map(s => s.vy));
    const vzs = this.distinct(stones.map(s => s.vz));

    const tracer = new Tracer();
    for (let vy0 = -MAX; !result && vy0 <= MAX; vy0++) {
      tracer.trace(() => `yxz: ${MAX - vy0}`);
      for (let vx0 of vxs) {
        result = this.trySolveXY(stones, 'xyz', vx0, vy0);
        if (result) {
          break;
        }
      }
    }

    if (!result) {
      for (let vx0 = -MAX; !result && vx0 <= MAX; vx0++) {
        tracer.trace(() => `xyz: ${MAX - vx0}`);
        for (let vy0 of vys) {
          result = this.trySolveXY(stones, 'xyz', vx0, vy0);
          if (result) {
            break;
          }
        }
      }
    }

    if (!result) {
      for (let vx0 = -MAX; !result && vx0 <= MAX; vx0++) {
        tracer.trace(() => `xzy: ${MAX - vx0}`);
        for (let vz0 of vzs) {
          result = this.trySolveXY(stones, 'xzy', vx0, vz0);
          if (result) {
            break;
          }
        }
      }
    }

    tracer.clear();

    if (result) {
      const [x0, y0, z0] = [result.get('x0'), result.get('y0'), result.get('z0')];

      return `${x0.valueOf() + y0.valueOf() + z0.valueOf()}`;
    }
    return 'No Solutions';
  }
}

new Day24().execute();
