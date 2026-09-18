/** Reliable client-side unique identifiers — never array indexes. */
export function createId(prefix: string): string {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `${prefix}_${cryptoObj.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function randomToken(length: number, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'): string {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  let out = '';
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const values = new Uint32Array(length);
    cryptoObj.getRandomValues(values);
    for (let i = 0; i < length; i += 1) {
      out += alphabet[values[i] % alphabet.length];
    }
    return out;
  }
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
