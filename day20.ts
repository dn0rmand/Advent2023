import { Day } from './tools/day.ts';
import { Parser } from './tools/parser.ts';
import { lcm } from './tools/numberHelper.ts';

enum Pulse {
  Lo = 0,
  Hi = 1,
}

type Message = {
  pulse: Pulse;
  to: Module;
  from: Module;
};

class Queue {
  messages: Message[] = [];
  lo: number = 0;
  hi: number = 0;

  onReceived: (to: Module, from: Module, pulse: Pulse) => void;

  flush() {
    while (this.messages.length) {
      const message = this.messages.shift();
      if (message) {
        message.to.receive(message.from, message.pulse);
        if (message.to instanceof Conjunction && this.onReceived) {
          this.onReceived(message.to, message.from, message.pulse);
        }
      }
    }
  }

  send(pulse: Pulse, from: Module, to: Module) {
    this.lo += pulse === Pulse.Lo ? 1 : 0;
    this.hi += pulse === Pulse.Hi ? 1 : 0;
    this.messages.push({ from, to, pulse });
  }
}

abstract class Module {
  name: string;
  modules: Module[];
  queue: Queue;
  parents: Module[];
  resetting: boolean = false;

  constructor(name: string, queue: Queue) {
    this.name = name;
    this.queue = queue;
    this.modules = [];
    this.parents = [];
  }

  attach(modules: Module[]) {
    this.modules = modules;
    for (const module of modules) {
      module.connect(this);
    }
  }

  dispatch(pulse: Pulse) {
    for (const module of this.modules) {
      this.queue.send(pulse, this, module);
    }
  }

  connect(parent: Module) {
    if (!this.parents.some(p => p.name === parent.name)) {
      this.parents.push(parent);
    }
  }

  abstract receive(sender: Module, pulse: Pulse);

  reset() {
    if (!this.resetting) {
      this.resetting = true;
      for (const module of this.modules) {
        module.reset();
      }
      this.resetting = false;
    }
  }
}

class Output extends Module {
  on = 0;
  constructor(name: string, queue: Queue) {
    super(name, queue);
  }

  receive(_: Module, pulse: Pulse) {
    if (pulse === Pulse.Lo) {
      this.on++;
    }
  }

  reset() {
    this.on = 0;
    super.reset();
  }
}

class FlipFlop extends Module {
  on: boolean;

  constructor(name: string, queue: Queue) {
    super(name, queue);
    this.on = false;
  }

  receive(_: Module, pulse: Pulse) {
    if (pulse === Pulse.Lo) {
      this.on = !this.on;
      this.dispatch(this.on ? Pulse.Hi : Pulse.Lo);
    }
  }

  reset() {
    this.on = false;
    super.reset();
  }
}

class Conjunction extends Module {
  memory: { [id: string]: Pulse };
  lowCount: number;

  constructor(name: string, queue: Queue) {
    super(name, queue);
    this.memory = {};
    this.lowCount = 0;
  }

  connect(parent: Module) {
    this.memory[parent.name] = Pulse.Lo;
    this.lowCount++;
    super.connect(parent);
  }

  receive(sender: Module, pulse: Pulse) {
    if (this.memory[sender.name] !== pulse) {
      this.memory[sender.name] = pulse;
      this.lowCount += pulse === Pulse.Lo ? 1 : -1;
    }
    this.dispatch(this.lowCount ? Pulse.Hi : Pulse.Lo);
  }

  reset() {
    this.lowCount = 0;
    for (const k in this.memory) {
      this.memory[k] = Pulse.Lo;
      this.lowCount++;
    }
    super.reset();
  }
}

class Broadcaster extends Module {
  constructor(name: string, queue: Queue) {
    super(name, queue);
  }

  receive(_: Module, pulse: Pulse) {
    this.dispatch(pulse);
  }

  reset() {
    super.reset();
  }
}

class Button extends Module {
  constructor(name: string, queue: Queue) {
    super(name, queue);
  }

  receive(_: Module, pulse: Pulse) {
    this.dispatch(pulse);
  }

  click() {
    this.dispatch(Pulse.Lo);
    this.queue.flush();
  }

  reset() {
    super.reset();
  }
}

type Input = { button: Button; output: Output; queue: Queue };

export class Day20 extends Day {
  constructor() {
    super(20);
  }

  loadInput(): Input {
    const queue = new Queue();
    const modules: { [id: string]: Module } = {};
    const info: { [id: string]: string[] } = {};

    const lines = this.readDataFile();
    const parser = new Parser('');
    for (const line of lines) {
      let module: Module;

      parser.reset(line);
      let type = parser.peek();
      if (type === '%') {
        parser.skip(1);
        module = new FlipFlop(parser.getWord(), queue);
      } else if (type === '&') {
        parser.skip(1);
        module = new Conjunction(parser.getWord(), queue);
      } else {
        module = new Broadcaster(parser.getWord(), queue);
      }
      modules[module.name] = module;

      parser.expect('->');
      const children: string[] = [];
      while (!parser.eol()) {
        const m = parser.getWord();
        children.push(m);
        parser.skipIf(',');
      }
      info[module.name] = children;
    }

    let output: Output = new Output('output', queue);
    modules[output.name] = output;

    for (const key in info) {
      const module = modules[key];
      const children = info[key].map(m => {
        let module = modules[m];
        if (!module) {
          module = output = new Output(m, queue);
          modules[m] = module;
        }
        return module;
      });
      module.attach(children);
    }

    const button = new Button('button', queue);
    button.attach([modules['broadcaster']]);
    return { button, output, queue };
  }

  part1(input: Input): number {
    const { button, queue } = input;

    for (let i = 0; i < 1000; i++) {
      button.click();
    }
    return queue.hi * queue.lo;
  }

  part2(input: Input): number {
    const { button, output, queue } = input;
    const parent = output.parents[0];
    const found: { [id: string]: number } = {};
    let checks = parent.parents.length;
    let frequency = 1;

    queue.onReceived = (to, from, pulse) => {
      if (pulse === Pulse.Hi && to.name === parent.name) {
        const o = found[from.name];
        if (o) {
          frequency = lcm(frequency, clicks - o);
          checks--;
        }
        found[from.name] = clicks;
      }
    };

    button.reset();

    let clicks = 0;
    while (checks) {
      clicks++;
      button.click();
    }

    return frequency;
  }
}

// new Day20().execute();
