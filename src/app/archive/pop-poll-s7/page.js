"use client";

import React from "react";

import CategoryPieCard from "./categoryPieCard";
import CommentRandomizer from "./commentRandomizer";
import ComparisonChart from "./comparisonChart";
import IdentitiesView from "./identitiesView";
import RatingChart from "./ratingChart";
import CommentWordCloud from "./wordCloud";

import { useData } from "@/app/components/DataProvider";
import BannerIcon from "@/app/components/icons/BannerIcon";
import EgoIcon from "@/app/components/icons/EgoIcon";
import { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";


function EgoCard({ data }) {
    const [egos, egosLoading] = useData("egos_mini");

    if (egosLoading) return <div />;

    return <CategoryPieCard
        title="Favorite E.G.O" category={data.categories.ego}
        renderLabel={key => <div key={key} style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            <div style={{ width: "24px", height: "24px", flex: 0 }}>
                <EgoIcon id={key} size={24} type="awaken" />
            </div>
            <span style={{ textOverflow: "ellipsis" }}>
                {egos[key].name}
            </span>
        </div>}
    />
}

export default function PopularityPollPage() {
    const [data, dataLoading] = useData("archive/pop_poll_s7");

    if (dataLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem", textAlign: "center" }}>
        <BannerIcon path={"season_7"} style={{ width: "400px", maxWidth: "100%" }} />
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Season 7 Popularity Poll Results</h1>
        <span>
            Thank you to everyone who participated! These are mostly the same results that were previously available, but presented with a bit more visuals and with some additional details. 
        </span>

        <span style={{ fontSize: "0.9rem", maxWidth: "1000px", textAlign: "center" }}>
            Results disclaimer: This poll was launched before the season was complete, so some options were introduced late. The option to edit responses was available, however it must be stated that things that were released towards the end of the Season may have gotten fewer votes than they would have otherwise.
        </span>

        <div className="panel-container" style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <span>{data.meta.totalResponses} Responses</span>
            •
            <span>{data.ratings.all.mean}/10 Avg Season Rating</span>
            •
            <span>{data.meta.totalComments} Comments</span>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>

        </div>

        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Favorite Identities</h2>
        <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.8rem" }}>
            <span>Up to 3 votes per respondent</span>
            •
            <span>Gameplay: {data.categories.idGameplay.totalPicks} votes, {(data.categories.idGameplay.totalPicks / data.categories.idGameplay.answeredCount).toFixed(2)} votes per respondent</span>
            •
            <span>Non-Gameplay: {data.categories.idNonGameplay.totalPicks} votes, {(data.categories.idNonGameplay.totalPicks / data.categories.idNonGameplay.answeredCount).toFixed(2)} votes per respondent</span>
        </div>

        <IdentitiesView data={data} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 600px), 1fr))", gap: "0.2rem", width: "100%", maxWidth: "1600px" }}>
            <EgoCard data={data} />
            <CategoryPieCard title="Favorite Faction/Archetype Update" category={data.categories.faction} maxSlices={8} />
            <CategoryPieCard title="Favorite Bosses" category={data.categories.bosses} renderLabel={key => {
                const match = key.match(/^(.+?)\s*\(([^)]+)\)$/);

                return <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                    <span>{match[1]}</span>
                    <span style={{ opacity: 0.55 }}>{match[2]}</span>
                </div>
            }} />
            <CategoryPieCard title="Favorite NPCs" category={data.categories.npc} />
            <CategoryPieCard title="Favorite Events" category={data.categories.event} />
            <CategoryPieCard title="Favorite Story Themes" category={data.categories.storyThemes} />
            <CategoryPieCard title="Favorite Battle Themes" category={data.categories.battleThemes} />
            <CategoryPieCard title="Favorite Game Updates" category={data.categories.gameUpdates} />
        </div>

        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Canto Comparison</h2>
        <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.8rem" }}>
            <span>{data.cantoComparison.answeredCount} respondents</span>
        </div>

        <div style={{ width: "100%", maxWidth: "1200px" }}>
            <ComparisonChart cantoComparison={data.cantoComparison} />
        </div>

        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Overall Season 7 Rating</h2>
        <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.8rem" }}>
            <span>{data.ratings.all.count} respondents</span>
            •
            <span>{data.ratings.all.mean}/10 avg rating</span>
            •
            <span>{data.ratings.all.median}/10 median rating</span>
        </div>

        <div style={{ width: "100%", maxWidth: "1200px" }}>
            <RatingChart ratings={data.ratings} />
        </div>

        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Comments for Season 7 & 8</h2>
        <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.8rem" }}>
            <span>{data.comments.totalComments} comments</span>
        </div>

        <CommentWordCloud wordFrequencies={data.comments.wordFrequencies} totalComments={data.comments.totalComments} />
        <div style={{ height: "1rem" }} />
        <CommentRandomizer pool={data.comments.randomPool} />
    </div>
}