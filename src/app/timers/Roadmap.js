import { useMemo } from "react";

import { useData } from "../components/DataProvider";
import ImageHandler from "../components/icons/ImageHandler";
import ZoomPanViewer from "../components/objects/ZoomPanViewer";

export default function Roadmap() {
    const [roadmap, roadmapLoading] = useData("roadmap");

    const icons = useMemo(() => {
        if (roadmapLoading) return [];
        const icons = [];
        const [width, height] = roadmap.size;

        roadmap.icons.forEach(icon => icon.coords.forEach(coords => {
            icons.push(<ImageHandler
                key={`${coords[0]}-${coords[1]}`}
                path={icon.path}
                style={{
                    position: "absolute",
                    left: `${(coords[0] / width) * 100}%`,
                    top: `${(coords[1] / height) * 100}%`,
                    width: `${(icon.width / width) * 100}%`,
                    height: "auto",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none"
                }}
            />);
        }));
        return icons;
    }, [roadmapLoading, roadmap]);

    if (roadmapLoading) return null;
    const [width, height] = roadmap.size;

    return <ZoomPanViewer width={width} height={height} initialScale={0.5}>
        <div style={{ position: "relative", width, height }}>
            <ImageHandler path={roadmap.path} style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
            {icons}
        </div>
    </ZoomPanViewer>
}