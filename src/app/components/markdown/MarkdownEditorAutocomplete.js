import { autocompletion, startCompletion, completionStatus, acceptCompletion } from "@codemirror/autocomplete";
import { Facet } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { useEffect, useMemo, useRef, useState } from "react";

import { convertMarkdownAlias } from "./MarkdownAliases";
import { createAutocompleteLabel } from "./MarkdownEditorAutocompleteLabel";
import constructMarkdownEditorAutocompleteTooltip from "./MarkdownEditorAutocompleteTooltip";
import { useData } from "../DataProvider";

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

    const dataRef = useRef({
        requestedTypes,
        identities,
        identitiesLoading,
        egos,
        egosLoading,
        statuses,
        statusesLoading,
        gifts,
        giftsLoading
    });

    useEffect(() => {
        dataRef.current = {
            requestedTypes,
            identities,
            identitiesLoading,
            egos,
            egosLoading,
            statuses,
            statusesLoading,
            gifts,
            giftsLoading
        };
    }, [requestedTypes, identities, identitiesLoading, egos, egosLoading, statuses, statusesLoading, gifts, giftsLoading]);

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
    }, [
        viewRef,
        identitiesLoading,
        egosLoading,
        statusesLoading,
        giftsLoading,
        requestedTypes
    ]);

    const provider = useMemo(() => ({
        has(type) {
            const {
                identities, identitiesLoading,
                egos, egosLoading,
                statuses, statusesLoading,
                gifts, giftsLoading
            } = dataRef.current;

            switch (convertMarkdownAlias(type)) {
                case "identity":
                    return !identitiesLoading && identities;
                case "ego":
                    return !egosLoading && egos;
                case "status":
                    return !statusesLoading && statuses;
                case "giftname":
                case "gifticons":
                    return !giftsLoading && gifts;
                case "keyword":
                case "sinner":
                    return true;
                default:
                    return false;
            }
        },

        load(type) {
            setRequestedTypes(prev => new Set(prev).add(convertMarkdownAlias(type)));
        },

        get(type) {
            const {
                identities,
                egos,
                statuses,
                gifts
            } = dataRef.current;

            switch (convertMarkdownAlias(type)) {
                case "identity":
                    return { entries: Object.entries(identities).map(([id, identity]) => ({ id: id, label: identity.name, item: identity })) || [], multi: false };
                case "ego":
                    return { entries: Object.entries(egos).map(([id, ego]) => ({ id: id, label: ego.name, item: ego })) || [], multi: false };
                case "status":
                    return { entries: Object.entries(statuses).map(([id, status]) => ({ id: id, label: status.name, item: status })) || [], multi: false };
                case "giftname":
                    return { entries: Object.entries(gifts).map(([id, gift]) => ({ id: id, label: gift.names[0], item: gift })) || [], multi: false };
                case "gifticons":
                    return { entries: Object.entries(gifts).map(([id, gift]) => ({ id: id, label: gift.names[0], item: gift })) || [], multi: true };
                case "keyword":
                    return { entries: Object.keys(keywordToIdMapping).map(kw => ({ id: kw, label: kw, item: kw })) || [], multi: false };
                case "sinner":
                    return { entries: Object.entries(sinnerIdMapping).map(([id, name]) => ({ id: id, label: name, item: name })) || [], multi: false };
                default:
                    return { entries: [], multi: false };
            }
        },

        getOriginalData(type) {
            const {
                identities,
                egos,
                statuses,
                gifts
            } = dataRef.current;

            switch (convertMarkdownAlias(type)) {
                case "identity": return identities;
                case "ego": return egos;
                case "status": return statuses;
                case "giftname": return gifts;
                case "gifticons": return gifts;
                default: return {};
            }
        }
    }), [setRequestedTypes]);

    const facetExtension = useMemo(
        () => autocompleteDataFacet.of(provider),
        [provider]
    );

    return facetExtension;
}

async function tokenCompletionSource(context) {
    const word = context.matchBefore(/\{([a-zA-Z]+):([^}]*)$/);
    if (!word) return null;

    const inside = word.text.slice(1);
    const parts = inside.split(":");

    const type = convertMarkdownAlias(parts[0]);
    if (!type) return null;
    if (!["identity", "ego", "status", "giftname", "gifticons", "keyword", "sinner"].includes(type)) return null;

    const rest = parts.slice(1);
    const query = rest.length ? rest[rest.length - 1] : "";

    const from = context.matchBefore(/[^:]*$/).from;
    const to = context.pos;

    const dataProvider = context.state.facet(autocompleteDataFacet)[0];

    if (!dataProvider.has(type)) {
        dataProvider.load(type);
        if ((type === "giftname" || type === "gifticons") && !dataProvider.has("status")) {
            dataProvider.load("status");
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
                label: createAutocompleteLabel(entry.item, type),
                detail: `(${token})`,
                apply: token + (multi ? "" : "}"),
                info: () => {
                    if (type === "giftname" || type === "gifticons") {
                        return constructMarkdownEditorAutocompleteTooltip(entry.item, type, dataProvider.getOriginalData("status"));
                    } else {
                        return constructMarkdownEditorAutocompleteTooltip(entry.item, type);
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