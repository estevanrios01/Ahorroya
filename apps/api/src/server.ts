import { createServer } from "node:http";
import { router } from "./router";

const server = createServer(router);

server.listen(4000, () => {
    console.log(
        "AhorroYa API running on :4000"
    );
});
