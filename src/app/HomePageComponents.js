'use client';

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useState } from "react";

import { useData } from "./components/DataProvider";
import { useModal } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import DragContainer from "./components/objects/DragContainer";
import { useSiteCustomization } from "./components/SiteCustomizationProvider";
import styles from "./homepage.module.css";
import { HomepageLinkList, homepageLinks } from "./lib/homepageLinks";

export function LinksMenu() {
    const { getCustomizationValue } = useSiteCustomization();
    const favorite = getCustomizationValue("favoriteLinks");
    const [forceOpen, setForceOpen] = useState(false);
    const { isMobile } = useBreakpoint();

    const chunked = [];
    if (favorite) for (let i = 0; i < favorite.length; i += 5) chunked.push(favorite.slice(i, i + 5));
    const sectionWidth = isMobile ? "160px" : "200px";

    return <div style={{
        display: "flex", flexDirection: "column", width: "100%",
        alignSelf: "start", alignItems: "center"
    }}>
        {favorite && favorite.length > 0 &&
            <DragContainer>
                <div className={styles.LinksMenu} style={{ justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content" : "100%" }}>
                    {chunked.map((items, index) =>
                        <div key={index} className="panel-container" style={{ width: sectionWidth }}>
                            <HomepageLinkList links={items} includeNew={true} clickable={true} style={{ width: sectionWidth }} />
                        </div>)
                    }
                </div>
            </DragContainer>
        }

        {forceOpen || !favorite ?
            <DragContainer>
                <div className={styles.LinksMenu} style={{ justifyContent: isMobile ? "start" : "center", width: isMobile ? "max-content" : "100%" }}>
                    {homepageLinks.map((section, i) => <div key={i} className="panel-container" style={{ display: "flex", flexDirection: "column", width: sectionWidth }}>
                        {section.category ? <span className={styles.LinksCategory}>{section.category}</span> : null}
                        <HomepageLinkList links={section.links} includeNew={true} clickable={true} style={{ width: sectionWidth }} />
                    </div>)}
                </div>
            </DragContainer> :
            null
        }

        {
            !forceOpen && favorite ?
                <span className="text-link" onClick={() => setForceOpen(true)}>▾ Expand Links ▾</span> :
                null
        }
    </div>
}

export function UpdatesComponent() {
    const { openUpdateHistoryModal } = useModal();
    const [updates, updatesLoading] = useData("updates_index");

    return <div className={styles.panelContainer} style={{ "gap": "0.2rem" }}>
        {/* <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Announcement</div> */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "start" }}>
            <h3 style={{ margin: 0 }}>Update History</h3>
            <NoPrefetchLink className="text-link" href={"/update-history"}>view full update history</NoPrefetchLink>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", width: "100%", gap: ".2rem" }}>
            {updatesLoading ? [] :
                updates.slice(0, 8).map((update, i) => <React.Fragment key={i}>
                    <span className="sub-text">{update.date}</span>
                    <span className="text-link"
                        style={{ marginLeft: "0.3rem", textAlign: "start", fontWeight: "normal" }}
                        onClick={() => openUpdateHistoryModal({ date: update.date, title: update.title, path: update.path })} >
                        {update.title}
                    </span>
                </React.Fragment>)
            }
        </div>
    </div>
}