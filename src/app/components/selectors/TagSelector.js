"use client";

import debounce from "lodash.debounce";
import { useState } from "react";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";

import { fetchTags, handleCreateTag } from "@/app/database/tags";
import { selectStyle } from "@/app/styles/selectStyle";

export function tagToTagSelectorOption(tag) {
    return { value: tag, label: tag };
}

async function loadOptions(inputValue) {
    if (!inputValue?.trim()) return [];

    const tags = await fetchTags(inputValue);
    return tags.map(t => tagToTagSelectorOption(t));
}

const debouncedLoadOptions = debounce((inputValue, resolve) => loadOptions(inputValue).then(resolve), 300);

export function validateTag(name) {
    const cleaned = name.trim().toLowerCase();

    if (cleaned.length < 1 || cleaned.length > 50) {
        return { valid: false, reason: "Tags must be 1–50 characters long." };
    }

    if (!/^[A-Za-z0-9 -]+$/.test(cleaned)) {
        return {
            valid: false,
            reason: "Tags may only contain letters, numbers, spaces, and hyphens."
        };
    }

    return { valid: true, value: cleaned };
}

export default function TagSelector({ selected, onChange, creatable = false, styles = selectStyle }) {
    const loadOptionsFinal = (inputValue) => new Promise((resolve) => debouncedLoadOptions(inputValue, resolve));

    const SelectComponent = creatable ? AsyncCreatableSelect : AsyncSelect;
    const [error, setError] = useState("");

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "auto" }}>
            <SelectComponent
                isMulti
                cacheOptions={false}
                defaultOptions={[]}
                loadOptions={loadOptionsFinal}
                value={selected}
                onChange={onChange}
                placeholder={creatable ? "Type to search or create tags..." : "Type to search tags..."}
                onCreateOption={
                    creatable
                        ? async (name) => {
                            const validated = validateTag(name);
                            if (!validated.valid) {
                                setError(validated.reason);
                                return;
                            }
                            setError("");

                            const newTag = await handleCreateTag(validated.value);
                            if (newTag) onChange([...selected, tagToTagSelectorOption(newTag)]);
                        }
                        : undefined
                }
                styles={styles}
                noOptionsMessage={() => "No matching tags"}
            />
            {error && (
                <div style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>
                    {error}
                </div>
            )}
        </div>
    );
}
