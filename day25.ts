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
    for (const c of r) {
      c.connections.sort((c1, c2) => c1.connections.length - c2.connections.length);
    }
    r.sort((c1, c2) => c1.connections.length - c2.connections.length);
    return r;
  }

  furthestPoint(from: Component): Component {
    let states: Component[] = [from];

    const visited = new Set<string>();

    while (states.length) {
      const newStates: Component[] = [];
      for (const current of states) {
        for (const to of current.connections) {
          if (!visited.has(to.name)) {
            visited.add(to.name);
            newStates.push(to);
          }
        }
      }
      if (newStates.length) {
        states = newStates;
      } else {
        break;
      }
    }

    return states[0];
  }

  shortestPath(from: Component, to: Component): Component[] {
    let states: { current: Component; path: Component[] }[] = [
      {
        current: from,
        path: [from],
      },
    ];

    const visited = new Set<string>();
    visited.add(from.name);

    while (states.length) {
      const newStates: { current: Component; path: Component[] }[] = [];
      for (const { current, path } of states) {
        if (current.name === to.name) {
          return path;
        }
        for (const to of current.connections) {
          if (!visited.has(to.name)) {
            visited.add(to.name);
            newStates.push({ current: to, path: [...path, to] });
          }
        }
      }
      states = newStates;
    }

    return [];
  }

  groupSize(from: Component): number {
    const visited = new Set<string>();
    const components = [from];

    while (components.length) {
      const c = components.pop();
      if (c === undefined) {
        continue;
      }
      visited.add(c.name);
      for (const c1 of c.connections) {
        if (!visited.has(c1.name)) {
          components.push(c1);
        }
      }
    }

    return visited.size;
  }

  makeCut(from: Component, to: Component) {
    from.connections = from.connections.filter(c => c.name !== to.name);
    to.connections = to.connections.filter(c => c.name !== from.name);
  }

  restoreLink(from: Component, to: Component) {
    from.connections.push(to);
    to.connections.push(from);
  }

  cut(A: Component, B: Component, count: number): number {
    const path = this.shortestPath(A, B);

    if (count === 0) {
      if (path.length !== 0) {
        return 0;
      }
      const a = this.groupSize(A);
      const b = this.groupSize(B);
      return a * b;
    }

    if (path.length === 0) {
      return 0;
    }

    for (let i = 0; i < path.length - 1; i++) {
      this.makeCut(path[i], path[i + 1]);
    }

    const v = this.cut(A, B, count - 1);
    if (v === 0) {
      for (let i = 0; i < path.length - 1; i++) {
        this.restoreLink(path[i], path[i + 1]);
      }
    }

    return v;
  }

  part1(input: Component[]): number {
    const A = this.furthestPoint(input[1]);
    const B = this.furthestPoint(A);

    const answer = this.cut(A, B, 3);
    return answer;
  }

  part2(input: Component[]): string {
    return 'Merry Christmas';
  }
}

// new Day25().execute();
