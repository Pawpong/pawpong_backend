export function parseIntegerWithFallback(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

export function parseNonNegativeInteger(value: unknown, fallback: number): number {
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
}
