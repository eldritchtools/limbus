/* eslint-disable @next/next/no-img-element */
"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { FaExclamation, FaStore } from "react-icons/fa";
import { GiBroadsword } from "react-icons/gi";
import { TransformComponent, TransformWrapper, useControls, useTransformEffect } from "react-zoom-pan-pinch";

import styles from "./MapViewer.module.css";
import MarkerPopover from "./MarkerPopover";

const MARKER_ICONS = {
    shop: FaStore,
    drop: GiBroadsword,
    interaction: SparklesIcon,
    quest: FaExclamation
};

const MARKER_BACKGROUNDS = {
    shop: "#8a6d3b",
    drop: "#8a3b3b",
    interaction: "#3b6d8a",
    quest: "#e6b84a"
}

function Marker({ marker, setSelectedMarker, ref }) {
    const [scale, setScale] = useState(1);

    useTransformEffect(({ state }) => {
        setScale(state.scale);
    });

    const Icon = MARKER_ICONS[marker.type];
    const markerScale = Math.pow(1 / scale, 0.7);

    return <button
        ref={ref}
        key={marker.id} type="button"
        className={`${styles.marker}`}
        style={{
            left: marker.x, top: marker.y, background: MARKER_BACKGROUNDS[marker.type],
            width: `${48 * markerScale}px`, height: `${48 * markerScale}px`
        }}
        onClick={event => {
            event.stopPropagation();
            setSelectedMarker(marker);
        }}
    >
        <Icon style={{ width: `${30 * markerScale}px`, height: `${30 * markerScale}px` }} />
    </button>
}

function CenterOnMarker({ markerRef, width, height }) {
    const { zoomToElement } = useControls();

    useEffect(() => {
        if (!markerRef.current) return;

        zoomToElement(markerRef.current, 1, 300);
    }, [markerRef, width, height, zoomToElement]);

    return null;
}

export default function MapViewer({
    src, alt = "", width, height, minScale = 0.1, maxScale = 4,
    markers, selectedMarker, setSelectedMarker
}) {
    const [coordinates, setCoordinates] = useState(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [copied, setCopied] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const selectedMarkerRef = useRef(null);

    const getImageCoordinates = event => {
        const map = event.currentTarget;
        const rect = map.getBoundingClientRect();

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
            key={`${src}-${width}-${height}`}
            initialScale={1} minScale={minScale} maxScale={maxScale}
            centerOnInit limitToBounds={false} smooth
            wheel={{ step: 0.002 }}
            pinch={{ disabled: false }}
            doubleClick={{ disabled: true }}
            panning={{ disabled: false, velocityDisabled: true }}
            zoomAnimation={{ disabled: false, animationTime: 150 }}
        >
            {({ zoomIn, zoomOut, resetTransform, scale }) => (
                <>
                    <div className={styles.controls}>
                        <button type="button" onClick={() => zoomIn(0.1, 150)} aria-label="Zoom in" title="Zoom in">+</button>
                        <button type="button" onClick={() => zoomOut(0.1, 150)} aria-label="Zoom out" title="Zoom out">−</button>
                        <button type="button" className={styles.reset} onClick={() => resetTransform(150)}>Reset</button>
                    </div>

                    <CenterOnMarker markerRef={selectedMarkerRef} width={width} height={height} />

                    <TransformComponent wrapperClass={styles.wrapper} contentClass={styles.content}>
                        <div className={styles.map} style={{ width, height }}
                            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick}
                        >
                            <img src={src} alt={alt} width={width} height={height} draggable={false} onLoad={() => setImageLoaded(true)} />

                            {markers && markers.map(marker =>
                                <Marker
                                    key={marker.id} marker={marker} setSelectedMarker={setSelectedMarker}
                                    ref={selectedMarker?.id === marker.id ? selectedMarkerRef : null}
                                />
                            )}

                            {selectedMarker && (
                                <MarkerPopover marker={selectedMarker} onClose={() => setSelectedMarker(null)} />
                            )}
                        </div>
                    </TransformComponent>

                    {!imageLoaded && (
                        <div className={styles.loading}>
                            Loading map...
                        </div>
                    )}
                </>
            )}
        </TransformWrapper>

        {coordinates &&
            <div className={styles.coordinates}>
                {`X ${coordinates.x} · Y ${coordinates.y}`}
            </div>
        }

        {process.env.NODE_ENV === "development" && selectedCoordinates && (
            <div className={styles.selectedCoordinates}>
                <span>{selectedCoordinates.x}, {selectedCoordinates.y}</span>

                <button type="button" onClick={handleCopy} title="Copy coordinates">
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
        )}
    </div>
}