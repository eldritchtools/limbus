"use client";

import { useState } from "react";

import UploadedImage from "../icons/UploadedImage";

export default function ImageCarouselModalContent({ imageIds, draftImages, startingPosition }) {
    const [position, setPosition] = useState(startingPosition);
    const id = imageIds[position];

    return <div style={{ width: "auto", height: "auto" }}>
        {
            draftImages && id in draftImages ?
                (
                    draftImages[id].uploadedId ?
                        <UploadedImage id={draftImages[id].uploadedId} type={"lg"} style={{ width: "100%", height: "auto" }} /> :
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draftImages[id].localUrl} alt={draftImages[id].localUrl} style={{ width: "100%", height: "auto" }} />
                ) :
                <UploadedImage id={id} type={"lg"} style={{ width: "100%", height: "auto" }} />
        }
    </div>
}
