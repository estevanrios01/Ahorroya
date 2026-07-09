interface Basket {
    store: string;
    total: number;
}

export function basketComparison(
    baskets: Basket[]
) {
    const ordered =
        baskets.sort(
            (a, b) =>
                a.total - b.total
        );

    return {
        cheapest: ordered[0],
        expensive:
            ordered[
                ordered.length - 1
            ]
    };
}
