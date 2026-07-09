import { NextRequest, NextResponse } from "next/server";

import { searchProducts } from "@/services/search";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim().length < 2) {
        return NextResponse.json([]);
    }

    const products = await searchProducts(query);
    return NextResponse.json(products);
}
