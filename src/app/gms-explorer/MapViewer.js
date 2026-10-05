/* eslint-disable @next/next/no-img-element */
"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { FaComment, FaExclamation, FaSkull, FaStore } from "react-icons/fa";
import { GiBroadsword } from "react-icons/gi";
import { useTransformEffect } from "react-zoom-pan-pinch";

import styles from "./MapViewer.module.css";
import MarkerPopover from "./MarkerPopover";
import ZoomPanViewer from "../components/objects/ZoomPanViewer";

const MARKER_ICONS = {
    shop: FaStore,
    drop: GiBroadsword,
    interaction: SparklesIcon,
    quest: FaExclamation,
    dialogue: FaComment,
    death: FaSkull
};

const MARKER_BACKGROUNDS = {
    shop: "#8a6d3b",
    drop: "#8a3b3b",
    interaction: "#3b6d8a",
    quest: "#e6b84a",
    dialogue: "#5B9BD5",
    death: "#B0B0B0"
};

function Marker({ marker, setSelectedMarker, ref }) {
    const [scale, setScale] = useState(1);

    useTransformEffect(({ state }) => {
        setScale(state.scale);
    });

    if (!marker.x || !marker.y) return null;

    const Icon = MARKER_ICONS[marker.type];
    const markerScale = Math.pow(1 / scale, 0.7);

    return <button ref={ref} key={marker.id} type="button" className={styles.marker}
        style={{
            left: marker.x, top: marker.y, background: MARKER_BACKGROUNDS[marker.type],
            width: `${48 * markerScale}px`, height: `${48 * markerScale}px`
        }}
        onClick={event => { event.stopPropagation(); setSelectedMarker(marker); }}
    >
        <Icon style={{ width: `${30 * markerScale}px`, height: `${30 * markerScale}px` }} />
    </button>
}

export default function MapViewer({
    src, alt = "", width, height, minScale = 0.1, maxScale = 4,
    markers, selectedMarker, setSelectedMarker
}) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const selectedMarkerRef = useRef(null);

    return <ZoomPanViewer width={width} height={height} minScale={minScale} maxScale={maxScale} centerOnRef={selectedMarkerRef}>
        <div className={styles.map} style={{ width, height }}>
            <img src={src} alt={alt} width={width} height={height} draggable={false} onLoad={() => setImageLoaded(true)} />

            {markers?.map(marker =>
                <Marker key={marker.id} marker={marker} setSelectedMarker={setSelectedMarker}
                    ref={selectedMarker?.id === marker.id ? selectedMarkerRef : null}
                />
            )}

            {selectedMarker && <MarkerPopover marker={selectedMarker} onClose={() => setSelectedMarker(null)} />}
        </div>

        {!imageLoaded && <div className={styles.loading}>Loading map...</div>}
    </ZoomPanViewer>
}