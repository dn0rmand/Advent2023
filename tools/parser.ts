export class Parser {
  line: string;
  length: number;
  index: number;

  constructor(line: string) {
    this.line = line;
    this.length = line.length;
    this.index = 0;
  }

  reset(line: string) {
    this.line = line;
    this.length = line.length;
    this.index = 0;
  }

  eol(): boolean {
    this.ignoreSpaces();
    return this.index >= this.length;
  }

  ignoreSpaces() {
    while (this.index < this.length && this.line[this.index] === ' ') {
      this.index++;
    }
  }

  expect(s: string) {
    let c = this.peek(true);
    for (const a of s) {
      if (a !== c) {
        throw new Error(`Syntax error. Expecting ${s}`);
      }
      this.index++;
      c = this.peek(false);
    }
  }

  peek(skipSpaces: boolean = true): string {
    this.ignoreSpaces();

    if (this.index < this.length) {
      return this.line[this.index];
    }
    return ' ';
  }

  skip(count: number) {
    this.index += count;
  }

  skipIf(c: string, skipSpaces: boolean = true) {
    if (this.peek(skipSpaces) === c) {
      this.index++;
    }
  }

  getChar(skipSpaces: boolean = true): string {
    const c = this.peek(skipSpaces);
    this.index++;
    return c;
  }

  getWord(): string {
    let c = this.peek(true);
    let w = '';

    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      while ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
        w += c;
        this.index++;
        c = this.peek(false);
      }
    } else {
      throw new Error('Expecting a word');
    }
    return w;
  }

  getInt(): number {
    let c = this.peek(true);
    let value = 0;
    if (c >= '0' && c <= '9') {
      while (c >= '0' && c <= '9') {
        value = value * 10 + +c;
        this.index++;
        c = this.peek(false);
      }
      return value;
    } else {
      throw new Error('Expecting a number');
    }
  }
}
