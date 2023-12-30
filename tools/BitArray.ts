export class BitArray {
  data: Uint8Array;

  private constructor(data: Uint8Array) {
    this.data = data;
  }

  static withSize(size: number) {
    size = Math.ceil(size / 8);
    const data = new Uint8Array(size);
    return new BitArray(data);
  }

  clone() {
    return new BitArray(Uint8Array.from(this.data));
  }

  set(index: number) {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    this.data[idx] |= mask;
  }

  unset(index: number) {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    this.data[idx] = (this.data[idx] | mask) - mask;
  }

  isSet(index: number): boolean {
    const bit = index % 8;
    const idx = (index - bit) / 8;
    const mask = 2 ** bit;

    return (this.data[idx] & mask) !== 0;
  }
}
