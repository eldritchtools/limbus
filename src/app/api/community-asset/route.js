import { PutObjectCommand } from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { r2 } from "@/app/cdn/r2";
import { getSupabase } from "@/app/database/connection";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
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

        const type = formData.get("type");

        if (!file || !type) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const buffer = Buffer.from(await file.arrayBuffer());
        let imageId;
        while (true) {
            imageId = nanoid();

            const { data: existing } = await getSupabase()
                .from("community_assets")
                .select("id")
                .eq("id", imageId)
                .maybeSingle();

            if (!existing) break;
        }

        const variants =
            type === "emote"
                ? [
                    { name: "sm", size: 64 },
                    { name: "lg", size: 128 }
                ]
                : [
                    { name: "sm", size: 256 },
                    { name: "lg", size: 384 }
                ];

        for (const variant of variants) {
            const optimized = await sharp(buffer, { limitInputPixels: 4000 * 4000 })
                .resize({
                    width: variant.size,
                    height: variant.size,
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toBuffer();

            const key = `community_assets/${imageId}/${variant.name}.webp`;

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