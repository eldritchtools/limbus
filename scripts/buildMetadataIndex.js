import fs from "fs";
import path from "path";

const CDN_URL = "https://limbus-assets.eldritchtools.com/data/metadata_index.json";

async function build() {
    const res = await fetch(CDN_URL);

    if (!res.ok) {
        throw new Error("Failed to fetch metadata index");
    }

    const data = await res.json();

    const outPath = path.join(process.cwd(), "src/generated/metadataIndex.json");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

    console.log("Metadata index written to build");
}

build();