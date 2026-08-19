import { useEffect, useState } from "react";

import styles from "./creators.module.css";
import Avatar from "../components/icons/Avatar";
import { useModal } from "../components/modals/ModalProvider";
import { HorizontalDivider } from "../components/objects/Dividers";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import SocialsDisplay from "../components/socials/SocialsDisplay";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { useAuth } from "../database/authProvider";
import { searchCreators } from "../database/creators";

export const CREATOR_TAGS = [
    { id: 1, label: "Videos" },
    { id: 2, label: "Streams" },
    { id: 3, label: "Guides" },
    { id: 4, label: "Fan Art" },
    { id: 5, label: "Music" },
    { id: 6, label: "Gameplay" },
    { id: 7, label: "Game News" },
    { id: 8, label: "Story Reactions" },
    { id: 9, label: "Music Reactions" },
    { id: 10, label: "Id/Ego Analysis" },
    { id: 11, label: "Lore Discussion" },
    { id: 12, label: "Discussion & Commentary", tooltip: "Meta commentary such as discussions on gacha games, comparisons to other games, discussions on real life literary inspirations, game design and balance, etc." },
    { id: 13, label: "Mirror Dungeon" },
    { id: 14, label: "Solos" },
    { id: 15, label: "Challenges" },
    { id: 16, label: "Low Turn Count" },
    { id: 17, label: "Misc. Content", tooltip: "Other types of content such as for fun tier lists/rankings, community events, fan games, etc." },
];

function CreatorCard({ creator }) {
    const { user } = useAuth();
    const { openCreatorTagVoteModal } = useModal();

    const tagLabels = creator.qualified_tag_ids.map(tag => CREATOR_TAGS.find(x => x.id === tag).label)

    return <div className={styles.creatorCard}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <Avatar avatarId={creator.avatar_id} size={48} />
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{creator.name}</span>
                <span className="sub-text">
                    {creator.is_variety ? "Variety" : "PM"} Creator
                </span>
            </div>
        </div>

        <div style={{ alignSelf: "center" }}>
            <SocialsDisplay socials={creator.platforms} expandable={false} />
        </div>

        <div
            {...(tagLabels.length > 5 ? getGeneralTooltipProps(tagLabels.join(", ")) : {})}
            style={{ display: "flex", gap: "0.2rem", flexWrap: "wrap", justifyContent: "center" }}
        >
            {tagLabels.slice(0, 5).map(tag =>
                <span key={tag} className={styles.creatorTag}>{tag}</span>
            )}
            {user && <button
                {...getGeneralTooltipProps("Suggest tags for this creator.")}
                className={styles.creatorTag}
                onClick={() => openCreatorTagVoteModal({ creator })}
            >
                +
            </button>}
        </div>
    </div>
}

export default function CreatorsDirectoryTab({ search, tagIds, isVariety, setParams }) {
    const [searchInput, setSearchInput] = useState(search ?? "");
    const [selectedTags, setSelectedTags] = useState(tagIds ?? []);
    const [varietyInput, setVarietyInput] = useState(isVariety ?? "all");
    const [showTags, setShowTags] = useState(tagIds.length > 0);

    function submitSearch() {
        setParams({
            search: searchInput.trim() || null,
            tags: selectedTags.length ? selectedTags.join(",") : null,
            variety: varietyInput === null ? null : String(varietyInput),
        });
    }

    useEffect(() => {
        setSearchInput(search ?? "");
        setSelectedTags(tagIds ?? []);
        setVarietyInput(isVariety ?? "all");
    }, [search, tagIds, isVariety]);

    function clearFilters() {
        setSearchInput("");
        setSelectedTags([]);
        setVarietyInput("all");
    }

    function toggleTag(tagId) {
        setSelectedTags(current => current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId]);
    }

    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const variety = isVariety === "all" ? null : (isVariety === "var")
                const data = await searchCreators({ search: search || null, tagIds, isVariety: variety });
                if (!cancelled) setCreators(data);
            } catch (error) {
                if (!cancelled) setError(error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [search, tagIds, isVariety]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", alignItems: "center", width: "min(1200px, 100%)" }}>
            <span style={{ textAlign: "end" }}>Name:</span>
            <div>
                <input type="search"
                    value={searchInput} onChange={event => setSearchInput(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") submitSearch();
                    }}
                    placeholder="Search creators..."
                />
            </div>

            <span style={{ textAlign: "end" }}>Creator Type:</span>
            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <label>
                    <input
                        type="radio" name="varietyType" value={"all"}
                        checked={varietyInput === "all"} onChange={e => setVarietyInput(e.target.value)}
                    />
                    All
                </label>
                <label>
                    <input
                        type="radio" name="varietyType" value={"pm"}
                        checked={varietyInput === "pm"} onChange={e => setVarietyInput(e.target.value)}
                    />
                    <span
                        className="hover-text"
                        {...getGeneralTooltipProps("Creators that mainly create content related to Project Moon. They may make content for other games, especially streamers who stream regularly, but majority of their content is PM-related.")}
                    >
                        PM Creator
                    </span>
                </label>
                <label>
                    <input
                        type="radio" name="varietyType" value={"var"}
                        checked={varietyInput === "var"} onChange={e => setVarietyInput(e.target.value)}
                    />
                    <span
                        className="hover-text"
                        {...getGeneralTooltipProps("Creators that create content for a variety of games and have previously created content for the Project Moon games. Includes both creators that have stopped making PM content and those that are still actively making PM content.")}
                    >
                        Variety Creator
                    </span>
                </label>
            </div>
        </div>

        <button
            onClick={() => setShowTags(current => !current)}
            style={{
                border: "none", background: "none", padding: 0, cursor: "pointer", font: "inherit",
                textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: '0.5rem'
            }}
        >
            <span>Creator Tags{selectedTags.length > 0 && ` (${selectedTags.length} selected)`}</span>
            <span aria-hidden="true">{showTags ? "▲" : "▼"}</span>
        </button>

        {showTags &&
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "min(1200px, 100%)" }}>
                {CREATOR_TAGS.map(tag => {
                    const props = tag.tooltip ? { ...getGeneralTooltipProps(tag.tooltip), className: "hover-text" } : {};
                    return <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="checkbox" checked={selectedTags.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                        <span {...props}>{tag.label}</span>
                    </label>
                })}
            </div>
        }

        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={clearFilters} disabled={!searchInput && selectedTags.length === 0 && varietyInput === "all"}>
                Clear Filters
            </button>
            <button onClick={submitSearch}>Search</button>
        </div>

        <HorizontalDivider />

        {loading ?
            <LoadingContentPageTemplate /> :
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
                {creators.map(creator => <CreatorCard key={creator.id} creator={creator} />)}
            </div>
        }
    </div>
}
