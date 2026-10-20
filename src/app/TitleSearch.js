"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { FaSearch } from "react-icons/fa";

import MdPlan from "./components/contentCards/MdPlan";
import TeamBuild from "./components/contentCards/TeamBuild";
import { useData } from "./components/DataProvider";
import EgoIcon from "./components/icons/EgoIcon";
import GiftIcon from "./components/icons/GiftIcon";
import IdentityIcon from "./components/icons/IdentityIcon";
import { useModal } from "./components/modals/ModalProvider";
import Status from "./components/objects/Status";
import { EgoTooltipLoader } from "./components/tooltips/EgoTooltip";
import { EncounterTooltipLoader } from "./components/tooltips/EncounterTooltip";
import { getGeneralTooltipProps } from "./components/tooltips/GeneralTooltip";
import { GiftTooltipLoader } from "./components/tooltips/GiftTooltip";
import { IdentityTooltipLoader } from "./components/tooltips/IdentityTooltip";
import { StatusTooltipLoader } from "./components/tooltips/StatusTooltip";
import TooltipTemplate from "./components/tooltips/TooltipTemplate";
import { searchBuilds } from "./database/builds";
import { searchMdPlans } from "./database/mdPlans";
import { searchUsers } from "./database/users";
import { normalizeString } from "./lib/filter";

const INDEX_ACTIONS = [
    {
        id: "ratings-reviews",
        label: "Ratings & Reviews",
        keywords: ["ratings", "reviews", "rating", "review"],
        description: "View ratings/reviews menu",
        types: ["identity", "ego"],
    }
];

const DATABASE_ACTIONS = [
    {
        id: "user",
        keywords: ["user", "users"],
        description: "Search users",
        label: "Users",
    },
    {
        id: "builds",
        keywords: ["build", "builds", "team", "teams"],
        description: "Search builds",
        label: "Community Builds",
    },
    {
        id: "md-plans",
        keywords: ["md plan", "md plans", "md", "plan", "plans"],
        description: "Search md plans",
        label: "MD Plans",
    },
];

const ALL_ACTIONS = [...INDEX_ACTIONS, ...DATABASE_ACTIONS.map(x => ({ ...x, category: "database" }))]
const actionDescs = ALL_ACTIONS.map(x => `${x.keywords.join("/")} - ${x.description}`).join("\n");

function parseSearchQuery(query, actions) {
    const match = query.match(/^([^:]+):\s*(.*)$/);
    if (!match) return { action: null, query: query.trim() };

    const keyword = normalizeString(match[1]);
    const action = actions.find(action => action.keywords.some(alias => normalizeString(alias) === keyword));
    if (!action) return { action: null, query: query.trim() };

    return { action, query: match[2].trim() };
}

export default function TitleSearch() {
    const [search, setSearch] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) setSearch(false);
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    return <div ref={containerRef} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {!search ?
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", textAlign: "center" }}>
                <a href={"/"} style={{ color: "var(--primary-text-color, #ddd)", textDecoration: "none", cursor: "pointer" }}>
                    Limbus Company Tools
                </a>
            </h1> :
            <SearchComponent setSearch={setSearch} />
        }

        <button onClick={() => setSearch(p => !p)} style={{ background: "transparent", padding: "0.2rem" }}
            {...getGeneralTooltipProps("Search pages, identities, E.G.O, and so on. There are also actions you can do by typing 'action: query'. For example, typing 'ratings: lcb' then selecting something would open the ratings menu instead of navigating to its page.\n\nActions:\n" + actionDescs)}
        >
            <FaSearch />
        </button>
    </div>
}

function SearchComponent({ setSearch }) {
    const { openGiftModal, openStatusModal, openRatingModal } = useModal();
    const [index, indexLoading] = useData("search_index");
    const [altNames, altNamesLoading] = useData("alt_names");
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [databaseResults, setDatabaseResults] = useState([]);
    const [databaseLoading, setDatabaseLoading] = useState(false);

    const inputRef = useRef(null);
    const resultRefs = useRef([]);
    const tooltipRef = useRef(null);

    const router = useRouter();

    const parsedQuery = useMemo(
        () => parseSearchQuery(query, ALL_ACTIONS),
        [query]
    );

    const indexResults = useMemo(() => {
        const normalized = normalizeString(parsedQuery.query);
        if (!normalized || indexLoading || altNamesLoading) return [];
        const queryTerms = normalized.split(/\s+/).filter(Boolean);

        if (parsedQuery.action?.category === "database") {
            return [];
        }

        return index
            .filter(item => {
                if (!parsedQuery.action) return true;
                return parsedQuery.action.types.includes(item.type)
            })
            .map(item => {
                const label = normalizeString(item.label || "");
                const terms = (
                    item.type === "identity" || item.type === "ego"
                        ? altNames[item.id] || []
                        : item.searchTerms || []
                ).map(term => normalizeString(term));

                const searchable = [label, ...terms];
                let score = 0;

                if (label === normalized) score = 100;
                else if (label.startsWith(normalized)) score = 75;
                else if (label.includes(normalized)) score = 50;
                else if (terms.some(term => term === normalized)) score = 40;
                else if (terms.some(term => term.startsWith(normalized))) score = 30;
                else if (terms.some(term => term.includes(normalized))) score = 20;

                if (queryTerms.length > 1) {
                    const matchedTerms = queryTerms.filter(queryTerm =>
                        searchable.some(term => term.includes(queryTerm))
                    );

                    if (matchedTerms.length === queryTerms.length) {
                        score = Math.max(score, 60 + matchedTerms.length);
                    } else if (matchedTerms.length > 0) {
                        score = Math.max(
                            score,
                            (matchedTerms.length / queryTerms.length) * 30
                        );
                    }
                }

                return { item, score };
            })
            .filter(result => result.score > 0)
            .sort(
                (a, b) =>
                    b.score - a.score ||
                    a.item.label.localeCompare(b.item.label)
            )
            .slice(0, 10)
            .map(result => result.item);
    }, [index, parsedQuery, altNames, indexLoading, altNamesLoading]);

    useEffect(() => {
        const { action, query: actionQuery } = parsedQuery;

        if (action?.category !== "database" || !actionQuery) {
            setDatabaseResults([]);
            setDatabaseLoading(false);
            return;
        }

        setDatabaseResults([]);
        setDatabaseLoading(true);

        let cancelled = false;

        const timeout = setTimeout(async () => {
            async function fetchDb(action, query) {
                if (action === "builds") return await searchBuilds({ query: query, published: true });
                if (action === "md-plans") return await searchMdPlans({ query: query, published: true });
                if (action === "user") return await searchUsers(query);
                return [];
            }
            try {
                const results = await fetchDb(action.id, actionQuery);
                if (!cancelled) setDatabaseResults(results);
            } catch (error) {
                if (!cancelled) {
                    console.error("Database search failed:", error);
                    setDatabaseResults([]);
                }
            } finally {
                if (!cancelled) setDatabaseLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
        };
    }, [parsedQuery]);

    const results = parsedQuery.action?.category === "database" ? databaseResults : indexResults;

    useEffect(() => { inputRef.current?.focus(); }, []);
    useEffect(() => { setSelectedIndex(0); }, [parsedQuery]);
    useEffect(() => { resultRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" }); }, [selectedIndex]);

    function makeKey(parsedQuery, item) {
        switch (parsedQuery.action?.id) {
            case "builds":
                return `build-${item.id}`;
            case "md-plans":
                return `plan-${item.id}`;
            case "user":
                return `user-${item.username}`;
            default:
                switch (item.type) {
                    case "encounter":
                        return `${item.type}-${item.cat}-${item.enc}`;
                    default:
                        return `${item.type}-${item.id}`
                }
        }
    }

    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            tooltipRef.current?.close();
            return;
        }

        const item = results[selectedIndex];
        tooltipRef.current?.close();
        if (!item) return;

        const timeout = setTimeout(() => {
            tooltipRef.current?.open({
                anchorSelect: `#${CSS.escape(makeKey(parsedQuery, item))}`,
                content: item.description,
                place: "right-end",
            });
        }, 20);

        return () => clearTimeout(timeout);
    }, [results, selectedIndex, parsedQuery]);

    function closeSearch() {
        setSearch(false);
        setQuery("");
        setSelectedIndex(0);
    }

    function handleKeyDown(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex(current => Math.min(current + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex(current => Math.max(current - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            const item = results[selectedIndex];
            if (item) selectResult(item);
        } else if (event.key === "Escape") {
            event.preventDefault();
            if (query) setQuery("");
            else closeSearch();
        }
    }

    function selectResult(item) {
        switch (parsedQuery.action?.id) {
            case "ratings-reviews":
                switch (item.type) {
                    case "identity":
                        openRatingModal({ type: "identity", id: item.id });
                        break;
                    case "ego":
                        openRatingModal({ type: "ego", id: item.id });
                        break;
                }
                break;
            case "user":
                router.push(`/profiles/${item.username}`);
                break;
            case "builds":
                router.push(`/builds/${item.id}`);
                break;
            case "md-plans":
                router.push(`/md-plans/${item.id}`);
                break;

            default:
                switch (item.type) {
                    case "page": case "feature":
                        if (item.path) router.push(item.path);
                        else router.push(`/${item.id}`);
                        break;
                    case "identity":
                        router.push(`/identities/${item.id}`);
                        break;
                    case "ego":
                        router.push(`/egos/${item.id}`);
                        break;
                    case "gift":
                        openGiftModal({ id: item.id });
                        break;
                    case "status":
                        openStatusModal({ id: item.id })
                        break;
                    case "encounter":
                        router.push(`/encounters?category=${item.cat}&encounter=${item.enc}`);
                        break;
                }
        }

        closeSearch();
    }

    return <>
        <div style={{ position: "relative", width: "100%", minWidth: "min(300px, 40vw)" }}>
            <input ref={inputRef} type="text" value={query} onChange={event => setQuery(event.target.value)}
                onKeyDown={handleKeyDown} placeholder="Search..."
                style={{ width: "100%", boxSizing: "border-box", borderRadius: "0.5rem" }}
            />

            {query.trim() &&
                <div
                    role="listbox"
                    style={{
                        position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                        maxHeight: "min(60vh, 400px)", overflowY: "auto",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--secondary-border-color)", borderRadius: "6px",
                        zIndex: 1000, width: "100%"
                    }}
                >
                    {results.length > 0 ?
                        results.map((item, i) => (
                            <div key={makeKey(parsedQuery, item)}
                                id={makeKey(parsedQuery, item)}
                                ref={element => { resultRefs.current[i] = element; }}
                                onMouseEnter={() => setSelectedIndex(i)}
                                onMouseDown={event => { event.preventDefault(); selectResult(item); }}
                                style={{ padding: "0.5rem", cursor: "pointer", background: i === selectedIndex ? "var(--bg-hover)" : "transparent" }}
                                data-tooltip-id={"global-search-tooltip"}
                            >
                                <SearchResultContent parsedQuery={parsedQuery} item={item} />
                            </div>
                        )) :
                        <div style={{ padding: "12px", opacity: 0.7 }} >
                            {databaseLoading ? "Loading..." : "No results found"}
                        </div>}
                </div>
            }

            <TooltipTemplate
                ref={tooltipRef} id={"global-search-tooltip"}
                contentFunc={() => <SearchTooltip parsedQuery={parsedQuery} item={results[selectedIndex]} />}
                place="right-end" imperativeModeOnly
            />
        </div>
    </>
}

function SearchResultContent({ parsedQuery, item }) {
    switch (parsedQuery.action?.id) {
        case "ratings-reviews":
            switch (item.type) {
                case "identity":
                    return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <IdentityIcon id={item.id} size={32} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {item.label}
                            <span className="sub-text">{item.type} ratings</span>
                        </div>
                    </div>

                case "ego":
                    return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <EgoIcon id={item.id} type="awaken" size={32} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {item.label}
                            <span className="sub-text">{item.type} ratings</span>
                        </div>
                    </div>
            }

        case "builds":
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div>{item.title}</div>
                <div className="sub-text">Team Build</div>
            </div>
        case "md-plans":
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div>{item.title}</div>
                <div className="sub-text">MD Plan</div>
            </div>
        case "user":
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div>{item.username}</div>
                <div className="sub-text">User</div>
            </div>

        default:
            switch (item.type) {
                case "identity":
                    return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <IdentityIcon id={item.id} size={32} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {item.label}
                            <span className="sub-text">{item.type}</span>
                        </div>
                    </div>

                case "ego":
                    return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <EgoIcon id={item.id} type="awaken" size={32} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {item.label}
                            <span className="sub-text">{item.type}</span>
                        </div>
                    </div>

                case "status":
                    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <Status id={item.id} includeTooltip={false} />
                        <span className="sub-text">{item.type}</span>
                    </div>

                case "gift":
                    return <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <GiftIcon id={item.id} imgOnly={true} scale={0.3} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            {item.label}
                            <span className="sub-text">{item.type}</span>
                        </div>
                    </div>

                default:
                    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <div>{item.label}</div>
                        <div className="sub-text">{item.type}</div>
                    </div>
            }
    }
}

function SearchTooltip({ parsedQuery, item }) {
    if (!item) return;

    switch (parsedQuery.action?.id) {
        case "builds":
            return <TeamBuild build={item} size={"M"} clickable={false} complete={false} />
        case "md-plans":
            return <MdPlan plan={item} clickable={false} complete={false} />
        default:
            switch (item.type) {
                case "identity":
                    return <IdentityTooltipLoader id={item.id} />
                case "ego":
                    return <EgoTooltipLoader id={item.id} />
                case "gift":
                    return <GiftTooltipLoader giftId={item.id} />
                case "status":
                    return <StatusTooltipLoader statusId={item.id} />
                case "encounter":
                    return <EncounterTooltipLoader cat={item.cat} id={item.enc} />
                default:
                    return null;
            }
    }
}
