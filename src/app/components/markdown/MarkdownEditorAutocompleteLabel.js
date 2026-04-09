"use client";

import { sinnerIdMapping } from "@/app/lib/constants";

function createAutocompleteLabel(entry, type) {
    if (type === "identity" || type === "ego")
        return `[${sinnerIdMapping[entry.sinnerId]}] ${entry.name}`;
    if (type === "status" || type === "statusicon")
        return entry.name;
    if (type === "giftname" || type === "gifticons")
        return entry.names[0];
    if (type === "keyword" || type === "sinner")
        return entry;
    return "";
}

export { createAutocompleteLabel };