"use client";

import { autocompletion, startCompletion, completionStatus, acceptCompletion } from "@codemirror/autocomplete";
import { Facet } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { useEffect, useMemo, useRef, useState } from "react";

import { createAutocompleteLabel } from "./MarkdownEditorAutocompleteLabel";
import constructMarkdownEditorAutocompleteTooltip, { constructMarkdownEditorTypeTooltip } from "./MarkdownEditorAutocompleteTooltip";
import { useSkillData } from "../dataHooks/skills";
import { useData } from "../DataProvider";
import { convertTokenAlias, tokenAliases } from "./tokens";
import { tokensDescs } from "./tokens";

import { keywordToIdMapping } from "@/app/database/keywordIds";
import { sinnerIdMapping } from "@/app/lib/constants";
import { fuzzyScore } from "@/app/lib/scoring";

const autocompleteDataFacet = Facet.define();

function useAutocompleteDataFacetExtension(viewRef) {
    const [requestedTypes, setRequestedTypes] = useState(new Set());
    const [identities, identitiesLoading] = useData("identities_mini", requestedTypes.has("identity"));
    const [egos, egosLoading] = useData("egos", requestedTypes.has("ego"));
    const [statuses, statusesLoading] = useData("statuses", requestedTypes.has("status"));
    const [gifts, giftsLoading] = useData("gifts", requestedTypes.has("giftname") || requestedTypes.has("gifticons"));
    const [themePacks, themePacksLoading] = useData("md_theme_packs", requestedTypes.has("themepack"));
    const [encounters, encountersLoading] = useData("encounters", requestedTypes.has("encounter"));
    const [icons, iconsLoading] = useData("additional_icons", requestedTypes.has("icon"));
    const [skillOwnerId, setSkillOwnerId] = useState(null);
    const skillData = useSkillData(skillOwnerId ? (skillOwnerId[0] === '1' ? "identity" : "ego") : null, skillOwnerId, 5);

    const dataRef = useRef({
        requestedTypes,
        identities, identitiesLoading,
        egos, egosLoading,
        statuses, statusesLoading,
        gifts, giftsLoading,
        themePacks, themePacksLoading,
        encounters, encountersLoading,
        icons, iconsLoading,
        skillOwnerId, skillData
    });

    useEffect(() => {
        dataRef.current = {
            requestedTypes,
            identities, identitiesLoading,
            egos, egosLoading,
            statuses, statusesLoading,
            gifts, giftsLoading,
            themePacks, themePacksLoading,
            encounters, encountersLoading,
            icons, iconsLoading,
            skillOwnerId, skillData
        };
    }, [
        requestedTypes,
        identities, identitiesLoading,
        egos, egosLoading,
        statuses, statusesLoading,
        gifts, giftsLoading,
        themePacks, themePacksLoading,
        encounters, encountersLoading,
        icons, iconsLoading,
        skillOwnerId, skillData
    ]);

    useEffect(() => {
        if (!viewRef.current) return;

        if (!identitiesLoading && requestedTypes.has("identity")) {
            startCompletion(viewRef.current);
        }

        if (!egosLoading && requestedTypes.has("ego")) {
            startCompletion(viewRef.current);
        }

        if (!statusesLoading && requestedTypes.has("status")) {
            startCompletion(viewRef.current);
        }

        if (!giftsLoading && (requestedTypes.has("giftname") || requestedTypes.has("gifticons"))) {
            startCompletion(viewRef.current);
        }

        if (!themePacksLoading && requestedTypes.has("themepack")) {
            startCompletion(viewRef.current);
        }

        if (!encountersLoading && requestedTypes.has("encounter")) {
            startCompletion(viewRef.current);
        }

        if (!iconsLoading && requestedTypes.has("icon")) {
            startCompletion(viewRef.current);
        }

        if (skillData && skillOwnerId) {
            startCompletion(viewRef.current);
        }
    }, [
        viewRef,
        identitiesLoading,
        egosLoading,
        statusesLoading,
        giftsLoading,
        themePacksLoading,
        encountersLoading,
        iconsLoading,
        skillOwnerId,
        skillData,
        requestedTypes
    ]);

    const provider = useMemo(() => ({
        has(type) {
            const {
                identities, identitiesLoading,
                egos, egosLoading,
                statuses, statusesLoading,
                gifts, giftsLoading,
                themePacks, themePacksLoading,
                encounters, encountersLoading,
                icons, iconsLoading
            } = dataRef.current;

            switch (convertTokenAlias(type)) {
                case "identity":
                    return !identitiesLoading && identities;
                case "ego":
                    return !egosLoading && egos;
                case "skill":
                    return !identitiesLoading && identities && !egosLoading && egos;
                case "status":
                case "statusicon":
                    return !statusesLoading && statuses;
                case "giftname":
                case "gifticons":
                    return !giftsLoading && gifts;
                case "themepack":
                    return !themePacksLoading && themePacks;
                case "encounter":
                    return !encountersLoading && encounters;
                case "icon":
                    return !iconsLoading && icons;
                case "keyword":
                case "sinner":
                case "sinnericon":
                    return true;
                default:
                    return false;
            }
        },

        hasSkillOwner(id) {
            const { skillOwnerId, skillData } = dataRef.current;
            return skillOwnerId === id && skillData;
        },

        load(type) {
            setRequestedTypes(prev => new Set(prev).add(convertTokenAlias(type)));
        },

        loadSkillOwner(id) {
            setSkillOwnerId(id);
        },

        get(type) {
            const {
                identities,
                egos,
                statuses,
                gifts,
                themePacks,
                encounters,
                icons
            } = dataRef.current;

            switch (convertTokenAlias(type)) {
                case "identity":
                    return { entries: Object.entries(identities).map(([id, identity]) => ({ id: id, label: identity.name, item: identity })) || [], multi: false };
                case "ego":
                    return { entries: Object.entries(egos).map(([id, ego]) => ({ id: id, label: ego.name, item: ego })) || [], multi: false };
                case "skill":
                    return {
                        entries: [
                            ...Object.entries(identities).map(([id, identity]) => ({ id: id, label: identity.name, item: identity })),
                            ...Object.entries(egos).map(([id, ego]) => ({ id: id, label: ego.name, item: ego })),
                        ], multi: false
                    };
                case "status":
                case "statusicon":
                    return { entries: Object.entries(statuses).map(([id, status]) => ({ id: id, label: status.name, item: status })) || [], multi: false };
                case "giftname":
                    return { entries: Object.entries(gifts).map(([id, gift]) => ({ id: id, label: gift.names[0], item: gift })) || [], multi: false };
                case "gifticons":
                    return { entries: Object.entries(gifts).map(([id, gift]) => ({ id: id, label: gift.names[0], item: gift })) || [], multi: true };
                case "themepack":
                    return { entries: Object.entries(themePacks).map(([id, themePack]) => ({ id: id, label: themePack.name, item: themePack })) || [], multi: false };
                case "encounter":
                    let entries = [];
                    Object.entries(encounters).forEach(([cat, list]) => {
                        Object.entries(list).forEach(([id, name]) => {
                            entries.push({ id: `${cat}|${id}`, label: name, item: { cat: cat, id: id, name: name } })
                        })
                    })
                    return { entries: entries, multi: false };
                case "icon":
                    return { entries: Object.entries(icons).map(([id, name]) => ({ id: id, label: name, item: { id: id, name: name } })) || [], multi: false };
                case "keyword":
                    return { entries: Object.keys(keywordToIdMapping).map(kw => ({ id: kw, label: kw, item: kw })) || [], multi: false };
                case "sinner":
                case "sinnericon":
                    return { entries: Object.entries(sinnerIdMapping).map(([id, name]) => ({ id: id, label: name, item: name })) || [], multi: false };
                default:
                    return { entries: [], multi: false };
            }
        },

        getSkills() {
            const { skillOwnerId, skillData } = dataRef.current;
            if (!skillOwnerId || !skillData) return [];

            if (skillOwnerId[0] === '1') return Object.values(skillData.skills).map(x => ({ id: x.data.id, label: x.data.name, item: x.data }));
            return [...skillData.awakeningSkills, ...(skillData.corrosionSkills ?? [])].map(x => ({ id: x.data.id, label: x.data.name, item: x.data }));
        },

        getOriginalData(type) {
            const {
                identities,
                egos,
                statuses,
                gifts,
                themePacks,
                encounters,
                icons
            } = dataRef.current;

            switch (convertTokenAlias(type)) {
                case "identity": return identities;
                case "ego": return egos;
                case "skill": return { ...identities, ...egos };
                case "status":
                case "statusicon":
                    return statuses;
                case "giftname":
                case "gifticons":
                    return gifts;
                case "themepack":
                    return themePacks;
                case "encounter":
                    return encounters;
                case "icon":
                    return icons;
                default: return {};
            }
        }
    }), [setRequestedTypes]);

    const facetExtension = useMemo(
        // eslint-disable-next-line react-hooks/refs
        () => autocompleteDataFacet.of(provider),
        [provider]
    );

    return facetExtension;
}

async function tokenCompletionSourceType(context) {
    const word = context.matchBefore(/\{([a-zA-Z]*)$/);
    if (!word) return null;

    const query = word.text.slice(1);
    const from = word.from + 1;
    const to = context.pos;

    return new Promise(resolve => {
        let matches = [];

        Object.entries(tokensDescs).forEach(([id, desc]) => matches.push({
            entry: id,
            isAlias: false,
            score: fuzzyScore(query, `${id} ${desc}`)
        }))

        Object.entries(tokenAliases).forEach(([alias, id]) => matches.push({
            entry: alias,
            isAlias: true,
            score: fuzzyScore(query, `${id} ${tokensDescs[id]}`)
        }))

        matches = matches
            .filter(m => m.score > -Infinity)
            .sort((a, b) => a.score === b.score ? a.entry.localeCompare(b.entry) : b.score - a.score);

        const options = matches.map(m => {
            const entry = m.entry;
            const isAlias = m.isAlias

            return {
                label: entry,
                detail: `(${isAlias ? tokenAliases[entry] : entry})`,
                apply(view, completion, from, to) {
                    view.dispatch({
                        changes: {
                            from,
                            to,
                            insert: entry + ":"
                        }
                    });

                    startCompletion(view);
                },
                // apply: entry + ":",
                info: () => constructMarkdownEditorTypeTooltip(isAlias ? tokenAliases[entry] : entry)
            };
        })

        resolve({
            from,
            to,
            options,
            filter: false
        });
    });
}

async function tokenCompletionSourceSkill(context, ownerId, query) {
    const from = context.matchBefore(/[^|]*$/).from;
    const to = context.pos;

    const dataProvider = context.state.facet(autocompleteDataFacet)[0];

    if (!dataProvider.hasSkillOwner(ownerId)) {
        dataProvider.loadSkillOwner(ownerId);

        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: [{
                label: "Loading…",
                type: "info",
                boost: -1e9, // never selected
                info: () => {
                    const div = document.createElement("div");
                    div.style.padding = "8px";
                    div.style.opacity = "0.7";
                    div.style.fontStyle = "italic";
                    div.textContent = "Loading data…";
                    return div;
                }
            }]
        };
    }

    return new Promise(resolve => {
        const entries = dataProvider.getSkills();

        const matches = entries
            .map(e => ({
                entry: e,
                score: fuzzyScore(query, e.label)
            }))
            .filter(m => m.score > -Infinity)
            .sort((a, b) => a.score === b.score ? a.entry.id.localeCompare(b.entry.id) : b.score - a.score);

        const options = matches.map(m => {
            const entry = m.entry;
            const token = entry.id.slice(-2);

            return {
                label: entry.item.name,
                detail: `(${token})`,
                apply: `${token}}`,
                info: () => {
                    return constructMarkdownEditorAutocompleteTooltip(entry.item, "skill");
                }
            };
        })

        resolve({
            from,
            to,
            options,
            filter: false
        });
    });
}

async function tokenCompletionSource(context) {
    const word = context.matchBefore(/\{([a-zA-Z]+):([^}]*)$/);
    if (!word) return tokenCompletionSourceType(context);

    const inside = word.text.slice(1);
    const parts = inside.split(":");

    const type = convertTokenAlias(parts[0]);
    if (!type) return null;
    if (![
        "identity", "ego", "skill", "status", "statusicon",
        "giftname", "gifticons", "themepack", "encounter",
        "icon", "keyword", "sinner", "sinnericon"
    ].includes(type)) return null;

    const rest = parts.slice(1);
    const query = rest.length ? rest[rest.length - 1] : "";

    if (type === "skill") {
        const skillParts = query.split("|");
        if (skillParts.length === 2) return tokenCompletionSourceSkill(context, skillParts[0], skillParts[1]);
    }

    const from = context.matchBefore(/[^:]*$/).from;
    const to = context.pos;

    const dataProvider = context.state.facet(autocompleteDataFacet)[0];

    if (!dataProvider.has(type)) {
        dataProvider.load(type);
        if ((type === "giftname" || type === "gifticons") && !dataProvider.has("status")) {
            dataProvider.load("status");
        }

        if(type === "skill") {
            dataProvider.load("identity");
            dataProvider.load("ego");
        }

        return {
            from: context.pos,
            to: context.pos,
            filter: false,
            options: [{
                label: "Loading…",
                type: "info",
                boost: -1e9, // never selected
                info: () => {
                    const div = document.createElement("div");
                    div.style.padding = "8px";
                    div.style.opacity = "0.7";
                    div.style.fontStyle = "italic";
                    div.textContent = "Loading data…";
                    return div;
                }
            }]
        };
    }

    return new Promise(resolve => {
        const { entries, multi } = dataProvider.get(type);

        const getApplyString = (token) => {
            if (type === "skill") return `${token}|`;
            if (multi) return token;
            return `${token}}`
        }

        const completeType = type === "skill" ? "skillOwner" : type;

        const matches = entries
            .map(e => ({
                entry: e,
                score: fuzzyScore(query, e.label)
            }))
            .filter(m => m.score > -Infinity)
            .sort((a, b) => a.score === b.score ? a.entry.id.localeCompare(b.entry.id) : b.score - a.score);

        const options = matches.map(m => {
            const entry = m.entry;
            const token = entry.id;

            return {
                label: createAutocompleteLabel(entry.item, completeType),
                detail: `(${token})`,
                apply(view, completion, from, to) {
                    view.dispatch({
                        changes: {
                            from,
                            to,
                            insert: getApplyString(token)
                        },
                        selection: {
                            anchor: from + token.length + 1,
                            head: from + token.length + 1
                        }
                    });

                    if (type === "skill") startCompletion(view);
                },
                info: () => {
                    if (type === "giftname" || type === "gifticons") {
                        return constructMarkdownEditorAutocompleteTooltip(entry.item, type, dataProvider.getOriginalData("status"));
                    } else if (type === "sinnericon") {
                        return constructMarkdownEditorAutocompleteTooltip(entry.id, type);
                    } else {
                        return constructMarkdownEditorAutocompleteTooltip(entry.item, completeType);
                    }
                }
            };
        })

        resolve({
            from,
            to,
            options,
            filter: false
        });
    });
}

const tokenAutocomplete = autocompletion({
    override: [tokenCompletionSource]
});

const backspaceTriggersCompletion = keymap.of([
    {
        key: "Backspace",
        run(view) {
            const ok = startCompletion(view);
            return ok || true;
        }
    }
]);

const tabAcceptsCompletion = keymap.of([
    {
        key: "Tab",
        run(view) {
            if (completionStatus(view.state) === "active") {
                return acceptCompletion(view);
            }
            return false;
        }
    }
]);

export { useAutocompleteDataFacetExtension, backspaceTriggersCompletion, tokenAutocomplete, tabAcceptsCompletion };