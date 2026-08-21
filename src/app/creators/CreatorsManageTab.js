import { useCallback, useEffect, useState } from "react";

import { CREATOR_TAGS } from "./CreatorsDirectoryTab";
import Avatar from "../components/icons/Avatar";
import { HorizontalDivider } from "../components/objects/Dividers";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { AvatarUploader } from "../components/socials/AvatarUploader";
import SocialsDisplay from "../components/socials/SocialsDisplay";
import SocialsEditor from "../components/socials/SocialsEditor";
import { socialsData } from "../components/socials/userSocials";
import { createCreator, deleteCreator, getCreatorTagVotes, searchCreators, submitCreatorTagVotes, updateCreator } from "../database/creators";

function emptyCreator() {
    return {
        name: "",
        avatar_id: null,
        platforms: [],
        is_variety: false,
        tag_ids: [],
    };
}

function CreatorEditor({ creator, onSave, onCancel }) {
    const [name, setName] = useState(creator.name);
    const [avatarId, setAvatarId] = useState(creator.avatar_id);
    const [platforms, setPlatforms] = useState(creator.platforms);
    const [isVariety, setIsVariety] = useState(creator.is_variety);
    const [tagIds, setTagIds] = useState(creator.tag_ids ?? []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    function toggleTag(tagId) {
        setTagIds(current =>
            current.includes(tagId)
                ? current.filter(id => id !== tagId)
                : [...current, tagId]
        );
    }

    async function save() {
        setSaving(true);
        setError(null);

        let platformsValid = true;
        for (let i = 0; i < platforms.length; i++) {
            if (!socialsData[platforms[i].type].validator.test(platforms[i].value)) {
                platformsValid = false;
                setPlatforms(p => p.map((platform, index) => index === i ? { ...platform, invalid: true } : platform));
            } else {
                if (platforms[i].invalid) {
                    const { invalid, ...rest } = platforms[i];
                    setPlatforms(p => p.map((platform, index) => index === i ? rest : platform));
                }
            }
        }

        if (!platformsValid) {
            setError('Invalid platform');
            setSaving(false);
            return;
        }

        try {
            const values = {
                name: name.trim(),
                avatarId,
                platforms,
                isVariety,
                tagIds,
            };

            const saved = creator.id
                ? await updateCreator({ id: creator.id, ...values, })
                : await createCreator(values);

            submitCreatorTagVotes(saved.id, tagIds);
            onSave(saved);
        } catch (error) {
            setError(error);
        } finally {
            setSaving(false);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "min(100%, 1200px)" }}>
        <h4 style={{ margin: 0 }}>Name:</h4>
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            <input value={name} onChange={event => setName(event.target.value)} />
        </div>

        <h4 style={{ margin: 0 }}>Avatar:</h4>
        <AvatarUploader avatarId={avatarId} onUpdated={setAvatarId} />

        <h4 style={{ margin: 0 }}>Creator Type:</h4>
        <div style={{ display: "flex", gap: "0.2rem" }}>
            <label>
                <input type="radio" checked={!isVariety} onChange={() => setIsVariety(false)} />
                PM Creator
            </label>

            <label>
                <input type="radio" checked={isVariety} onChange={() => setIsVariety(true)} />
                Variety Creator
            </label>
        </div>

        <h4 style={{ margin: 0 }}>Platforms:</h4>
        <SocialsEditor socials={platforms} setSocials={setPlatforms} />

        <h4 style={{ margin: 0 }}>Tags:</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
            {CREATOR_TAGS.map(tag => (
                <label key={tag.id}>
                    <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={() => toggleTag(tag.id)} />
                    {tag.label}
                </label>
            ))}
        </div>

        {error && <div className="error-text"> {error.message}</div>}

        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" onClick={onCancel} disabled={saving}>
                Cancel
            </button>

            <button type="button" onClick={save} disabled={saving || !name.trim()}>
                {saving ? "Saving..." : "Save"}
            </button>
        </div>
    </div>;
}

export default function CreatorsManageTab() {
    const [creators, setCreators] = useState([]);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    function submitSearch() {
        setSearch(searchInput.trim());
    }

    const loadCreators = useCallback(async ()  => {
        setLoading(true);
        setError(null);

        try {
            const data = await searchCreators({ search: search ?? null, tagIds: [], isVariety: null, });
            setCreators(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        loadCreators();
    }, [loadCreators, search]);

    async function editCreator(creator) {
        const tagIds = await getCreatorTagVotes(creator.id);
        setEditing({ ...creator, tag_ids: tagIds ?? [] });
    }

    function addCreator() {
        setEditing(emptyCreator());
    }

    async function handleSave(saved) {
        setEditing(null);
        await loadCreators();
    }

    async function handleDelete(creator) {
        if (!confirm(`Delete ${creator.name}?`)) return;

        try {
            await deleteCreator(creator.id);
            setCreators(current => current.filter(x => x.id !== creator.id));
        } catch (error) {
            setError(error);
        }
    }

    if (editing) return <CreatorEditor creator={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <button type="button" onClick={addCreator}>
            + Add Creator
        </button>

        {error && <div className="error-text"> {error.message}</div>}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
            <input type="search" value={searchInput} onChange={event => setSearchInput(event.target.value)}
                onKeyDown={event => {
                    if (event.key === "Enter") submitSearch();
                }}
                placeholder="Search creators..."
            />

            <button onClick={submitSearch}>Search</button>
            <button onClick={() => { setSearchInput(""); setSearch(""); }} disabled={!searchInput && !search}>
                Clear
            </button>
        </div>

        <HorizontalDivider />

        {loading ?
            <LoadingContentPageTemplate /> :
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Name/Type</th>
                            <th>Platforms</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {creators.map(creator => <tr key={creator.id}>
                            <td>
                                <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem" }}>
                                    <Avatar avatarId={creator.avatar_id} size={32} />
                                </div>
                            </td>

                            <td>
                                <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem" }}>
                                    <strong>{creator.name}</strong>
                                    <div className="sub-text">{creator.is_variety ? "Variety Creator" : "PM Creator"}</div>
                                </div>
                            </td>

                            <td>
                                <div style={{ padding: "0.5rem" }}>
                                    <SocialsDisplay socials={creator.platforms} expandable={false} />
                                </div>
                            </td>

                            <td>
                                <div style={{ display: "flex", padding: "0.5rem" }}>
                                    <button onClick={() => editCreator(creator)}>Edit</button>
                                    <button onClick={() => handleDelete(creator)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        }
    </div>
}