export function priceTrend(
    history: number[]
) {
    if (
        history.length < 2
    ) {
        return "stable";
    }

    const first = history[0];
    const last =
        history[
            history.length - 1
        ];

    if (last > first) {
        return "up";
    }

    if (last < first) {
        return "down";
    }

    return "stable";
}
