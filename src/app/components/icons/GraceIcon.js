/* eslint-disable @next/next/no-img-element */
"use client";

// import Image from "next/image";

import TierIcon from "./TierIcon";

import { ASSETS_ROOT } from "@/app/paths";

const style = { position: "absolute", top: 0, right: "-50%" }

export default function GraceIcon({ graceId, level, scale = 1 }) {
    const size = `${scale * 75}px`;
    return <div style={{ position: "relative", width: size, height: size }}>
        {/* <Image 
            src={`${ASSETS_ROOT}/icons/${graceId}.png`} alt={graceId} title={graceId} 
            width={75} height={75} style={{ width: "75px", height: "75px" }} 
        /> */}
        <img src={`${ASSETS_ROOT}/icons/${graceId}.png`} alt={graceId} title={graceId} style={{ width: size, height: size }} />
        {level === 2 ? <div style={style}><TierIcon tier={"+"} /></div> : null}
        {level === 3 ? <div style={style}><TierIcon tier={"++"} /></div> : null}
    </div>
}