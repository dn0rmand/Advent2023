import { Day } from './tools/day.ts';

type Galaxy = {
  id: number;
  x: number;
  y: number;
};

class Input {
  private data: string[];
  private width: number;
  private height: number;

  public galaxies: Galaxy[];

  constructor(data: string[], expansion: number) {
    this.data = data;
    this.height = data.length;
    this.width = data[0].length;
    this.galaxies = [];

    const colWidths = this.getColumnWidths(expansion);
    const rowHeights = this.getRowHeights(expansion);

    for (let y = 0, yy = 0; y < this.height; y++, yy += rowHeights[y]) {
      const line = this.data[y];
      for (let x = 0, xx = 0; x < this.width; x++, xx += colWidths[x]) {
        if (line[x] === '#') {
          const id = this.galaxies.length + 1;
          const galaxy = { id, x: xx, y: yy };
          this.galaxies.push(galaxy);
        }
      }
    }
  }

  getRowHeights(expansion: number): number[] {
    const rowHeights: number[] = [];

    for (let y = 0; y < this.height; y++) {
      const line = this.data[y];
      rowHeights[y] = expansion;
      for (let x = 0; x < this.width; x++) {
        if (line[x] !== '.') {
          rowHeights[y] = 1;
          break;
        }
      }
    }
    return rowHeights;
  }

  getColumnWidths(expansion: number): number[] {
    const columnWidths: number[] = [];

    for (let x = 0; x < this.width; x++) {
      columnWidths[x] = expansion;
      for (let y = 0; y < this.height; y++) {
        if (this.data[y][x] !== '.') {
          columnWidths[x] = 1;
          break;
        }
      }
    }
    return columnWidths;
  }
}

export class Day11 extends Day {
  constructor() {
    super(11);
  }

  loadInput(): string[] {
    return this.readDataFile();
  }

  part1(data: string[]): number {
    let total: number = 0;

    let galaxies = new Input(data, 2).galaxies;

    for (let i = 0; i < galaxies.length; i++) {
      const from = galaxies[i];
      for (let j = i + 1; j < galaxies.length; j++) {
        const to = galaxies[j];
        const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
        total += distance;
      }
    }

    return total;
  }

  part2(data: string[]): number {
    let total: number = 0;

    let galaxies = new Input(data, 1000000).galaxies;

    for (let i = 0; i < galaxies.length; i++) {
      const from = galaxies[i];
      for (let j = i + 1; j < galaxies.length; j++) {
        const to = galaxies[j];
        const distance = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
        total += distance;
      }
    }

    return total;
  }
}

// new Day11().execute();
