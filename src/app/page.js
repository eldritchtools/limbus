'use client';

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useState } from "react";

import Collection from "./components/contentCards/Collection";
import MdPlan from "./components/contentCards/MdPlan";
import TeamBuild from "./components/contentCards/TeamBuild";
import { useData } from "./components/DataProvider";
import EgoIcon from "./components/icons/EgoIcon";
import IdentityIcon from "./components/icons/IdentityIcon";
import { useModal } from "./components/modals/ModalProvider";
import NoPrefetchLink from "./components/NoPrefetchLink";
import { getHomepagePosts } from "./database/homepage";

export default function Home() {
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [updates, updatesLoading] = useData("updates");
    const { openUpdateHistoryModal } = useModal();
    const [popular, setPopular] = useState([]);
    const [newest, setNewest] = useState([]);
    const [showcase, setShowcase] = useState([]);
    const [mdplans, setMdplans] = useState([]);
    const [collections, setCollections] = useState([]);
    const { isDesktop } = useBreakpoint();

    useEffect(() => {
        const getBuilds = async () => {
            const { popular, newest, showcase, mdplans, collections } = await getHomepagePosts();
            setPopular(popular);
            setNewest(newest);
            setShowcase(showcase);
            setMdplans(mdplans);
            setCollections(collections);
        }

        getBuilds();
    }, []);

    const latest = useMemo(() => {
        if (identitiesLoading || egosLoading) return [];
        const dates = {};

        Object.values(identities).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });
        Object.values(egos).forEach(x => {
            if (!(x.date in dates)) dates[x.date] = [x];
            else dates[x.date].push(x);
        });

        const latest = Object.keys(dates).sort((a, b) => b.localeCompare(a)).slice(0, 10);
        return Object.fromEntries(latest.map(x => [x, dates[x]]));
    }, [identities, identitiesLoading, egos, egosLoading]);

    return <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem", maxWidth: isDesktop ? "min(90%, 1200px)" : "100%" }}>
            <h2 style={{ margin: 0 }}>Welcome to Limbus Company Tools, Manager!</h2>
            <p>
                Limbus Company Tools is a site for managers to create, share, and discover various builds and strategies for use in their gameplay. It also hosts a variety of tools for the same purpose.
                <br /> <br />
                This site is a combination of two other sites (<NoPrefetchLink className="text-link" href={"https://limbus-teams.eldritchtools.com"}>Team Building Hub</NoPrefetchLink> and <NoPrefetchLink className="text-link" href={"https://limbus-md.eldritchtools.com"}>Mirror Dungeon Site</NoPrefetchLink>) and is currently in an initial launch version, so some features may not have been properly migrated from the old sites. Any bugs can be reported in the Discord or through the feedback page.
                <br /> <br />
                Use the sidebar or click on the links below to get started.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Manager Posts</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%", gap: ".5rem" }}>
                        <NoPrefetchLink className="text-link" href={"/builds"}>Team Builds</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/md-plans"}>MD Plans</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/collections"}>Collections</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/builds/new"}>New Build</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/md-plans/new"}>New Plan</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/collections/new"}>New Collection</NoPrefetchLink>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Database</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", width: "100%", gap: ".5rem" }}>
                        <NoPrefetchLink className="text-link" href={"/identities"}>Identities</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/egos"}>E.G.Os</NoPrefetchLink>
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Mirror Dungeon</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", width: "100%", gap: ".5rem" }}>
                        <NoPrefetchLink className="text-link" href={"/achievements"}>Achievements Tracker</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/gifts"}>E.G.O Gifts</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/fusions"}>Fusion Recipes</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/theme-packs"}>Theme Packs</NoPrefetchLink>
                    </div>
                </div>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    {/* <div style={{ fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>Announcement</div> */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.9rem", color: "#aaa", textAlign: "start" }}>
                        <span>Update History</span>
                        <NoPrefetchLink className="text-link" href={"/update-history"}>view full update history</NoPrefetchLink>
                    </div>
                    {updatesLoading ?
                        "Loading..." :
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", width: "100%", gap: ".2rem" }}>
                            {updates.slice(0, 5).map((update, i) => <React.Fragment key={i}>
                                <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{update.date}</span>
                                <span className="text-link"
                                    style={{ marginLeft: "0.3rem", textAlign: "start", fontWeight: "normal" }}
                                    onClick={() => openUpdateHistoryModal({ date: update.date, title: update.title, content: update.body })} >
                                    {update.title}
                                </span>
                            </React.Fragment>)}
                        </div>
                    }
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
                    <h3 style={{ margin: 0 }}>Latest Additions</h3>
                    {identitiesLoading || egosLoading ? "Loading..." :
                        <div style={{ maxWidth: "100%", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "thin" }}>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {Object.entries(latest).map(([date, list]) =>
                                    <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                                        <div>{date}</div>
                                        <div style={{ display: "flex" }}>
                                            {list.map(obj => obj.id[0] === "1" ?
                                                <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                                    <div style={{ width: "128px", height: "128px" }}>
                                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} />
                                                    </div>
                                                </NoPrefetchLink> :
                                                <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                                    <div style={{ width: "128px", height: "128px" }}>
                                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} />
                                                    </div>
                                                </NoPrefetchLink>
                                            )}
                                        </div>
                                    </div>)}
                            </div>
                        </div>
                    }
                </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", "gap": "0.5rem", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Popular Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=popular"}>view more popular builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The most popular builds. Updated once every four hours.
                        </div>
                        {popular.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {popular.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=recent"}>view more new builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The newest builds submitted by managers.
                        </div>
                        {newest.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {newest.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Community Showcase</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=random"}>view random builds ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            A random build with at least 1 like is added to this list every hour and the oldest is rotated out.
                        </div>
                        {showcase.length > 0 ?
                            <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {showcase.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest MD Plans</h3>
                            <NoPrefetchLink className="text-link" href={"/md-plans?mode=new"}>view more new md plans ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The newest md plans submitted by managers.
                        </div>
                        {mdplans.length > 0 ?
                            <div style={{ overflowX: "auto", scrollbarWidth: "thin" }}>
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    {mdplans.map(plan => <MdPlan key={plan.id} plan={plan} complete={false} />)}
                                </div>
                            </div> : "Loading..."
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest Collection</h3>
                            <NoPrefetchLink className="text-link" href={"/collections?mode=new"}>view more new collections ➔</NoPrefetchLink>
                        </div>
                        <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
                            The newest collections submitted by managers.
                        </div>
                        {collections.length > 0 ?
                            collections.map(collection => <Collection key={collection.id} collection={collection} complete={false} />) :
                            "Loading..."
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}