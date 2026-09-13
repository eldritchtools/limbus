"use client";

import NitroAd from "../components/ads/NitroAd";

export default function AdTestPage() {
    return <div style={{ width: "100%" }}>
        <NitroAd id={"test-page-ad"} allowDemo={true} forceDemo={true} />
    </div>
}
