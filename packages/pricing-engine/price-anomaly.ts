export function isPriceAnomaly(
    previous: number,
    current: number
) {
    if (previous === 0) {
        return false;
    }

    const variation =
        Math.abs(
            current - previous
        ) / previous;

    return variation > 0.60;
}
