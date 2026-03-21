import Image from "next/image";
import { useState } from "react";

export function extractYouTubeId(input) {
    if (!input) return null;

    // If they entered just an ID and it's 11 chars
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
        return input;
    }

    try {
        const url = new URL(input);

        // https://www.youtube.com/watch?v=VIDEOID
        if (url.searchParams.has("v")) {
            const id = url.searchParams.get("v");
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }

        // youtu.be/VIDEOID
        if (url.hostname === "youtu.be") {
            const id = url.pathname.slice(1);
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }

        // youtube.com/embed/VIDEOID
        if (url.pathname.startsWith("/embed/")) {
            const id = url.pathname.replace("/embed/", "");
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }

        // youtube.com/v/VIDEOID
        if (url.pathname.startsWith("/v/")) {
            const id = url.pathname.replace("/v/", "");
            return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
        }

    } catch (e) {
        // Not a URL
        return null;
    }

    return null;
}

export function YouTubeThumbnailEmbed({ videoId, className }) {
    const [isPlaying, setIsPlaying] = useState(false);

    if (!videoId) return null;

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return (
        <div
            className={className}
            style={{
                position: "relative",
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "16 / 9",
                minHeight: "150px",
                flexShrink: 0,
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                backgroundColor: "#000",
            }}
            onClick={() => setIsPlaying(true)}
        >
            {isPlaying ? (
                // Actual YouTube iframe
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                />
            ) : (
                // Thumbnail preview
                <>
                    <Image
                        src={thumbnailUrl}
                        alt="YouTube video thumbnail"
                        fill
                        style={{ objectFit: "cover", filter: "brightness(0.85)" }}
                        sizes="(max-width: 768px) 100vw, 800px"
                    />

                    {/* Play button overlay */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "72px",
                            height: "72px",
                            background: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="white"
                            style={{ marginLeft: "4px" }}
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </>
            )}
        </div>
    );
}
