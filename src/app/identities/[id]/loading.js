"use client";

import { useParams } from "next/navigation";
import React from "react";

import styles from "./IdentityPage.module.css";

import Icon from "@/app/components/icons/Icon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import TierIcon from "@/app/components/icons/TierIcon";
import { LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";

function BottomLinks({ sinnerId }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start", width: "1200px", maxWidth: "100%", border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem", padding: "0.2rem", marginTop: "1rem" }}>
        <h4 style={{ display: "flex", gap: "0.2rem", alignItems: "center", alignSelf: "center", margin: 0 }}>
            Select Sinner:
            <SinnerIcon num={sinnerId} style={{ width: "24px", height: "24px" }} />
            <span style={{ fontSize: "1.2rem" }}>{sinnerIdMapping[sinnerId]}</span>

        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <div style={{ height: "92px" }} />
            <div style={{ height: "92px" }} />
        </div>
    </div>
}

export default function IdentityLoadingPage() {
    const { id } = useParams();
    const sinnerId = Number(id.substring(1, 3));

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        <div className={styles.header}>
            <div className={styles.headerImage} />
        </div>

        <div className={`panel-container ${styles.statsContainer}`}>
            <div className={styles.profileContainer}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                    <div style={{ display: "inline", height: "2rem" }} />
                    <div style={{ width: "40px", height: "40px" }} />
                    <h1 style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: 0 }}>
                        <span style={{ fontSize: "0.8rem" }}>{sinnerIdMapping[sinnerId]}</span>
                        <span style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>Loading...</span>
                    </h1>
                </div>

                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem" }}>
                    Uptie: <TierIcon tier={4} scaleY={1.2} />
                    Level: {LEVEL_CAP}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto auto", gridTemplateRows: "auto auto", alignItems: "center", justifyContent: "center" }}>
                <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
                    <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Stats</div>
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"hp"} style={{ width: "32px", height: "32px" }} /></div>
                        <span />
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"speed"} style={{ width: "32px", height: "32px" }} /></div>
                        <span />
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"defense level"} style={{ width: "32px", height: "32px" }} /></div>
                        <span />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Resists</div>
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Slash"} /></div>
                        <span />
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Pierce"} /></div>
                        <span />
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Blunt"} /></div>
                        <span />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }} >
                    <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Keywords</div>
                    <div />
                </div>
            </div>

            <div className={styles.otherContainer}>
                <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                    <span style={{ fontWeight: "bold" }}>Release Date</span>
                    <span />
                </div>
                <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                    <span style={{ fontWeight: "bold" }}>Season</span>
                    <span />
                </div>
                <div style={{ gridColumn: "span 2", padding: "0.2rem", textAlign: "center", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: "bold" }}>Tags/Factions</div>
                    <div />
                </div>
            </div>
        </div>

        <div className="panel-container" style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%" }}>
            <div style={{ overflowX: "auto", alignSelf: "center", maxWidth: "100%", paddingBottom: "0.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                    <div className={"tab-header"} style={{ fontSize: "1rem" }}>Community Rating</div>
                    <div className={"tab-header"} style={{ fontSize: "1rem" }}>Tips/Summary</div>
                    <div className={"tab-header"} style={{ fontSize: "1rem" }}>Top Builds</div>
                </div>
            </div>
            <div style={{ textAlign: "center" }}>Loading...</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.25rem" }}>
                <div className="title-text">Skills</div>
                <div style={{ textAlign: "center" }}>Loading...</div>
                <div className="title-text">Combat Passives</div>
                <div style={{ textAlign: "center" }}>Loading...</div>
                <div className="title-text">Support Passives</div>
                <div style={{ textAlign: "center" }}>Loading...</div>
                <div className="title-text">Sanity</div>
                <div style={{ textAlign: "center" }}>Loading...</div>
            </div>
        </div>

        <BottomLinks sinnerId={sinnerId} />
    </div>
}
