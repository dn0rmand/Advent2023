import { Day } from './tools/day.ts';

// 0 means R,
// 1 means D,
// 2 means L
// 3 means U.

const RIGHT = 0;
const DOWN = 1;
const LEFT = 2;
const UP = 3;

enum Direction {
  Up = UP,
  Down = DOWN,
  Left = LEFT,
  Right = RIGHT,
}

const DirectionValues = {
  R: 0,
  D: 1,
  L: 2,
  U: 3,
};

type Input = {
  direction: Direction;
  distance: number;
  color: number;
};

type Point = {
  x: number;
  y: number;
};

class Lagoon {
  current: Point = { x: 0, y: 0 };
  points: Point[] = [{ x: 0, y: 0 }];
  circonference = 0;

  constructor() {
    this.points.push(this.current);
  }

  area(): number {
    const points = this.points;
    let area = 0;

    for (let i = 1; i < points.length - 1; i++) {
      let { x: x1, y: y1 } = points[i - 1];
      let { x, y } = points[i];
      area += (x + x1) * (y1 - y);
    }

    area = 1 + (Math.abs(area) + this.circonference) / 2;
    return area;
  }

  add(direction: Direction, distance: number) {
    let { x, y } = this.points[this.points.length - 1];

    switch (direction) {
      case Direction.Up:
        y -= distance;
        break;
      case Direction.Down:
        y += distance;
        break;
      case Direction.Left:
        x -= distance;
        break;
      case Direction.Right:
        x += distance;
        break;
    }

    this.points.push({ x: x, y: y });
    this.circonference += distance;
  }
}

export class Day18 extends Day {
  constructor() {
    super(18);
  }

  loadInput(): Input[] {
    return this.readDataFile().map(line => {
      const matches = line.matchAll(/(?<direction>U|D|L|R)\s(?<distance>\d+) \(#(?<color>[0-9a-f]+)\)/g);
      const match = matches.next();
      const groups = match.value.groups;
      const input = {
        direction: DirectionValues[groups.direction],
        distance: +groups.distance,
        color: Number.parseInt(groups.color, 16),
      };
      return input;
    });
  }

  part1(inputs: Input[]): number {
    const lagoon = new Lagoon();

    for (const input of inputs) {
      lagoon.add(input.direction, input.distance);
    }

    const answer = lagoon.area();
    return answer;
  }

  part2(inputs: Input[]): number {
    const lagoon = new Lagoon();

    for (const input of inputs) {
      const direction = input.color % 16;
      const distance = (input.color - direction) / 16;
      lagoon.add(direction, distance);
    }

    const answer = lagoon.area();
    return answer;
  }
}

// new Day18().execute();
