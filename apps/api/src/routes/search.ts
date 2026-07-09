import {
    IncomingMessage,
    ServerResponse
} from "node:http";

export async function searchRoute(
    req: IncomingMessage,
    res: ServerResponse
) {
    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(
        JSON.stringify({
            success: true
        })
    );
}
