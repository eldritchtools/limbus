"use client";

import EgoImage from "../icons/EgoImage";
import IdentityImage from "../icons/IdentityImage";

export default function ImageModalContent({ type, data, mod }) {
    return <div style={{ width: "auto", height: "auto" }}>
        {type === "identity" ?
            <IdentityImage identity={data} uptie={mod} /> :
            <EgoImage ego={data} />
        }
    </div>
}
