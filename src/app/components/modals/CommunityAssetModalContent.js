"use client";

import CommunityAsset from "../icons/CommunityAsset";

export default function CommunityAssetModalContent({ imageId, keywords }) {
    return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "auto", height: "auto" }}>
        <CommunityAsset id={imageId} type={"lg"} />
        <span style={{ textAlign: "center" }}>
            Keywords: {keywords}
        </span>
    </div>
}
