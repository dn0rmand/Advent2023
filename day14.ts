import { Day } from './tools/day.ts';

export class Day14 extends Day {
  constructor() {
    super(14);
  }

  loadInput(): string[] {
    return this.readDataFile();
  }

  tiltColumn(map: string[][], column: number, direction: number): number {
    const height = map.length;

    let free = direction > 0 ? 0 : height - 1;
    let current = free;
    let total = 0;
    while (current >= 0 && current < height) {
      const c = map[current][column];
      if (c === 'O') {
        if (current !== free) {
          map[current][column] = '.';
          map[free][column] = 'O';
        }
        total += height - free;
        free += direction;
        current += direction;
      } else if (c === '#') {
        current += direction;
        free = current;
      } else {
        current += direction;
      }
    }
    return total;
  }

  tiltRow(map: string[][], row: number, direction: number): number {
    const height = map.length;
    const width = map[0].length;

    let free = direction > 0 ? 0 : width - 1;
    let current = free;
    let total = 0;
    while (current >= 0 && current < width) {
      const c = map[row][current];
      if (c === 'O') {
        if (current !== free) {
          map[row][current] = '.';
          map[row][free] = 'O';
        }
        total += height - row;
        free += direction;
        current += direction;
      } else if (c === '#') {
        current += direction;
        free = current;
      } else {
        current += direction;
      }
    }
    return total;
  }

  tiltNorth(map: string[][]): number {
    const total = map[0].reduce((total, _, i) => total + this.tiltColumn(map, i, 1), 0);
    return total;
  }

  tiltSouth(map: string[][]): number {
    const total = map[0].reduce((total, _, i) => total + this.tiltColumn(map, i, -1), 0);
    return total;
  }

  tiltWest(map: string[][]): number {
    const total = map.reduce((total, _, i) => total + this.tiltRow(map, i, 1), 0);
    return total;
  }

  tiltEast(map: string[][]): number {
    const total = map.reduce((total, _, i) => total + this.tiltRow(map, i, -1), 0);
    return total;
  }

  cycle(map: string[][]): number {
    this.tiltNorth(map);
    this.tiltWest(map);
    this.tiltSouth(map);
    return this.tiltEast(map);
  }

  part1(input: string[]): number {
    const map = input.map(s => s.split(''));
    return this.tiltNorth(map);
  }

  part2(input: string[]): number {
    const map = input.map(s => s.split(''));
    const maxCycle = 1000000000;
    const cycleMap: { [id: number]: number } = {};

    let value = 0;
    let cycle = 0;
    let previousDiff = 0;
    while (cycle < maxCycle) {
      cycle++;
      value = this.cycle(map);
      if (cycleMap[value] !== undefined) {
        const diff = cycle - cycleMap[value];

        if (diff > 1 && previousDiff === diff) {
          let remaining = (maxCycle - cycle) % diff;
          while (remaining--) {
            value = this.cycle(map);
          }
          break;
        }
        previousDiff = diff;
      }
      cycleMap[value] = cycle;
    }

    return value;
  }
}

// new Day14().execute();
