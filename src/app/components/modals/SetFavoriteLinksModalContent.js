"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useState } from "react";

import DragContainer from "../objects/DragContainer";

import { HomepageLink, HomepageLinkList, homepageLinks } from "@/app/lib/homepageLinks";

export default function SetFavoriteLinksModalContent({ currentList, setFavoriteLinks, onClose }) {
    const [list, setList] = useState(currentList);
    const { isMobile } = useBreakpoint();
    const sectionWidth = isMobile ? 160 : 200;

    const chunked = [];
    for (let i = 0; i < list.length; i += 5) chunked.push(list.slice(i, i + 5));

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <h3 style={{ margin: 0 }}>Select Favorite Links</h3>
        <span>Selected Links:</span>
        <DragContainer>
            <div style={{ display: "flex", justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content": "100%" }}>
                {chunked.map((items, index) =>
                    <div key={index} className="panel-container" style={{ width: `${sectionWidth}px` }}>
                        <HomepageLinkList links={items} includeNew={true} clickable={true} style={{ width: `${sectionWidth}px` }} />
                    </div>)
                }
            </div>
        </DragContainer>

        <DragContainer>
            <div style={{ display: "flex", justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content": "100%" }}>
                {homepageLinks.map(({ category, links }) =>
                    <div key={category} className="panel-container" style={{ width: `${sectionWidth+20}px` }}>
                        <span className="title-text" style={{ textAlign: "center" }}>{category}</span>
                        {links.map(link => <label key={link.href} style={{ display: "flex", alignItems: "center", gap: "0.2rem", maxWidth: `${sectionWidth+20}px` }}>
                            <input type="checkbox" checked={list.includes(link.href)}
                                onChange={e => e.target.checked ? setList(p => [...p, link.href]) : setList(p => p.filter(x => x !== link.href))}
                            />
                            <HomepageLink link={link} />
                        </label>)}
                    </div>)}
            </div>
        </DragContainer>

        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setFavoriteLinks(list); onClose(); }}>Done</button>
        </div>
    </div>
}
