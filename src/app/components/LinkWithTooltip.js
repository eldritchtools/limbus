import { isTouchDevice } from "@eldritchtools/shared-components";

import NoPrefetchLink from "./NoPrefetchLink";

export default function LinkWithTooltip({ href, tooltipProps, className, style, children }) {
    const props = {};
    if (className) props.className = className;
    if (style) props.style = style;
    if (isTouchDevice()) props.onClick = e => e.preventDefault();

    return <NoPrefetchLink
        href={href}
        {...tooltipProps}
        {...props}
    >
        {children}
    </NoPrefetchLink>
}