import { Day } from './tools/day.ts';

type Component = {
  name: string;
  connections: Component[];
};

export class Day25 extends Day {
  constructor() {
    super(25);
  }

  loadInput(): Component[] {
    const components: { [id: string]: Component } = {};
    const data: { [id: string]: { name: string; connections: string[] } } = {};
    for (const line of this.readDataFile()) {
      const [name, childs] = line.split(': ');
      const children = childs.split(' ');
      const c = data[name];
      if (c) {
        if (c.connections.length > 0) {
          throw 'Error';
        }
        c.connections = children;
        for (const n of children) {
          if (!data[n]) {
            components[n] = { name: n, connections: [] };
            data[n] = { name: n, connections: [] };
          }
        }
      } else {
        data[name] = { name, connections: children };
        components[name] = { name, connections: [] };
      }
    }

    for (const name in data) {
      const children = data[name].connections;
      const component = components[name];
      for (const child of children) {
        let cc: Component = components[child];
        if (!cc) {
          cc = { name: child, connections: [] };
          components[child] = cc;
        }

        if (!component.connections.some(c => c.name === child)) {
          component.connections.push(cc);
        }
        if (!cc.connections.some(c => c.name === name)) {
          cc.connections.push(component);
        }
      }
    }

    const r = Object.values(components);

    return r;
  }

  canReach(from: Component, to: Component, visited: string[]): boolean {
    if (from.name === to.name) {
      return true;
    }
    visited.push(from.name);
    for (const c of from.connections) {
      if (visited.includes(c.name)) {
        continue;
      }
      if (this.canReach(c, to, visited)) {
        return true;
      }
    }

    return false;
  }

  cut(components: Component[], index: number, count: number, cuts: string[]): boolean {
    for (let i = index; i < components.length; i++) {
      const from = components[i];
      const fromConnections = from.connections;
      if (from.connections.length === 1) {
        continue; // don't cut the last one :)
      }
      for (const to of from.connections) {
        const toConnections = to.connections;
        // cut
        from.connections = fromConnections.filter(c => c.name !== to.name);
        to.connections = toConnections.filter(c => c.name !== from.name);

        cuts.push(`${from.name}-${to.name}`);
        if (count === 1) {
          if (!this.canReach(from, to, [])) {
            debugger;
          } else {
            // nope!!!
            return false;
          }
        } else if (this.cut(components, i + 1, count - 1, cuts)) {
          return true;
        }
        cuts.pop();

        // restore
        from.connections = fromConnections;
        to.connections = toConnections;
      }
    }

    return false;
  }

  part1(input: Component[]): number {
    this.cut(input, 0, 3, []);
    return 0;
  }

  part2(input: Component[]): string {
    return 'Merry Christmas';
  }
}

new Day25().execute();
