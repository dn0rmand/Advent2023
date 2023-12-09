export function gcd(a: bigint, b: bigint): bigint {
  if (a < b) {
    [a, b] = [b, a];
  }

  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: bigint, b: bigint): bigint {
  return (a / gcd(a, b)) * b;
}

const $factorial: bigint[] = [1n, 1n, 2n];

export function factorial(n: bigint): bigint {
  let idx = Number(n);
  if ($factorial[idx] !== undefined) {
    return $factorial[idx];
  }
  idx = $factorial.length;
  let f = $factorial[idx - 1];
  for (let i = BigInt(idx); i <= n; i++, idx++) {
    f *= i;
    $factorial[idx] = f;
  }
  return f;
}
