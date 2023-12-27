import { gcd } from './bigintHelper.ts';

export class BigNumber {
  numerator: bigint;
  divisor: bigint;

  static ONE = new BigNumber(1n, 1n);
  static ZERO = new BigNumber(0n, 1n);

  static from(value: number | BigNumber): BigNumber {
    if (value instanceof BigNumber) {
      return value;
    }
    try {
      return new BigNumber(BigInt(value), 1n);
    } catch (e) {
      throw e;
    }
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

  add(other: BigNumber): BigNumber {
    const n = this.numerator * other.divisor + other.numerator * this.divisor;
    const d = this.divisor * this.divisor;
    return new BigNumber(n, d);
  }

  minus(other: BigNumber): BigNumber {
    const n = this.numerator * other.divisor - other.numerator * this.divisor;
    const d = this.divisor * this.divisor;
    return new BigNumber(n, d);
  }

  negate(): BigNumber {
    return new BigNumber(-this.numerator, this.divisor);
  }

  times(other: BigNumber): BigNumber {
    const n = this.numerator * other.numerator;
    const d = this.divisor * other.divisor;
    return new BigNumber(n, d);
  }

  dividedBy(other: BigNumber): BigNumber {
    const n = this.numerator * other.divisor;
    const d = this.divisor * other.numerator;
    if (!d) {
      throw 'Dividing by 0';
    }
    return new BigNumber(n, d);
  }

  equals(other: BigNumber): boolean {
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
