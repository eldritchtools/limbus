"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useRef, useState } from "react";

import styles from "./CommunityAssetPicker.module.css";
import CommunityAsset from "../icons/CommunityAsset";

import { useAuth } from "@/app/database/authProvider";
import { getUserCommunityAssets, searchCommunityAssets } from "@/app/database/communityAssets";
import useLocalState from "@/app/lib/useLocalState";

export default function CommunityAssetPicker({ type, onClick }) {
    const [recent] = useLocalState(`${type}RecentPicks`, []);
    const [search, setSearch] = useState("");
    const [mode, setMode] = useState("default");
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [first, setFirst] = useState(true);
    const fetchTimeout = useRef(null);
    const { user } = useAuth();
    const { isMobile } = useBreakpoint();
    const size = type === "emote" ? 48 : 128;
    const gridStyle = { display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`, gap: "0.2rem" };

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            setAssets([]);
            if (search.trim().length === 0) {
                setMode("default");
                if (user) {
                    const fetched = await getUserCommunityAssets(user.id, type);
                    setAssets(fetched.map(({ id, prefix }) => `${prefix}_${id}`));
                }
            } else {
                setMode("search");
                const fetched = await searchCommunityAssets(search.trim(), type);
                setAssets(fetched.map(({ id, prefix }) => `${prefix}_${id}`));
            }
            setLoading(false);
        };

        if (first) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFirst(false);
            fetchAssets();
            return;
        }

        clearTimeout(fetchTimeout.current);

        fetchTimeout.current = setTimeout(async () => {
            fetchAssets();
        }, 500);

        return () => clearTimeout(fetchTimeout.current);
    }, [search, type, user, first]);

    const handleClick = id => {
        const newRecent = ([id, ...recent.filter(x => x !== id)]).slice(0, 20);
        localStorage.setItem(`${type}RecentPicks`, JSON.stringify(newRecent));
        if (onClick) onClick(id);
    }

    return <div style={{ display: "flex", flexDirection: "column", maxWidth: isMobile ? "85vw" : "800px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
        <div style={{
            height: isMobile ? "200px" : "300px", overflowY: "auto", overflowX: "hidden", width: "min(85vw, 600px)",
            display: "flex", flexDirection: "column",
            scrollbarWidth: "thin", scrollbarColor: "var(--secondary-border-color) var(--bg-primary)"
        }}>
            {mode === "default" ? <>
                {recent.length > 0 && <>
                    <span className="sub-text">Recent</span>
                    <div style={gridStyle}>
                        {recent.map(x =>
                            <div key={x} className={styles.asset} onClick={() => handleClick(x)}>
                                <CommunityAsset key={x} id={x} type={"sm"} style={{ maxWidth: `${size}px` }} />
                            </div>
                        )}
                    </div>
                </>
                }
                {loading ?
                    <span style={{ alignSelf: "center" }}>Loading...</span> :
                    <>
                        <span className="sub-text">Your Uploads</span>
                        {
                            assets.length > 0 ?
                                <div style={gridStyle}>
                                    {assets.map(x =>
                                        <div key={x} className={styles.asset} onClick={() => handleClick(x)}>
                                            <CommunityAsset key={x} id={x} type={"sm"} style={{ maxWidth: `${size}px` }} />
                                        </div>
                                    )}
                                </div> :
                                <div style={{textAlign: "center"}}>
                                    You have no uploaded {type === "emote" ? "emotes" : "stickers"}. 
                                    <br/>
                                    Consider uploading in the Community Assets page.
                                </div>
                        }
                    </>
                }
            </> :
                (loading ?
                    <span style={{ alignSelf: "center" }}>Loading...</span> :
                    <>
                        {assets.length > 0 ?
                            <div style={gridStyle}>
                                {assets.map(x =>
                                    <div key={x} className={styles.asset} onClick={() => handleClick(x)}>
                                        <CommunityAsset key={x} id={x} type={"sm"} style={{ maxWidth: `${size}px` }} />
                                    </div>
                                )}
                            </div> :
                            <div style={{ marginTop: "5rem", textAlign: "center", alignSelf: "center", justifySelf: "center" }}>
                                No results...
                                <br/>
                                Try a different search term 
                                <br/> 
                                or upload one yourself in the Community Assets page.
                            </div>
                        }
                    </>
                )
            }
        </div>
    </div>
}



