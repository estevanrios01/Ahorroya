import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const publicPaths = [
        "/",
        "/api/health",
        "/api/products",
        "/api/search",
        "/api/stores",
        "/api/barcode",
        "/api/promotions",
    ];

    const isPublic = publicPaths.some((path) => pathname.startsWith(path));
    const isApi = pathname.startsWith("/api");

    if (isApi && !isPublic) {
        const authHeader = request.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: "Autenticación requerida" },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};
