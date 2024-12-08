export class Console {
  static prefix = '\x1b[';
  static encoder: TextEncoder | undefined;

  static colors = {
    reset: 0,
    // styles
    bold: 1,
    italic: 3,
    underline: 4,
    inverse: 7,
    // resets
    stopBold: 22,
    stopItalic: 23,
    stopUnderline: 24,
    stopInverse: 27,
    // colors
    white: 37,
    black: 30,
    blue: 34,
    cyan: 36,
    green: 32,
    magenta: 35,
    red: 31,
    yellow: 33,
    bgWhite: 47,
    bgBlack: 40,
    bgBlue: 44,
    bgCyan: 46,
    bgGreen: 42,
    bgMagenta: 45,
    bgRed: 41,
    bgYellow: 43,

    grey: 90,
    brightBlack: 90,
    brightRed: 91,
    brightGreen: 92,
    brightYellow: 93,
    brightBlue: 94,
    brightMagenta: 95,
    brightCyan: 96,
    brightWhite: 97,

    bgGrey: 100,
    bgBrightBlack: 100,
    bgBrightRed: 101,
    bgBrightGreen: 102,
    bgBrightYellow: 103,
    bgBrightBlue: 104,
    bgBrightMagenta: 105,
    bgBrightCyan: 106,
    bgBrightWhite: 107,
  };

  static async write(data: string) {
    if (Console.encoder === undefined) {
      Console.encoder = new TextEncoder();
    }
    const buffer = Console.encoder.encode(data);

    Deno.writeSync(Deno.stdout.rid, buffer);
  }

  static up(num: number) {
    Console.write(Console.prefix + (num || '') + 'A');
  }

  static down(num: number) {
    Console.write(Console.prefix + (num || '') + 'B');
  }

  static forward(num: number) {
    Console.write(Console.prefix + (num || '') + 'C');
  }

  static back(num: number) {
    Console.write(Console.prefix + (num || '') + 'D');
  }

  static nextLine(num: number) {
    Console.write(Console.prefix + (num || '') + 'E');
  }

  static previousLine(num: number) {
    Console.write(Console.prefix + (num || '') + 'F');
  }

  static horizontalAbsolute(num: number) {
    Console.write(Console.prefix + num + 'G');
  }

  static eraseData() {
    Console.write(Console.prefix + 'J');
  }

  static eraseLine() {
    Console.write(Console.prefix + 'K');
  }

  static goto(x: number, y: number) {
    Console.write(Console.prefix + y + ';' + x + 'H');
  }

  static gotoSOL() {
    Console.write('\r');
  }

  static newLine() {
    Console.write('\r\n');
  }

  static color(color: string) {
    const c = Console.colors[color];
    if (c) {
      Console.write(Console.prefix + color + 'm');
    }
  }
}
