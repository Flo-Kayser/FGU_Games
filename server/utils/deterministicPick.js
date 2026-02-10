import { hashToUint } from "./hash.js";

export function pickIndexDeterministic(seedStr, mod) {
  if (!mod || mod <= 0) return 0;
  return hashToUint(seedStr) % mod;
}
