export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** positive modulo, result in [0, m) */
export const mod = (v: number, m: number) => ((v % m) + m) % m;
/** wrap v into [min, min + size) */
export const wrap = (v: number, min: number, size: number) => mod(v - min, size) + min;
