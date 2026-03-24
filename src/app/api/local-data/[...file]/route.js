import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export async function GET(req) {
    if (process.env.NEXT_PUBLIC_ENABLE_LOCAL_DATA !== "true") {
        return new Response(null, { status: 404 });
    }

    const url = new URL(req.url);
    const fileName = decodeURIComponent(url.pathname.replace("/api/local-data/", ""));
    if (!fileName) return new Response("File not specified", { status: 400 });

    const filePath = path.join(process.env.DATA_PATH, fileName);

    try {
        const raw = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(raw));
    } catch (err) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}
