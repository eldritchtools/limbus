import React from "react";

import CommunityPoll from "./CommunityPoll";
import MdPlan from "./components/contentCards/MdPlan";
import TeamBuild from "./components/contentCards/TeamBuild";
import { fetchData } from "./components/DataFetcherServer";
import BannerIcon from "./components/icons/BannerIcon";
import EgoIcon from "./components/icons/EgoIcon";
import IdentityIcon from "./components/icons/IdentityIcon";
import NoPrefetchLink from "./components/NoPrefetchLink";
import DragContainer from "./components/objects/DragContainer";
import { getHomepagePosts } from "./database/serverSafeDb";
import styles from "./homepage.module.css";
import { LinksMenu, UpdatesComponent } from "./HomePageComponents";
import { mergeUpcoming } from "./lib/upcoming";
import RandomTips from "./RandomTips";
import RecentAdditions from "./RecentAdditions";
import { HomepageTimers } from "./timers/TimersTable";


function PopularityPoll() {
    return <NoPrefetchLink href="/popularity-poll" className="text-link">
        <div className="panel-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "500px", gap: "0.5rem" }}>
            <BannerIcon path={"season_7"} style={{ width: "80%" }} />
            <span>
                Since season 7 is coming to an end, I&apos;m running an end-of-season popularity poll. Vote for your favorite identities, E.G.O, NPCs, themes, events, and others from this season! Click here to submit your response or view the current results.
            </span>
        </div>
    </NoPrefetchLink>
}

export default async function HomePage() {
    const identitiesBase = await fetchData("identities");
    const egosBase = await fetchData("egos");
    const upcoming = await fetchData("upcoming");
    const { popular, newest, showcase, mdplans, poll } = await getHomepagePosts();

    const identities = mergeUpcoming(identitiesBase, upcoming.identities ?? {}, upcoming.date);
    const egos = mergeUpcoming(egosBase, upcoming.egos ?? {}, upcoming.date);

    const dates = {};

    Object.values(identities).forEach(x => {
        if (!(x.date in dates)) dates[x.date] = [x];
        else dates[x.date].push(x);
    });
    Object.values(egos).forEach(x => {
        if (!(x.date in dates)) dates[x.date] = [x];
        else dates[x.date].push(x);
    });

    const upcomingEntries = Object.keys(dates).sort((a, b) => {
        if (a.includes("?")) return -1;
        if (b.includes("?")) return 1;
        return b.localeCompare(a);
    }).slice(0, 10).map(x => [x, dates[x]]);

    return <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem", width: "100%", height: "100%" }}>
        <div className={styles.mainContainer}>
            <h1 style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>Limbus Company Tools</h1>
            <p>
                Welcome, Manager to your complete Limbus Company hub.
                <br /> <br />
                Share team builds and Mirror Dungeon plans, rate and review Identities and E.G.Os, and showcase your collection. Browse databases for identities, E.G.O, boss encounters, and MD content with advanced search features, keep an eye on event timers, and use gameplay tools like calculators, planners, solvers, and randomizers to optimize or spice up your runs.
                <br /> <br />
                Use the links below to get started or visit the <NoPrefetchLink className="text-link" href={"/edit-profile"}>Edit Profile</NoPrefetchLink> or <NoPrefetchLink className="text-link" href={"/site-customization"}>Site Customization</NoPrefetchLink> pages to personalize your profile or site experience.
                <br /> <br />
                Curious about everything you can do here? The <NoPrefetchLink className="text-link" href={"/guide"}>Manager&apos;s Guide</NoPrefetchLink> goes through every page and feature in more detail.
            </p>
            <PopularityPoll />
            <LinksMenu />
            <HomepageTimers />
            <CommunityPoll initPoll={poll} />
            <RandomTips />
            <RecentAdditions />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div className={styles.panelContainer} style={{ alignItems: "start", gap: "0.5rem" }}>
                    <h3 style={{ margin: 0 }}>Latest Identities and E.G.Os</h3>
                    <DragContainer>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {upcomingEntries.map(([date, list]) =>
                                <div key={date} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
                                    <div>{date}</div>
                                    <div style={{ display: "flex", gap: "1px" }}>
                                        {list.map(obj => obj.id[0] === "1" ?
                                            (obj.upcoming ?
                                                <div key={obj.id} className={styles.latestIconContainer}>
                                                    <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} lazyLoad={false} />
                                                </div> :
                                                <NoPrefetchLink key={obj.id} href={`/identities/${obj.id}`}>
                                                    <div className={styles.latestIconContainer}>
                                                        <IdentityIcon identity={obj} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} lazyLoad={false} />
                                                    </div>
                                                </NoPrefetchLink>
                                            ) :
                                            (obj.upcoming ?
                                                <div key={obj.id} className={styles.latestIconContainer}>
                                                    <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} lazyLoad={false} />
                                                </div> :
                                                <NoPrefetchLink key={obj.id} href={`/egos/${obj.id}`}>
                                                    <div className={styles.latestIconContainer}>
                                                        <EgoIcon ego={obj} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} style={{ pointerEvents: "none", borderRadius: "8px" }} lazyLoad={false} />
                                                    </div>
                                                </NoPrefetchLink>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </DragContainer>
                    <NoPrefetchLink className="text-link" href={"/release-history"} style={{ alignSelf: "end" }}>
                        Discuss upcoming Identities and E.G.O ➔
                    </NoPrefetchLink>
                </div>
                <UpdatesComponent />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", width: "100%" }}>
                <div className={styles.panelContainer} style={{ "gap": "0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Popular Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=popular"}>view more popular builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The most popular builds. Updated once every four hours.
                        </div>
                        <DragContainer style={{ paddingLeft: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {popular.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                            </div>
                        </DragContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest Builds</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=recent"}>view more new builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The newest builds submitted by managers.
                        </div>
                        <DragContainer style={{ paddingLeft: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {newest.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                            </div>
                        </DragContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Community Showcase</h3>
                            <NoPrefetchLink className="text-link" href={"/builds?mode=random"}>view random builds ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            A random build with at least 1 like is added to this list every hour and the oldest is rotated out.
                        </div>
                        <DragContainer style={{ paddingLeft: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {showcase.map(build => <TeamBuild key={build.id} build={build} size={"S"} complete={false} />)}
                            </div>
                        </DragContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h3 style={{ margin: 0 }}>Newest MD Plans</h3>
                            <NoPrefetchLink className="text-link" href={"/md-plans?mode=new"}>view more new md plans ➔</NoPrefetchLink>
                        </div>
                        <div className="sub-text" style={{ alignSelf: "start", textAlign: "start" }}>
                            The newest md plans submitted by managers.
                        </div>
                        <DragContainer>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                {mdplans.map(plan => <MdPlan key={plan.id} plan={plan} complete={false} />)}
                            </div>
                        </DragContainer>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
