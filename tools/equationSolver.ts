import { gcd } from './bigintHelper.ts';

class Equation {
  variables = new Map<string, bigint>();
  constant = 0n;

  addVariable(name: string, factor: bigint) {
    if (!factor) {
      return;
    }
    const ff = this.variables.get(name);
    if (ff !== undefined) {
      const f = ff + factor;
      if (f === 0n) {
        this.variables.delete(name);
      } else {
        this.variables.set(name, f);
      }
    } else if (factor !== 0n) {
      this.variables.set(name, factor);
    }
  }

  get solved(): boolean {
    return this.variables.size === 1;
  }

  get impossible(): boolean {
    return this.constant !== 0n && this.variables.size === 0;
  }

  get dead(): boolean {
    return this.constant === 0n && this.variables.size === 0;
  }

  get solution(): { name: string; numerator: bigint; divisor: bigint } {
    if (!this.solved) {
      throw 'Not solved yet';
    }
    for (let [k, d] of this.variables) {
      let n = -this.constant;
      const g = gcd(n, d);
      n /= g;
      d /= g;
      if (d < 0) {
        d = -d;
        n = -n;
      }
      return { name: k, numerator: n, divisor: d };
    }
    throw 'No solution';
  }

  set(name: string, value: bigint) {
    const v = this.variables.get(name);
    if (v !== undefined) {
      this.constant = this.constant + value * v;
      this.variables.delete(name);
    }
  }

  toString() {
    let s = '';
    for (const [name, f] of this.variables) {
      if (f === 0n) {
        continue;
      }
      if (s.length !== 0) {
        s += ' + ';
      }
      s += `${f}*${name}`;
    }
    if (this.constant !== 0n) {
      s += ` + ${this.constant}`;
    }
    s += ' = 0';
    return s;
  }
}

export class System {
  equations: Equation[];
  variables: Map<string, bigint>;
  impossible: boolean;
  validator: (name: string, value: bigint) => boolean;

  constructor(validator: (name: string, value: bigint) => boolean) {
    this.equations = [];
    this.variables = new Map();
    this.impossible = false;
    this.validator = validator;
  }

  addEquation(data: (string | [string, bigint] | bigint)[]) {
    let constant = 0n;
    const equation = new Equation();

    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (typeof v === 'string') {
        const value = this.get(v);
        if (value !== undefined) {
          constant = constant + value;
        } else {
          equation.addVariable(v, 1n);
        }
      } else if (Array.isArray(v)) {
        const [name, factor] = v;
        const value = this.get(name);
        if (value !== undefined) {
          constant += value * factor;
        } else {
          equation.addVariable(name, factor);
        }
      } else {
        constant += v;
      }
    }
    equation.constant = constant;

    if (!equation.dead) {
      this.equations.push(equation);
    }
  }

  get(name: string): bigint | undefined {
    return this.variables.get(name);
  }

  set(name: string, value: bigint): boolean {
    if (!this.validator(name, value)) {
      this.impossible = true;
      return false;
    }

    const old = this.variables.get(name);
    if (old !== undefined) {
      return old === value;
    }

    this.variables.set(name, value);
    return true;
  }

  replace(name: string, eRef: Equation, index: number): boolean {
    let done = false;
    for (let i = 0; i < this.equations.length; i++) {
      if (i === index) {
        continue;
      }
      const e3 = this.equations[i];
      const f = e3.variables.get(name);

      if (f === undefined) {
        continue;
      }

      done = true;
      e3.constant -= eRef.constant;
      for (const [k, v] of eRef.variables) {
        e3.addVariable(k, -v);
      }
    }
    return done;
  }

  extraReduce(): boolean {
    let done = false;
    for (let i = 0; i < this.equations.length; i++) {
      const e = this.equations[i];
      for (const [n, v] of e.variables) {
        if (v === 1n) {
          done ||= this.replace(n, e, i);
          break;
        }
      }
    }

    return done;
  }

  reduce(): boolean {
    const solved = this.equations.filter(e => e.solved);
    if (solved.length === 0) {
      return this.extraReduce();
    } else {
      this.equations = this.equations.filter(e => !e.solved);
    }

    const toSet = new Map<string, bigint>();

    for (const e of solved) {
      const { name, numerator, divisor } = e.solution;
      if (divisor !== 1n) {
        this.impossible = true;
        return false;
      }
      if (!this.set(name, numerator)) {
        return false;
      }
      toSet.set(name, numerator);
    }

    for (const e of this.equations) {
      for (const [name, value] of toSet) {
        e.set(name, value);
      }
      if (e.impossible) {
        return false;
      }
    }

    this.equations = this.equations.filter(e => !e.dead);

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
