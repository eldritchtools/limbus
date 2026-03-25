import { useBreakpoint } from "@eldritchtools/shared-components";
import { useCallback, useState } from "react";

import ThemePackIcon from "../icons/ThemePackIcon";

export default function SelectThemePackModalContent({ getOptions, onSelectPack }) {
    const [, updateCount] = useState(0);
    const { isMobile } = useBreakpoint();

    const triggerRender = useCallback(() => { updateCount(p => p + 1) }, []);

    const handleSelectPack = id => {
        onSelectPack(id);

        setTimeout(() => {
            triggerRender();
        }, 0);
    }

    const options = getOptions ? getOptions() : null;
    const packSize = isMobile ? 75 : 100;

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "90vh", overflowY: "auto", maxWidth: "min(80vw, 1000px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${packSize}px, 1fr))`, width: `min(80vw, 1000px, ${packSize * options.length}px)`, rowGap: "0.5rem" }}>
            {options.map(id =>
                <div key={id} onClick={() => handleSelectPack(id)} style={{ cursor: "pointer" }}>
                    <ThemePackIcon id={id} displayName={true} scale={isMobile ? .15 : 0.25} />
                </div>
            )}
        </div>
    </div>
}