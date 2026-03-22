import { useRef } from "react";
import { useSmoothAutoScroll } from "smooth-auto-scroll";

export default function AutoScroller({ fade = true, children }) {
    const containerRef = useRef(null);
    const innerRef = useRef(null);
    const hasReachedEndRef = useRef(false);

    useSmoothAutoScroll({
        containerRef,
        innerRef,
        pxPerSecond: 25,
        pauseEvents: ["wheel", "touchmove"],
        resumeEvents: ["mouseleave", "touchend"],
        useTransform: true,
        onReachEnd: () => {
            if (!containerRef.current || hasReachedEndRef.current) return;
            hasReachedEndRef.current = true;

            setTimeout(() => {
                if (!containerRef.current) return;
                containerRef.current.scrollTop = 0;
                hasReachedEndRef.current = false;
            }, 1000);
        },
    });

    return <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
            ref={containerRef}
            className="dark-scrollable"
            style={{
                width: "100%",
                height: "100%",
                overflowY: "scroll",
                overflowX: "hidden",
                willChange: "transform",
                backfaceVisibility: "hidden",
                transformStyle: "preserve-3d"
            }}
        >
            <div ref={innerRef} style={{ padding: "10px 0px" }}>{children}</div>
        </div>

        {/* Top fade */}
        {fade ? <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 30,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                pointerEvents: 'none',
            }}
        /> : null}

        {/* Bottom fade */}
        {fade ? <div
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 30,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                pointerEvents: 'none',
            }}
        /> : null}
    </div>
}