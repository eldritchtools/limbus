import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
    revalidateTag("cdn-data", "max");

    return NextResponse.json({ success: true });
}