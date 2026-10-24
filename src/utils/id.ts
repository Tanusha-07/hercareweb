/** Small, dependency-free unique id. Good enough for local record keys. */
export function uid(prefix = ''): string {
  const rand =
    typeof crypto !== 'undefined' && 'getRandomValues' in crypto
      ? crypto.getRandomValues(new Uint32Array(2)).join('')
      : Math.random().toString(36).slice(2);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}
