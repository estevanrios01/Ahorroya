interface Props {
    product: {
        name: string;
        brand: string;
        image: string;
    }
}

export default function ProductCard({
    product
}: Props) {
    return (
        <article
            className="rounded-xl border bg-white p-4"
        >
            <img
                src={product.image}
                alt={product.name}
            />
            <h3>
                {product.name}
            </h3>
            <p>
                {product.brand}
            </p>
        </article>
    );
}
