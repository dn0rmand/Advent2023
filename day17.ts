import { Day } from './tools/day.ts';

enum Direction {
  Left = 0,
  Down = 1,
}

type State = {
  x: number;
  y: number;
  sum: number;
  direction: Direction;
};

type Map = Uint8Array[];

export class Day17 extends Day {
  width: number = 0;
  height: number = 0;
  map: Map;

  constructor() {
    super(17);
  }

  makeKey(state: State): number {
    return (state.y * this.width + state.x) * 2 + state.direction;
  }

  loadInput(): Map {
    const data = this.readDataFile();

    this.map = data.map(l => new Uint8Array(l.split('').map(v => +v)));
    this.width = data[0].length;
    this.height = data.length;

    return this.map;
  }

  mapValue(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    return this.map[y][x];
  }

  makeState(state: State, x: number, y: number): State {
    return {
      x: x + state.x,
      y: y + state.y,
      direction: x ? Direction.Left : Direction.Down,
      sum: state.sum + this.mapValue(x + state.x, y + state.y),
    };
  }

  move(state: State, min: number, max: number): State[] {
    const newStates: State[] = [];

    let ox = state.direction === Direction.Left ? 0 : 1;
    let oy = state.direction === Direction.Down ? 0 : 1;

    let s1 = state;
    let s2 = state;

    for (let i = 1; i <= max; i++) {
      s1 = this.makeState(s1, ox, oy);
      s2 = this.makeState(s2, -ox, -oy);
      if (i >= min) {
        newStates.push(s1);
        newStates.push(s2);
      }
    }
    return newStates;
  }

  distance(state: State): number {
    return this.width - 1 - state.x + this.height - 1 - state.y;
  }

  process(starts: State[], minSteps: number, maxSteps: number): number {
    const visited = new Uint16Array(this.width * this.height * 2);

    let key: number;
    let states: State[][] = [starts];

    starts.forEach(state => {
      const key = this.makeKey(state);
      visited[key] = state.sum;
    });

    let min = this.distance({ x: 0, y: 0, direction: Direction.Down, sum: 0 }) * 9;

    for (let i = 0; i < states.length; i++) {
      for (const state of states[i] || []) {
        let dist = this.distance(state);

        if (state.sum + dist >= min) {
          continue;
        }

        if (dist === 0) {
          min = state.sum;
          continue;
        }

        const moves = this.move(state, minSteps, maxSteps);

        for (const newState of moves) {
          if (newState.x < 0 || newState.y < 0 || newState.x >= this.width || newState.y >= this.height) {
            continue;
          }

          const sum = newState.sum;

          if (sum + this.distance(newState) >= min) {
            continue;
          }

          key = this.makeKey(newState);
          const old = visited[key];
          if (old > 0 && old <= sum) {
            continue;
          }
          visited[key] = sum;

          if (states[sum]) {
            states[sum].push(newState);
          } else {
            states[sum] = [newState];
          }
        }
      }
      delete states[i];
    }

    return min;
  }

  part1(_map: Map): number {
    const s1 = { x: 0, y: 0, direction: Direction.Left, sum: 0, previous: undefined };
    const s2 = { x: 0, y: 0, direction: Direction.Down, sum: 0, previous: undefined };
    const answer = this.process([s1, s2], 1, 3);
    return answer;
  }

  part2(_map: Map): number {
    const s1 = { x: 0, y: 0, direction: Direction.Left, sum: 0, previous: undefined };
    const s2 = { x: 0, y: 0, direction: Direction.Down, sum: 0, previous: undefined };
    const answer = this.process([s1, s2], 4, 10);
    return answer;
  }
}

// new Day17().execute();
