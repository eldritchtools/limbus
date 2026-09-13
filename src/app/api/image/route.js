import { randomUUID } from "crypto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { r2 } from "@/app/cdn/r2";
import { getSupabase } from "@/app/database/connection";
import { withRetry } from "@/app/database/supabaseTemplates";


const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        if (!file)
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        if (!ALLOWED_TYPES.includes(file.type))
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

        if (file.size > MAX_FILE_SIZE)
            return NextResponse.json({ error: "File too large" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());

        const metadata = await sharp(buffer, {
            limitInputPixels: 100_000_000,
            animated: true
        }).metadata();

        if (metadata.width > 4000 || metadata.height / metadata.pages > 4000)
            return NextResponse.json({ error: "Image dimensions too large" }, { status: 400 });

        if (metadata.pages && metadata.pages > 200)
            return NextResponse.json({ error: "GIF has too many frames" }, { status: 400 });

        const imageId = randomUUID();

        await withRetry(async () => {
            const { error } = await getSupabase().from("images").insert({
                id: imageId
            })

            if (error) throw error;
        });

        const variants = [
            { name: "sm", size: 400 },
            { name: "lg", size: 1600 }
        ];

        for (const variant of variants) {
            const optimized = await sharp(buffer, { limitInputPixels: 100_000_000, animated: true })
                .resize({
                    width: variant.size,
                    height: variant.size,
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({ quality: 90 })
                .toBuffer();

            const key = `images/${imageId}/${variant.name}.webp`;

            await r2.send(
                new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET,
                    Key: key,
                    Body: optimized,
                    ContentType: "image/webp",
                    CacheControl: "public, max-age=31536000, immutable"
                })
            );
        }

        return NextResponse.json({ success: true, id: imageId });
    } catch (error) {
        console.error(error);

        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}