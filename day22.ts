import { Day } from './tools/day.ts';
import { Point, intersect } from './tools/geometry.ts';

type Point3D = Point & {
  z: number;
};

type Brick = {
  id: number;
  from: Point3D;
  to: Point3D;
};

export class Day22 extends Day {
  supports: number[][];

  constructor() {
    super(22);
    this.supports = [];
  }

  loadInput(): Brick[] {
    let next = 0;
    const bricks = this.readDataFile().map(l => {
      const [from, to] = l.split('~');
      const [x1, y1, z1] = from.split(',').map(v => +v);
      const [x2, y2, z2] = to.split(',').map(v => +v);

      return {
        id: ++next,
        from: { x: x1, y: y1, z: z1 },
        to: { x: x2, y: y2, z: z2 },
      };
    });
    bricks.sort((a, b) => a.to.z - b.to.z);
    return bricks;
  }

  addSupport(up: number, down: number) {
    const supports: number[] | undefined = this.supports[up];
    if (!supports) {
      this.supports[up] = [down];
    } else if (!supports.includes(down)) {
      supports.push(down);
    }
  }

  intersect(b1: Brick, b2: Brick): boolean {
    return intersect(b1.from, b1.to, b2.from, b2.to);
  }

  moveDown(bricks: Brick[], up: Brick, index: number): number {
    if (up.from.z === 1) {
      return 0;
    }

    let lowest = 0;
    let supports: number[] = [];

    for (let i = index - 1; lowest < up.from.z && i >= 0; i--) {
      const down = bricks[i];
      if (this.intersect(up, down)) {
        if (down.to.z > lowest) {
          supports = [down.id];
          lowest = down.to.z;
        } else if (down.to.z === lowest) {
          supports.push(down.id);
        }
      }
    }

    if (lowest < up.from.z) {
      const diff = up.from.z - (lowest + 1);
      up.to.z -= diff;
      up.from.z -= diff;
      supports.forEach(down => this.addSupport(up.id, down));
      if (supports.length === 1) {
        return supports[0];
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  part1(bricks: Brick[]): number {
    const excluded = new Set<number>();

    bricks.forEach((brick, index) => {
      const support = this.moveDown(bricks, brick, index);
      if (support) {
        excluded.add(support);
      }
    });

    const total = bricks.length - excluded.size;
    return total;
  }

  part2(bricks: Brick[]): number {
    let total = 0;
    for (let i = 0; i < bricks.length; i++) {
      const movers = new Set<number>();
      movers.add(bricks[i].id);
      for (let j = i + 1; j < bricks.length; j++) {
        const currentId = bricks[j].id;
        const supports = this.supports[currentId];
        if (supports === undefined) {
          continue;
        }
        let moves = true;
        for (const id of supports) {
          if (!movers.has(id)) {
            moves = false;
          }
        }
        if (moves) {
          movers.add(currentId);
        }
      }
      total += movers.size - 1;
    }
    return total;
  }
}

// new Day22().execute();
