import { Day } from './tools/day.ts';
import { System } from './tools/equationSolver.ts';

const MAX_VX = 100n;
const MAX_VY = 100n;

type Hailstone = {
  x: bigint;
  y: bigint;
  z: bigint;
  vx: bigint;
  vy: bigint;
  vz: bigint;
};

export class Day24 extends Day {
  constructor() {
    super(24);
  }

  loadInput(): Hailstone[] {
    return this.readDataFile().map(line => {
      const [point, velocity] = line.split('@');
      const [x, y, z] = point.split(',').map(v => BigInt(+v));
      const [vx, vy, vz] = velocity.split(',').map(v => BigInt(+v));

      return { x, y, z, vx, vy, vz };
    });
  }

  part1(stones: Hailstone[]): number {
    const min = 200000000000000;
    const max = 400000000000000;

    let total = 0;
    for (let i = 0; i < stones.length - 1; i++) {
      const { x: xa1, y: ya1, vx: vxa, vy: vya } = stones[i];
      const [xa2, ya2] = [Number(xa1 + vxa), Number(ya1 + vya)];

      const a1 = (ya2 - Number(ya1)) / (xa2 - Number(xa1));
      const b1 = Number(ya1) - a1 * Number(xa1);

      for (let j = i + 1; j < stones.length; j++) {
        const { x: xb1, y: yb1, vx: vxb, vy: vyb } = stones[j];
        const [xb2, yb2] = [Number(xb1 + vxb), Number(yb1 + vyb)];

        const a2 = (yb2 - Number(yb1)) / (xb2 - Number(xb1));
        const b2 = Number(yb1) - a2 * Number(xb1);

        if (a1 === a2) {
          continue;
        }

        const x = (b2 - b1) / (a1 - a2);
        const y = a1 * x + b1;
        if (x < min || x > max || y < min || y > max) {
          continue;
        }
        const t1 = vxa ? (x - Number(xa1)) / Number(vxa) : (y - Number(ya1)) / Number(vya);
        const t2 = vxb ? (x - Number(xb1)) / Number(vxb) : (y - Number(yb1)) / Number(vyb);
        if (t1 < 0 || t2 < 0) {
          // That's the past
          continue;
        }

        total++;
      }
    }

    return total;
  }

  validator = (name: string, value: bigint) => {
    if (name.startsWith('t')) {
      // can't be in the past
      return value >= 0n;
    } else {
      return true;
    }
  };

  trySolveXY(stones: Hailstone[], xyz: string, vx0: bigint, vy0: bigint): System | undefined {
    const x0: string = xyz[0] + '0';
    const y0: string = xyz[1] + '0';

    let solved = false;
    const system = new System(this.validator);
    system.impossible = true;
    for (const s of stones) {
      const x: bigint = s[xyz[0]];
      const y: bigint = s[xyz[1]];
      const vx: bigint = s['v' + xyz[0]];
      const vy: bigint = s['v' + xyz[1]];

      if (vx === vx0) {
        system.impossible = false;
        system.set(x0, x);
        if (system.variables.size === 2) {
          break;
        }
      }
      if (vy === vy0) {
        system.impossible = false;
        system.set(y0, y);
        if (system.variables.size === 2) {
          break;
        }
      }
    }

    for (let i = 0; !solved && !system.impossible && i < stones.length; i++) {
      const s = stones[i];
      const t = `t${i}`;
      const x: bigint = s[xyz[0]];
      const y: bigint = s[xyz[1]];
      const vx: bigint = s['v' + xyz[0]];
      const vy: bigint = s['v' + xyz[1]];

      if (vx === vx0 || vy === vy0) {
        return undefined;
      }

      system.addEquation([x0, -x, [t, vx0 - vx]]);
      system.addEquation([y0, -y, [t, vy0 - vy]]);
      solved = system.solve();

      // Remove the ones with only time as variable
      system.equations = system.equations.filter(e => {
        for (const n in e.variables) {
          if (n[0] !== 't') {
            return true;
          }
        }
        return false;
      });

      if (system.variables.has(x0) && system.variables.has(y0)) {
        break;
      }
    }

    if (solved) {
      // Verify

      const $x0 = system.get(x0);
      const $y0 = system.get(y0);
      if ($x0 === undefined || $y0 === undefined) {
        return undefined;
      }
      for (let i = 0; i < stones.length; i++) {
        const stone = stones[i];
        const x: bigint = stone[xyz[0]];
        const y: bigint = stone[xyz[1]];
        const vx: bigint = stone['v' + xyz[0]];
        const vy: bigint = stone['v' + xyz[1]];
        let tx: bigint | undefined = undefined;
        let ty: bigint | undefined = undefined;

        if (vx === vx0 && vy === vy0) {
          return undefined;
        }

        if (vx !== vx0) {
          if (($x0 - x) % (vx - vx0) !== 0n) {
            return undefined;
          }
          tx = ($x0 - x) / (vx - vx0);
        }

        if (vy !== vy0) {
          if (($y0 - y) % (vy - vy0) !== 0n) {
            return undefined;
          }
          ty = ($y0 - y) / (vy - vy0);
        }

        tx = tx === undefined ? ty : tx;
        ty = ty === undefined ? tx : ty;

        if (tx === undefined || tx !== ty || !system.set(`t${i}`, tx)) {
          return undefined;
        }
      }

      return this.trySolveZ(stones, xyz[2], system);
    }

    return undefined;
  }

  trySolveZ(stones: Hailstone[], property: string, system: System): System | undefined {
    stones.forEach((s, i) => {
      if (system.impossible) {
        return;
      }
      const z = s[property];
      const vz = s['v' + property];
      const t = system.get(`t${i}`);
      const Z = BigInt(z);
      const VZ = BigInt(vz);
      const c = -(Z + t * VZ);

      system.addEquation([property + '0', c, [`v${property}0`, t]]);
      system.solve();
    });

    if (system.solve()) {
      return system;
    }

    return undefined;
  }

  distinct(values: bigint[]): bigint[] {
    values.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    return values.filter((v, i) => i === 0 || v !== values[i - 1]);
  }

  part2(stones: Hailstone[]): string {
    let result: System | undefined;

    const vxs = this.distinct(stones.map(s => s.vx));
    const vys = this.distinct(stones.map(s => s.vy));
    const vzs = this.distinct(stones.map(s => s.vz));

    if (!result) {
      for (let vy0 = -MAX_VY; !result && vy0 <= MAX_VY; vy0++) {
        if (vys.includes(vy0)) {
          continue;
        }
        for (const vz0 of vzs) {
          result = this.trySolveXY(stones, 'yzx', vy0, vz0);
          if (result) {
            break;
          }
        }
      }
    }

    if (!result) {
      for (let vy0 = -MAX_VY; !result && vy0 <= MAX_VY; vy0++) {
        if (vys.includes(vy0)) {
          continue;
        }
        for (const vx0 of vxs) {
          result = this.trySolveXY(stones, 'xyz', vx0, vy0);
          if (result) {
            break;
          }
        }
      }
    }

    if (!result) {
      for (let vx0 = -MAX_VX; !result && vx0 <= MAX_VX; vx0++) {
        if (vxs.includes(vx0)) {
          continue;
        }
        for (const vy0 of vys) {
          result = this.trySolveXY(stones, 'xyz', vx0, vy0);
          if (result) {
            break;
          }
        }
      }
    }

    if (result) {
      const [x0, y0, z0] = [result.get('x0'), result.get('y0'), result.get('z0')];

      return `${x0.valueOf() + y0.valueOf() + z0.valueOf()}`;
    }
    return 'No Solutions';
  }
}

// new Day24().execute();
