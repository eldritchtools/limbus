"use client";

import { useEffect, useState } from "react";

import { useModal } from "../modals/ModalProvider";
import { getGiftTooltipProps } from "../tooltips/GiftTooltip";

export default function GiftInteractive({ id, enhanceRank = 0, includeTooltip = true, expandable = true, forceTriggersEffects, children }) {
    const { openGiftModal } = useModal();
    const [canHover, setCanHover] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCanHover(window.matchMedia("(hover: hover)").matches);
    }, []);

    let props = {};
    if (includeTooltip && (!expandable || canHover)) {
        props = { ...props, ...getGiftTooltipProps(id ?? gift?.id, enhanceRank, expandable) };
    }

    if (expandable) {
        props.onClick = () => openGiftModal({ id: id ?? gift?.id, enhanceRank, forceTriggersEffects });
    }

    return <span {...props}>{children}</span>;
}
