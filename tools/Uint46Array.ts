const HI_DIV = 2 ** 31;
const LO_MASK = HI_DIV - 1;

export class Uint46Array {
  lo: Uint32Array;
  hi: Int16Array;

  constructor(size: number) {
    this.lo = new Uint32Array(size);
    this.hi = new Int16Array(size);
  }

  clear() {
    this.hi.fill(-1);
  }

  get(index: number): number | undefined {
    const lo = this.lo[index];
    const hi = this.hi[index];

    if (hi < 0) {
      return undefined;
    } else {
      return hi * HI_DIV + lo;
    }
  }

  set(index: number, value: number) {
    const lo = value & LO_MASK;
    const hi = (value - lo) / HI_DIV;

    this.hi[index] = hi;
    this.lo[index] = lo;

    return value;
  }
}
