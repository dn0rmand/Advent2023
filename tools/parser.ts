export class Parser {
  line: string;
  length: number;
  index: number = 0;

  constructor(line) {
    this.line = line;
    this.length = line.length;
  }

  expect(c: string) {
    if (this.peek() !== c) {
      throw new Error(`Syntax error. Expecting ${c}`);
    }
    this.index++;
  }

  peek(): string {
    if (this.index < this.length) {
      return this.line[this.index];
    }
    return ' ';
  }

  skip(count: number) {
    this.index += count;
  }

  skipIf(c: string) {
    if (this.peek() === c) {
      this.index++;
    }
  }

  getChar(): string {
    const c = this.peek();
    this.index++;
    return c;
  }

  getWord(): string {
    let c = this.peek();
    let w = '';

    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      while ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        w += c;
        this.index++;
        c = this.peek();
      }
    } else {
      throw new Error('Expecting a word');
    }
    return w;
  }

  getInt(): number {
    let c = this.peek();
    let value = 0;
    if (c >= '0' && c <= '9') {
      while (c >= '0' && c <= '9') {
        value = value * 10 + +c;
        this.index++;
        c = this.peek();
      }
      return value;
    } else {
      throw new Error('Expecting a number');
    }
  }
}
