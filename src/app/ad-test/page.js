"use client";

import NitroAnchorAd from "../components/ads/NitroAnchorAd";
import NitroSideStackAd from "../components/ads/NitroSideStackAd";

export default function AdTestPage() {
    return <div style={{ display: "flex", width: "100%", height: "200vh" }}>
        <NitroAnchorAd id={"anchor-ad"} allowDemo={true} forceDemo={true} />
        <div style={{ flex: 1 }} />
        <div style={{ width: "250px" }}>
            <NitroSideStackAd id={"side-stack-ad"} allowDemo={true} forceDemo={true} />
        </div>
    </div>
}
