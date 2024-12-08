export function gcd(a: number, b: number): number {
  if (a < b) {
    [a, b] = [b, a];
  }

  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) {
    f *= i;
  }
  if (f > Number.MAX_SAFE_INTEGER) {
    throw "Factorial too big";
  }
  return f;
}
