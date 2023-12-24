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
  supports: Map<number, Set<number>>;

  constructor() {
    super(22);
    this.supports = new Map();
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

  getSupports(brick: Brick): Set<number> {
    let supports: Set<number> | undefined = this.supports.get(brick.id);
    if (!supports) {
      supports = new Set();
      this.supports.set(brick.id, supports);
    }
    return supports;
  }

  intersect(b1: Brick, b2: Brick): boolean {
    return intersect(b1.from, b1.to, b2.from, b2.to);
  }

  touches(up: Brick, down: Brick): boolean {
    if (up.id === down.id) {
      return false;
    }

    if (up.from.z !== down.to.z + 1) {
      return false;
    }

    const supports = this.getSupports(up);

    if (supports.has(down.id)) {
      return true;
    }

    if (this.intersect(up, down)) {
      supports.add(down.id);
      return true;
    }

    return false;
  }

  canMoveDown(bricks: Brick[], up: Brick, index: number): boolean {
    if (up.from.z === 1) {
      return false;
    }
    for (let i = index - 1; i >= 0; i--) {
      const down = bricks[i];
      if (this.touches(up, down)) {
        return false;
      }
    }

    return true;
  }

  moveDown(bricks: Brick[], brick: Brick, index: number) {
    while (this.canMoveDown(bricks, brick, index)) {
      brick.from.z--;
      brick.to.z--;
    }
    // Ensure all supports are calculated
    for (let i = index - 1; i >= 0; i--) {
      this.touches(brick, bricks[i]);
    }
  }

  gravity(bricks: Brick[]) {
    bricks.forEach((brick, index) => this.moveDown(bricks, brick, index));
  }

  part1(bricks: Brick[]): number {
    // process fall
    this.gravity(bricks);

    const excluded = new Set<number>();

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      const supports = this.getSupports(b);
      if (supports.size === 1) {
        excluded.add([...supports.values()][0]);
      }
    }

    const total = bricks.length - excluded.size;
    return total;
  }

  explode(bricks: Brick[], brick: Brick, movers: Set<number>) {
    if (movers.has(brick.id)) {
      return; // already processed
    }
    movers.add(brick.id);
    for (const other of bricks.filter(b => this.getSupports(b).has(brick.id))) {
      let supported = false;
      for (const id of this.getSupports(other).values()) {
        if (!movers.has(id)) {
          supported = true;
        }
      }
      if (!supported) {
        this.explode(bricks, other, movers);
      }
    }
  }

  part2(bricks: Brick[]): number {
    let total = 0;
    for (let i = 0; i < bricks.length; i++) {
      const movers = new Set<number>();
      this.explode(bricks, bricks[i], movers);
      total += movers.size - 1;
    }
    return total;
  }
}

// new Day22().execute();
