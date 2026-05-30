"use client";

import CommunityAsset from "../icons/CommunityAsset";

export default function CommunityAssetModalContent({ imageId }) {
    return <div style={{display: "flex", justifyContent: "center", width: "auto", height: "auto"}}>
        <CommunityAsset id={imageId} type={"lg"} />
    </div>
}
