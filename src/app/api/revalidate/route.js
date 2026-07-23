import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
    const auth = request.headers.get("authorization");

    if (auth !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidateTag("cdn-data", "max");

    return NextResponse.json({ success: true });
}