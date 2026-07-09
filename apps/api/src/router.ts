import { IncomingMessage, ServerResponse } from "node:http";
import { productsRoute } from "./routes/products";
import { searchRoute } from "./routes/search";

export async function router(
    req: IncomingMessage,
    res: ServerResponse
) {
    if (
        req.url?.startsWith("/products")
    ) {
        return productsRoute(req, res);
    }

    if (
        req.url?.startsWith("/search")
    ) {
        return searchRoute(req, res);
    }

    res.statusCode = 404;
    res.end();
}
