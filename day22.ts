import { Day } from './tools/day.ts';

type Point = { x: number; y: number; z: number };
type Brick = {
  id: number;
  from: Point;
  to: Point;
};

class Util {
  // Given three collinear points p, q, r, the function checks if
  // point q lies on line segment 'pr'
  static onSegment(p: Point, q: Point, r: Point) {
    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
  }

  // To find orientation of ordered triplet (p, q, r).
  // The function returns following values
  // 0 --> p, q and r are collinear
  // 1 --> Clockwise
  // 2 --> Counterclockwise
  static orientation(p: Point, q: Point, r: Point): number {
    // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
    // for details of below formula.
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) {
      return 0; // collinear
    } else {
      return val > 0 ? 1 : 2; // clock or counterclock wise
    }
  }

  // The main function that returns true if line segment 'p1q1'  and 'p2q2' intersect.
  static doIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {
    // Find the four orientations needed for general and
    // special cases
    let o1 = Util.orientation(p1, q1, p2);
    let o2 = Util.orientation(p1, q1, q2);
    let o3 = Util.orientation(p2, q2, p1);
    let o4 = Util.orientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4) {
      return true;
    }
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && Util.onSegment(p1, p2, q1)) {
      return true;
    }

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && Util.onSegment(p1, q2, q1)) {
      return true;
    }

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && Util.onSegment(p2, p1, q2)) {
      return true;
    }

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && Util.onSegment(p2, q1, q2)) {
      return true;
    }

    return false; // Doesn't fall in any of the above cases
  }
}

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
      if (z1 > z2) {
        throw 'Error';
      }
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
    return Util.doIntersect(b1.from, b1.to, b2.from, b2.to);
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

new Day22().execute();
