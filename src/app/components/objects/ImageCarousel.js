"use client";

import { useState } from "react";

import DragContainer from "./DragContainer";
import styles from "./ImageCarousel.module.css";
import UploadedImage, { constructUploadedImgSrc } from "../icons/UploadedImage";
import { useModal } from "../modals/ModalProvider";

export default function ImageCarousel({ imageIds, onRemoveImage, editable }) {
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

    return <DragContainer>
        <div style={{ display: "flex", gap: "0.5rem", width: "max-content" }}>
            {imageIds.map((id, i) =>
                <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className={styles.imageItem} style={{ width: "200px" }} onClick={() => openImageCarouselModal({ imageIds, startingPosition: i })}>
                        <UploadedImage id={id} type={"sm"} className={styles.image} />
                        {editable && <button className={styles.removeButton} onClick={e => { e.stopPropagation(); onRemoveImage(id) }}>✕</button>}
                    </div>

                    {editable && <button onClick={() => copyMarkdown(id)}>{copied === id ? "Copied!" : "Copy Markdown"}</button>}
                </div>
            )}
        </div>
    </DragContainer>
}