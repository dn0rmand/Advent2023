import { Console } from './console.ts';

export class Tracer {
  last: number;

  constructor() {
    this.last = Date.now() - 1000;
  }

  trace(callback: () => any) {
    const elapsed = Date.now() - this.last;

    if (elapsed >= 500) {
      const msg = `  ${callback()}`;
      Console.eraseLine();
      Console.write(msg);
      Console.gotoSOL();
      this.last = Date.now();
    }
  }

  clear() {
    Console.gotoSOL();
    Console.eraseLine();
  }
}
