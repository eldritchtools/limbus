import sharp from "sharp";

export async function loadImagePixels(src) {
    const response = await fetch(src);

    if (!response.ok) throw new Error(`Failed to load image: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());

    const { data } = await sharp(buffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return data;
}