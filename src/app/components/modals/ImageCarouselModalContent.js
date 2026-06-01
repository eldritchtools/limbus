"use client";

import { useState } from "react";

import UploadedImage from "../icons/UploadedImage";

export default function ImageCarouselModalContent({ imageIds, startingPosition }) {
    const [position, setPosition] = useState(startingPosition);

    return <div style={{width: "auto", height: "auto"}}>
        <UploadedImage id={imageIds[position]} type={"lg"} style={{width: "100%", height: "auto"}} />
    </div>
}
