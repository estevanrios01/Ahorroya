import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/services/product";

export async function GET(
    request: NextRequest,
    context: {
        params: Promise<{
            slug: string
        }>
    }
) {
    const { slug } = await context.params;
    const product = await getProduct(slug);
    return NextResponse.json(product);
}
