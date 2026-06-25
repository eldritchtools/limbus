"use client";

import { useEffect, useState } from "react";

import UploadedImage from "../icons/UploadedImage";

const mainImgStyle = { width: "auto", maxWidth: "100%", height: "auto", maxHeight: "100%" };
const selectionImgStyle = { width: "100%", height: "100%", objectFit: "cover" };

export default function ImageCarouselModalContent({ imageIds, draftImages, startingPosition }) {
    const [position, setPosition] = useState(startingPosition);
    const id = imageIds[position];

    const previous = () => setPosition(p => (p - 1 + imageIds.length) % imageIds.length);
    const next = () => setPosition(p => (p + 1) % imageIds.length);

    const renderImage = (imageId, large = false) => {
        const size = large ? "lg" : "sm";
        const imgStyle = large ? mainImgStyle : selectionImgStyle;

        if (draftImages && imageId in draftImages) {
            if (draftImages[imageId].uploadedId)
                return <UploadedImage id={draftImages[imageId].uploadedId} type={size} style={imgStyle} />;

            // eslint-disable-next-line @next/next/no-img-element
            return <img src={draftImages[imageId].localUrl} alt="" style={imgStyle} />;
        }

        return <UploadedImage id={imageId} type={size} style={imgStyle} />;
    };

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === "ArrowLeft") previous();
            if (e.key === "ArrowRight") next();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", width: "1600px", maxWidth: "90vw", maxHeight: "90vh" }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px minmax(0, 1fr) 30px", alignItems: "center", gap: "0.2rem" }}>
            <button onClick={previous} style={{ margin: "2px", padding: "2px" }}>◀</button>
            <div style={{ display: "flex", justifyContent: "center" }}>{renderImage(id, true)}</div>
            <button onClick={next} style={{ margin: "2px", padding: "2px" }}>▶</button>
        </div>

        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
            {position + 1} / {imageIds.length}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", overflowX: "auto" }}>
            {imageIds.map((imageId, index) => (
                <button key={imageId} onClick={() => setPosition(index)}
                    style={{
                        padding: 0, border: index === position ? "2px solid var(--primary-border-color)" : "1px solid var(--secondary-border-color)",
                        cursor: "pointer", width: 80, height: 80, overflow: "hidden", flexShrink: 0
                    }}
                >
                    <div style={{ width: "100%", height: "100%" }}>
                        {renderImage(imageId, false)}
                    </div>
                </button>
            ))}
        </div>
    </div>
}