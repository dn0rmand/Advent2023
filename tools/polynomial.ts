import { gcd, factorial } from "./bigintHelper.ts";

const ABS = (a: bigint) => (a < 0 ? -a : a);

type Entry = {
  power: bigint;
  coefficient: bigint;
  divisor: bigint;
};

export class Polynomial {
  public readonly values: bigint[];
  private entries: Entry[] = [];

  constructor(values: number[]) {
    this.values = values.map((v) => BigInt(v));
    this.entries = [...this.calculate([...this.values], 100n, 1n)];
    // this.validate();
  }

  private checkValue(value: bigint): bigint {
    return value;
  }

  private *calculate(values: bigint[], maxPower: bigint, divisor: bigint): Generator<Entry> {
    const entry = this.getPower(values, maxPower);

    let { power, coefficient } = entry;

    if (power === 0n && coefficient === 0n) {
      return;
    }

    let fact = factorial(entry.power);
    const g = ABS(gcd(coefficient, fact));
    coefficient /= g;
    fact /= g;
    divisor = divisor * fact;

    if (power === 0n) {
      const g = ABS(gcd(coefficient, divisor));
      coefficient /= g;
      divisor /= g;

      yield { power, coefficient, divisor };
    } else {
      const newValues = values.map((value, i) => {
        const x = BigInt(i);
        const r = x ** power * coefficient;
        const l = value * fact;
        return l - r;
      });

      yield* this.calculate(newValues, power, divisor);
      yield { power, coefficient, divisor };
    }
  }

  private getPower(values: bigint[], maxPower: bigint): Entry {
    let power = 0n;

    while (values.length > 1 && power < maxPower) {
      let constant = true;
      let newValues = values.reduce((a: bigint[], v: bigint, i: number) => {
        if (i > 0) {
          const diff = v - values[i - 1];
          constant &&= diff === 0n;
          a.push(diff);
        }
        return a;
      }, []);
      if (constant) {
        break;
      }
      values = newValues;
      power++;
    }

    if (values.length === 0 || power >= maxPower) {
      throw "No polynomial";
    }

    return { power, coefficient: values[0], divisor: 1n };
  }

  get(x: number): bigint {
    const X = BigInt(x);
    let mainDivisor = 1n;
    let value = 0n;
    let g: bigint;
    for (const { power, coefficient, divisor } of this.entries) {
      let v = X ** power * mainDivisor * coefficient;

      g = gcd(v, divisor);
      v /= g;

      value = value * (divisor / g) + v;
      mainDivisor = mainDivisor * (divisor / g);
    }

    if (value % mainDivisor !== 0n) {
      throw "Error";
    }

    return value / mainDivisor;
  }

  validate() {
    for (let i = 0; i < this.values.length; i++) {
      const v = this.get(i);
      if (v !== this.values[i]) {
        throw new Error("Error");
      }
    }
  }
}
