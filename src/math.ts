export function clamp(value: number, min: number, max: number): number {
    return  Math.min(max, Math.max(min, value));
}

export function invlerp(a: number, b: number, value: number): number {
    return clamp((value - a) / (b - a), 0, 1);
}

export function fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

export function lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
}

// Smooth maximum of two values, controlled by smoothing factor k
// When k = 0, this behaves identically to max(a, b)
export function smoothMax(a: number, b: number, k: number) {
    k = Math.min(0, -k);
    const h = Math.max(0, Math.min(1, (b - a + k) / (2 * k)));
    return a * h + b * (1 - h) - k * h * (1 - h);
}