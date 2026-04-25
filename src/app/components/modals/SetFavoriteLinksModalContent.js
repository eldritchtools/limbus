"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState } from "react";

import { HomepageLink, HomepageLinkList, homepageLinks } from "@/app/lib/homepageLinks";

export default function SetFavoriteLinksModalContent({ currentList, setFavoriteLinks, onClose }) {
    const [list, setList] = useState(currentList);
    const { isMobile } = useBreakpoint();

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <h3 style={{ margin: 0 }}>Select Favorite Links</h3>
        <span>Selected Links:</span>
        <div>
            <HomepageLinkList links={list} style={{ maxWidth: "min(1000px, 90vw)" }} />
        </div>

        <div style={{ display: "flex", gap: "0.2rem", flexWrap: "wrap", justifyContent: "center" }}>
            {homepageLinks.map(({ category, links }) =>
                <div key={category} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem" }}>
                    <span style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>{category}</span>
                    {links.map(link => <label key={link.href} style={{ display: "flex", alignItems: "center", gap: "0.2rem", width: isMobile ? "150px" : "200px" }}>
                        <input type="checkbox" checked={list.includes(link.href)}
                            onChange={e => e.target.checked ? setList(p => [...p, link.href]) : setList(p => p.filter(x => x !== link.href))}
                        />
                        <HomepageLink link={link} />
                    </label>)}
                </div>)}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setFavoriteLinks(list); onClose(); }}>Done</button>
        </div>
    </div>
}
