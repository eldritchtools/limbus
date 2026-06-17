"use client";

import { useState } from "react";

import DragContainer from "./DragContainer";
import styles from "./ImageCarousel.module.css";
import UploadedImage, { constructUploadedImgSrc } from "../icons/UploadedImage";
import { useModal } from "../modals/ModalProvider";

export default function ImageCarousel({ imageIds, onRemoveImage, editable, markdownCopyable = true, maxImages, mini }) {
    const { openImageCarouselModal } = useModal();
    const [copied, setCopied] = useState(null);

    const copyMarkdown = async id => {
        try {
            await navigator.clipboard.writeText(`![](${constructUploadedImgSrc(id, "lg")})`);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
        }
    }

    const displayedImages = maxImages ? imageIds.slice(0, maxImages) : imageIds;

    return <DragContainer>
        <div style={{ display: "flex", gap: "0.5rem", width: "max-content", alignItems: "center" }}>
            {displayedImages.map((id, i) =>
                <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={styles.imageItem} style={{ width: mini ? "100px" : "200px" }} onClick={() => openImageCarouselModal({ imageIds, startingPosition: i })}>
                        <UploadedImage id={id} type={"sm"} className={styles.image} />
                        {editable && <button className={styles.removeButton} onClick={e => { e.stopPropagation(); onRemoveImage(id) }}>✕</button>}
                    </div>

                    {editable && markdownCopyable && <button onClick={() => copyMarkdown(id)}>{copied === id ? "Copied!" : "Copy Markdown"}</button>}
                </div>
            )}
            {
                imageIds.length > maxImages &&
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>+{imageIds.length - maxImages}</span>
            }
        </div>
    </DragContainer>
}