"use client";

import { useEffect, useRef, useState } from "react";

import DragContainer from "./DragContainer";
import HintText from "./HintText";
import styles from "./ImageCarousel.module.css";
import UploadedImage, { constructUploadedImgSrc } from "../icons/UploadedImage";
import { useModal } from "../modals/ModalProvider";

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    console.log(file);

    const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (!data?.id) throw new Error("Upload failed");

    return data.id;
}

export async function finalizeImageIds(imageIds, draftImages = {}) {
    const ids = [];
    for (let i = 0; i < imageIds.length; i++) {
        const id = imageIds[i];
        if (id in draftImages) {
            if (draftImages[id].uploadedId) ids.push(draftImages[id].uploadedId);
            else ids.push(await uploadImage(draftImages[id].file));
        } else {
            ids.push(id);
        }
    }
    return ids;
}

function ImageItem({ id, openModal, onRemoveImage, draftImages, setDraftImages, editable, markdownCopyable, mini }) {
    const [hintText, setHintText] = useState("");
    const [uploading, setUploading] = useState(false);

    const copyMarkdown = async id => {
        try {
            await navigator.clipboard.writeText(`![](${constructUploadedImgSrc(id, "lg")})`);
            setHintText("Copied!");
        } catch (err) {
            setHintText("Failed to copy.");
        }
    }

    const handleConfirm = async () => {
        setUploading(true);
        const uploadedId = await uploadImage(draftImages[id].file);
        if (setDraftImages) setDraftImages(p => ({ ...p, [id]: { ...p[id], uploadedId: uploadedId } }));
        setUploading(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className={styles.imageItem} style={{ width: mini ? "100px" : "200px" }} onClick={openModal}>
            {
                editable && draftImages && id in draftImages ?
                    (
                        draftImages[id].uploadedId ?
                            <UploadedImage id={draftImages[id].uploadedId} type={"sm"} className={styles.image} /> :
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={draftImages[id].localUrl} alt={draftImages[id].localUrl} className={styles.image} />
                    ) :
                    <UploadedImage id={id} type={"sm"} className={styles.image} />
            }
            {editable && <button className={styles.removeButton} onClick={e => { e.stopPropagation(); onRemoveImage(id) }}>✕</button>}
        </div>

        {editable && markdownCopyable &&
            <HintText hintText={hintText} setHintText={setHintText}>
                {
                    id in (draftImages ?? {}) ?
                        (
                            draftImages[id].uploadedId ?
                                <button onClick={() => copyMarkdown(draftImages[id].uploadedId)}>Copy Markdown</button> :
                                <button onClick={handleConfirm} disabled={uploading}>Confirm Image</button>
                        ) :
                        <button onClick={() => copyMarkdown(id)}>Copy Markdown</button>
                }
            </HintText>
        }
    </div>
}

function AddImageItemButton({ onAddImages, setDraftImages, mini }) {
    const inputRef = useRef(null);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className={styles.imageItem} style={{ width: mini ? "100px" : "200px" }}>
            <button className={styles.image} onClick={() => inputRef.current?.click()} style={{ boxSizing: "border-box", margin: 0, padding: 0, borderRadius: "12px" }}>
                Click Here or <br /> Paste Images
            </button>

            <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp,image/bmp"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        const id = crypto.randomUUID();
                        onAddImages([id]);
                        setDraftImages(p => ({
                            ...p, [id]:
                            {
                                file: file,
                                uploadedId: null,
                                localUrl: URL.createObjectURL(file)
                            }
                        }))
                    }
                }}
            />
        </div>
    </div>
}

export default function ImageCarousel({ imageIds, onAddImages, onRemoveImage, draftImages, setDraftImages, editable, markdownCopyable = true, maxImages, mini }) {
    const { openImageCarouselModal } = useModal();

    useEffect(() => {
        if (!onAddImages) return;

        const isTypingTarget = el => {
            if (!el) return false;

            const tag = el.tagName;
            return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
        }

        const handlePaste = e => {
            if (isTypingTarget(e.target)) return;
            const items = e.clipboardData?.items;
            if (!items) return;
            const newDrafts = {};
            const ids = [];

            for (const item of items) {
                if (["image/png", "image/jpeg", "image/bmp", "image/webp"].includes(item.type)) {
                    const file = item.getAsFile();
                    if (file) {
                        const id = crypto.randomUUID();
                        newDrafts[id] = {
                            file: file,
                            uploadedId: null,
                            localUrl: URL.createObjectURL(file)
                        }
                        ids.push(id);
                    }
                }
            }

            if (ids.length) {
                onAddImages(ids);
                if (setDraftImages) setDraftImages(p => ({ ...p, ...newDrafts }));
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [onAddImages, setDraftImages]);

    const openModal = pos => {
        openImageCarouselModal({ imageIds, draftImages, startingPosition: pos })
    }

    const displayedImages = maxImages ? imageIds.slice(0, maxImages) : imageIds;

    const contents = <div style={{ display: "flex", gap: "0.5rem", width: "max-content", alignItems: "center" }}>
        {displayedImages.map((id, i) =>
            <ImageItem
                key={id} id={id}
                openModal={() => openModal(i)}
                onRemoveImage={onRemoveImage}
                draftImages={draftImages}
                setDraftImages={setDraftImages}
                editable={editable}
                markdownCopyable={markdownCopyable}
                mini={mini}
            />
        )}
        {editable && 
            <AddImageItemButton onAddImages={onAddImages} setDraftImages={setDraftImages} mini={mini} />
        }
        {
            imageIds.length > maxImages &&
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>+{imageIds.length - maxImages}</span>
        }
    </div>;

    if (editable)
        return <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            {contents}
        </div>
    else
        return <DragContainer>{contents}</DragContainer>
}