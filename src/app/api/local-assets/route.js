import fs from "fs/promises";
import path from "path";

export async function GET(req) {
    if (process.env.ENABLE_LOCAL_DATA !== "true") {
        return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(req.url);
    const fileName = url.searchParams.get("file");
    if (!fileName) return new Response("File not specified", { status: 400 });

    const filePath = path.join(process.env.ASSETS_PATH, fileName);
    const file = await fs.readFile(filePath);

    return new Response(file, { headers: { "Content-Type": "image/png" } });
}