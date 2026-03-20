import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
    if (process.env.ENABLE_LOCAL_DATA !== "true") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fileName = params.file;
    const filePath = path.join(process.env.DATA_PATH, fileName);

    try {
        const raw = await fs.readFile(filePath, "utf-8");
        return NextResponse.json(JSON.parse(raw));
    } catch (err) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}