import { Day } from './tools/day.ts';

enum Direction {
  Right = 1,
  Left,
  Up,
  Down,
}

type State = {
  x: number;
  y: number;
  direction: Direction;
};

export class Day16 extends Day {
  width: number = 0;
  height: number = 0;

  constructor() {
    super(16);
  }

  makeKey(state: State): number {
    return state.y * 1200 + state.x * 10 + state.direction;
  }

  loadInput(): string[] {
    return this.readDataFile();
  }

  splitX(state: State): State[] {
    return [
      { x: state.x - 1, y: state.y, direction: Direction.Left },
      { x: state.x + 1, y: state.y, direction: Direction.Right },
    ];
  }

  splitY(state: State): State[] {
    return [
      { x: state.x, y: state.y - 1, direction: Direction.Up },
      { x: state.x, y: state.y + 1, direction: Direction.Down },
    ];
  }

  nextPos(state: State): State[] {
    const { x, y, direction } = state;
    switch (direction) {
      case Direction.Right:
        return [{ x: x + 1, y, direction }];
      case Direction.Left:
        return [{ x: x - 1, y, direction }];
      case Direction.Down:
        return [{ x, y: y + 1, direction }];
      case Direction.Up:
        return [{ x, y: y - 1, direction }];
      default:
        throw new Error('Invalid direction');
    }
  }

  move(map: string[], state: State): State[] {
    let { x, y, direction } = state;

    switch (map[y][x]) {
      case '/':
        switch (direction) {
          case Direction.Right:
            direction = Direction.Up;
            break;
          case Direction.Left:
            direction = Direction.Down;
            break;
          case Direction.Up:
            direction = Direction.Right;
            break;
          case Direction.Down:
            direction = Direction.Left;
            break;
        }
        break;
      case '\\':
        switch (direction) {
          case Direction.Right:
            direction = Direction.Down;
            break;
          case Direction.Left:
            direction = Direction.Up;
            break;
          case Direction.Up:
            direction = Direction.Left;
            break;
          case Direction.Down:
            direction = Direction.Right;
            break;
        }
        break;
      case '-':
        if (direction === Direction.Up || direction === Direction.Down) {
          return this.splitX(state);
        }
        break;
      case '|':
        if (direction === Direction.Left || direction === Direction.Right) {
          return this.splitY(state);
        }
        break;
    }

    return this.nextPos({ x, y, direction });
  }

  process(map: string[], start: State): number {
    const WIDTH = map[0].length;
    const HEIGHT = map.length;

    let states = [start];

    const visited = new Set<number>();
    const turnedOn = new Set<number>();
    let key: number;

    while (states.length > 0) {
      const state = states[0];
      states.shift();
      key = this.makeKey(state);
      key = key - (key % 10); // Remove the direction
      turnedOn.add(key);

      for (const newState of this.move(map, state)) {
        if (newState.x < 0 || newState.y < 0 || newState.x >= this.width || newState.y >= this.height) {
          continue;
        }
        key = this.makeKey(newState);
        if (visited.has(key)) {
          continue;
        }
        visited.add(key);
        states.push(newState);
      }
    }

    return turnedOn.size;
  }

  part1(map: string[]): number {
    this.width = map[0].length;
    this.height = map.length;

    const answer = this.process(map, { x: 0, y: 0, direction: Direction.Right });
    return answer;
  }

  part2(map: string[]): number {
    this.width = map[0].length;
    this.height = map.length;

    let max = 0;

    max = map.reduce((max, _, y) => {
      const v1 = this.process(map, { x: 0, y, direction: Direction.Right });
      const v2 = this.process(map, { x: this.width - 1, y, direction: Direction.Left });
      return Math.max(max, v1, v2);
    }, max);

    max = map[0].split('').reduce((max, _, x) => {
      const v1 = this.process(map, { x, y: 0, direction: Direction.Down });
      const v2 = this.process(map, { x, y: this.height - 1, direction: Direction.Up });
      return Math.max(max, v1, v2);
    }, max);

    return max;
  }
}

// new Day16().execute();
