export default function Home() {
    return <div>Empty page</div>
}

// 'use client';

// import { EgoImg, IdentityImg, useData } from "@eldritchtools/limbus-shared-library";
// import { useEffect, useMemo, useState } from "react";
// import BuildEntry from "./components/BuildEntry";
// import { getHomepageBuilds } from "./database/builds";
// import { useBreakpoint } from "@eldritchtools/shared-components";
// import NoPrefetchLink from "./NoPrefetchLink";

// export default function Home() {
//     const [identities, identitiesLoading] = useData("identities");
//     const [egos, egosLoading] = useData("egos");
//     const [popular, setPopular] = useState([]);
//     const [newest, setNewest] = useState([]);
//     const [showcase, setShowcase] = useState([]);
//     const { isDesktop } = useBreakpoint();

//     useEffect(() => {
//         const getBuilds = async () => {
//             const { popular, newest, showcase } = await getHomepageBuilds();
//             setPopular(popular.map(x => ({ ...x, id: x.build_id })));
//             setNewest(newest);
//             setShowcase(showcase);
//         }

//         getBuilds();
//     }, []);

//     const latest = useMemo(() => {
//         if (identitiesLoading || egosLoading) return [];
//         const dates = {};

//         Object.values(identities).forEach(x => {
//             if (!(x.date in dates)) dates[x.date] = [x];
//             else dates[x.date].push(x);
//         });
//         Object.values(egos).forEach(x => {
//             if (!(x.date in dates)) dates[x.date] = [x];
//             else dates[x.date].push(x);
//         });

//         const latest = Object.keys(dates).sort((a, b) => b.localeCompare(a)).slice(0, 10);
//         return Object.fromEntries(latest.map(x => [x, dates[x]]));
//     }, [identities, identitiesLoading, egos, egosLoading]);

//     return <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", width: "100%", height: "100%" }}>
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem", maxWidth: isDesktop ? "min(90%, 1200px)" : "100%" }}>
//             <h2 style={{ margin: 0 }}>Welcome to the Team Building Hub, Manager!</h2>
//             <p>
//                 The Team Building Hub is a place for managers to create, share, and discover team builds.
//                 <br /> <br />
//                 Use the sidebar or click on the links below to get started.
//             </p>
//             <div style={{ border: "1px solid #aaa", borderRadius: "0.5rem", overflowX: "auto", maxWidth: "100%" }}>
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", width: "max-content", gap: "1rem", padding: "1rem", boxSizing: "border-box" }}>
//                     <NoPrefetchLink className="text-link" href={"/builds"}>Team Builds</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/md-plans"}>MD Plans</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/collections"}>Collections</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/identities"}>Identities</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/builds/new"}>New Build</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/md-plans/new"}>New Plan</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/collections/new"}>New Collection</NoPrefetchLink>
//                     <NoPrefetchLink className="text-link" href={"/egos"}>E.G.Os</NoPrefetchLink>
//                 </div>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%", border: "1px solid #aaa", borderRadius: "0.5rem", padding: "1rem", boxSizing: "border-box" }}>
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
//                     <h3 style={{ margin: 0 }}>Latest Additions</h3>
//                     {identitiesLoading || egosLoading ? "Loading..." :
//                         <div style={{ maxWidth: "100%", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "thin" }}>
//                             <div style={{ display: "flex", gap: "0.5rem" }}>
//                                 {Object.entries(latest).map(([date, list]) =>
//                                     <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
//                                         <div>{date}</div>
//                                         <div style={{ display: "flex" }}>
//                                             {list.map(obj => obj.id[0] === "1" ?
//                                                 <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
//                                                     <div style={{ width: "128px", height: "128px" }}>
//                                                         <IdentityImg identity={obj} uptie={4} displayName={true} displayRarity={true} />
//                                                     </div>
//                                                 </NoPrefetchLink> :
//                                                 <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
//                                                     <div style={{ width: "128px", height: "128px" }}>
//                                                         <EgoImg ego={obj} type={"awaken"} displayName={true} displayRarity={true} />
//                                                     </div>
//                                                 </NoPrefetchLink>
//                                             )}
//                                         </div>
//                                     </div>)}
//                             </div>
//                         </div>
//                     }
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                         <h3 style={{ margin: 0 }}>Popular Builds</h3>
//                         <NoPrefetchLink className="text-link" href={"/builds?mode=popular"}>view more popular builds ➔</NoPrefetchLink>
//                     </div>
//                     <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
//                         The most popular builds. Updated once every four hours.
//                     </div>
//                     {popular.length > 0 ?
//                         <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
//                             <div style={{ display: "flex", gap: "1rem" }}>
//                                 {popular.map(build => <BuildEntry key={build.id} build={build} size={"S"} complete={false} />)}
//                             </div>
//                         </div> : "Loading..."
//                     }
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                         <h3 style={{ margin: 0 }}>Newest Builds</h3>
//                         <NoPrefetchLink className="text-link" href={"/builds?mode=recent"}>view more new builds ➔</NoPrefetchLink>
//                     </div>
//                     <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
//                         The newest builds submitted by managers.
//                     </div>
//                     {newest.length > 0 ?
//                         <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
//                             <div style={{ display: "flex", gap: "1rem" }}>
//                                 {newest.map(build => <BuildEntry key={build.id} build={build} size={"S"} complete={false} />)}
//                             </div>
//                         </div> : "Loading..."
//                     }
//                 </div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                         <h3 style={{ margin: 0 }}>Community Showcase</h3>
//                         <NoPrefetchLink className="text-link" href={"/builds?mode=random"}>view random builds ➔</NoPrefetchLink>
//                     </div>
//                     <div style={{ color: "#aaa", fontSize: "0.8rem", alignSelf: "start", textAlign: "start" }}>
//                         A random build with at least 1 like is added to this list every hour and the oldest is rotated out.
//                     </div>
//                     {showcase.length > 0 ?
//                         <div style={{ paddingLeft: "1rem", overflowX: "auto", scrollbarWidth: "thin" }}>
//                             <div style={{ display: "flex", gap: "1rem" }}>
//                                 {showcase.map(build => <BuildEntry key={build.id} build={build} size={"S"} complete={false} />)}
//                             </div>
//                         </div> : "Loading..."
//                     }
//                 </div>
//             </div>
//         </div>
//     </div>
// }