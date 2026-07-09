interface Props {
    store: string;
    price: number;
}

export default function StorePriceCard({
    store,
    price
}: Props) {
    return (
        <article className="rounded-xl border p-4">
            <h3>
                {store}
            </h3>
            <strong>
                ${price.toLocaleString("es-CO")}
            </strong>
        </article>
    );
}
