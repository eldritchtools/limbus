
"use client";

import { useEffect, useState } from "react";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";

import styles from "./ZoomPanViewer.module.css";

function CenterOnRef({ ref, width, height }) {
    const { zoomToElement } = useControls();

    useEffect(() => {
        if (!ref.current) return;
        zoomToElement(ref.current, 1, 300);
    }, [ref, width, height, zoomToElement]);

    return null;
}

export default function ZoomPanViewer({ width, height, initialScale = 1, minScale = 0.1, maxScale = 4, centerOnRef, children }) {
    const [coordinates, setCoordinates] = useState(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [copied, setCopied] = useState(false);

    const getImageCoordinates = event => {
        const viewer = event.currentTarget;
        const rect = viewer.getBoundingClientRect();

        const x = (event.clientX - rect.left) * (width / rect.width);
        const y = (event.clientY - rect.top) * (height / rect.height);

        if (x < 0 || y < 0 || x >= width || y >= height) return null;

        return { x: Math.floor(x), y: Math.floor(y) };
    };

    const handleMouseMove = event => {
        setCoordinates(getImageCoordinates(event));
    };

    const handleMouseLeave = () => {
        setCoordinates(null);
    };

    const handleClick = event => {
        const coords = getImageCoordinates(event);
        if (!coords) return;

        setSelectedCoordinates(coords);
        setCopied(false);
    };

    const handleCopy = async () => {
        if (!selectedCoordinates) return;
        await navigator.clipboard.writeText(`${selectedCoordinates.x}, ${selectedCoordinates.y}`);
        setCopied(true);
    };

    return <div className={styles.container}>
        <TransformWrapper
            initialScale={initialScale} minScale={minScale} maxScale={maxScale}
            centerOnInit limitToBounds={false} smooth
            wheel={{ step: 0.002 }}
            pinch={{ disabled: false }}
            doubleClick={{ disabled: true }}
            panning={{ disabled: false, velocityDisabled: true }}
            zoomAnimation={{ disabled: false, animationTime: 150 }}
        >
            {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                    <div className={styles.controls}>
                        <button type="button" onClick={() => zoomIn(0.1, 150)} aria-label="Zoom in" title="Zoom in">+</button>
                        <button type="button" onClick={() => zoomOut(0.1, 150)} aria-label="Zoom out" title="Zoom out">−</button>
                        <button type="button" className={styles.reset} onClick={() => resetTransform(150)}>Reset</button>
                    </div>

                    {centerOnRef && <CenterOnRef ref={centerOnRef} width={width} height={height} />}

                    <TransformComponent wrapperClass={styles.wrapper} contentClass={styles.content}>
                        <div style={{ width, height }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}>
                            {children}
                        </div>
                    </TransformComponent>
                </>
            )}
        </TransformWrapper>

        {coordinates && <div className={styles.coordinates}>{`X ${coordinates.x} · Y ${coordinates.y}`}</div>}

        {process.env.NODE_ENV === "development" && selectedCoordinates && (
            <div className={styles.selectedCoordinates}>
                <span>{selectedCoordinates.x}, {selectedCoordinates.y}</span>

                <button type="button" onClick={handleCopy} title="Copy coordinates">
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
        )}
    </div>;
}