"use client";

import React, { useMemo } from "react";

import { useData } from "../../components/DataProvider";
import ImageHandler from "../../components/icons/ImageHandler";
import NoPrefetchLink from "../../components/NoPrefetchLink";
import { LoadingContentPageTemplate } from "../../components/pageTemplates/ContentPageTemplate";
import { TimeString } from "../../timers/TimersTable";

function formatDateString(isoString) {
    if (!isoString) return null;

    const date = new Date(isoString);

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "shortOffset"
    });
}

export default function APR2026Page() {
    const [events, eventsLoading] = useData("archive/apr_2026");

    const components = useMemo(() => {
        if (eventsLoading) return [];
        const comps = [];

        events.events.forEach(({ name, datetime, date, done, links, creators }, i) => {
            comps.push(<div key={`${i}-1`}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.2rem",
                    border: "1px solid var(--primary-border-color)", padding: "0.5rem", textAlign: "center",
                }}>
                <span className="title-text">{name}</span>
                {datetime && <span>{formatDateString(datetime)}</span>}
                {date && <span>{date}</span>}
                {datetime && !done && <span style={{ fontWeight: "bold" }}><TimeString date={new Date(datetime)} /></span>}
                {done && <span style={{ fontWeight: "bold" }}>Done</span>}
            </div>);

            comps.push(<div key={`${i}-2`}
                style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    border: "1px solid var(--primary-border-color)", padding: "0.5rem"
                }}>
                {links.map(({ label, href }) => <NoPrefetchLink key={label} href={href} className="text-link">{label}</NoPrefetchLink>)}
                {creators.map(creator => {
                    const creatorLinks = events.creators[creator];
                    return <div key={creator} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2rem" }}>
                        {creator}:
                        {Object.entries(creatorLinks ?? {}).map(([k, v]) =>
                            <NoPrefetchLink key={k} href={v} className="text-link">{k}</NoPrefetchLink>
                        )}
                    </div>
                })}
            </div>)
        });

        return comps;
    }, [events, eventsLoading]);

    if (eventsLoading) return <LoadingContentPageTemplate />

    const headerStyle = { fontSize: "1.2rem", textAlign: "center", fontWeight: "bold", border: "1px solid var(--primary-border-color)", padding: "0.2rem" };

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        <ImageHandler path={"apr_2026/banner.webp"} style={{ width: "100%", maxWidth: "800px" }} />
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Absolute Pride Resonance is a month-long charity event organized by creators from the Project Moon community. Donations are directed to Outright International, a non-government organization that focuses on addressing human rights violations against the LGBTQIA+ community.</span>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem" }}>
            <NoPrefetchLink href="https://x.com/AbsolutePrideR?lang=en" className="text-link">APR X/Twitter Link</NoPrefetchLink>
            <NoPrefetchLink href="https://bsky.app/profile/absprideresonance.bsky.social" className="text-link">APR Bluesky Link</NoPrefetchLink>
            <NoPrefetchLink href="https://outrightinternational.org/" className="text-link">Outright International Website</NoPrefetchLink>
        </div>
        <span className="sub-text" style={{ textAlign: "center" }}>Disclaimer: I am not part of the creator team contributing to events, but I received permission from the team to promote APR on the site.</span>

        <div style={{ height: "1rem" }} />

        <span>▾ Check out the schedule of events below ▾</span>

        <span className="sub-text" style={{ maxWidth: "1000px", textAlign: "center" }}>Times are automatically adjusted to your local timezone. Some events may have inaccurate schedules if unexpected changes happen. Check the organizers&apos; channels for the most up to date information. More details and events will be added as they become available.</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <span style={headerStyle}>Event</span>
            <span style={headerStyle}>Links</span>
            {components}
        </div>
    </div>
}