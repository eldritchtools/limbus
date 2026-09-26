/* eslint-disable @next/next/no-img-element */

// import Image from "next/image";

import { ASSETS_ROOT } from "@/app/paths";

export default function EnemyIcon({ id, className, style = {} }) {
    return (
        <div className={className} style={{ position: "relative", ...style }}>
            <img
                src={`${ASSETS_ROOT}/encounters/${id}_portrait.webp`}
                alt={id}
                title={id}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                }}
                loading="lazy"
            />
        </div>
    );
}