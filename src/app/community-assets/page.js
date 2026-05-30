"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./communityAssets.module.css";
import CommunityAsset from "../components/icons/CommunityAsset";
import { useModal } from "../components/modals/ModalProvider";
import { HorizontalDivider } from "../components/objects/Dividers";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { useAuth } from "../database/authProvider";
import { createCommunityAsset, deleteCommunityAsset, getCommunityAsset, getRecentCommunityAssets, getUserCommunityAssets, searchCommunityAssets, updateCommunityAsset } from "../database/communityAssets";
import { uiColors } from "../lib/colors";
import useLocalState from "../lib/useLocalState";

function SearchComponent({ type }) {
    const { openCommunityAssetModal } = useModal();
    const [search, setSearch] = useState("");
    const [assets, setAssets] = useState([]);
    const [fetching, setFetching] = useState(false);
    const fetchTimeout = useRef(null);

    const size = type === "emote" ? "128px" : "256px";

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFetching(true);

        const fetchAssets = async () => {
            setAssets([]);
            if (search.trim().length === 0) {
                const fetched = await getRecentCommunityAssets(type);
                setAssets(fetched);
            } else {
                const fetched = await searchCommunityAssets(search.trim(), type);
                setAssets(fetched);
            }
            setFetching(false);
        };

        clearTimeout(fetchTimeout.current);

        fetchTimeout.current = setTimeout(async () => {
            fetchAssets();
        }, 500);

        return () => clearTimeout(fetchTimeout.current);
    }, [search, type]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            Search: <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${type}s...`} />
        </div>
        {fetching ?
            <p className="title-text">Loading...</p> :
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}, 1fr))`, gap: "0.5rem", maxWidth: "min(1600px, 100%)" }}>
                {assets.map(({ id, prefix }) =>
                    <div key={id} className={styles.asset}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                        onClick={() => openCommunityAssetModal({ imageId: id })}
                    >
                        <CommunityAsset id={id} type={"sm"} />
                        <span>{prefix}_{id}</span>
                    </div>
                )}
            </div>
        }
    </div>
}

function ManageComponent({ type }) {
    const [assets, setAssets] = useState([]);
    const { user, moderation } = useAuth();
    const [selectedAsset, setSelectedAsset] = useState(null);

    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const [name, setName] = useState("");
    const [keywords, setKeywords] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [error2, setError2] = useState(null);
    const [uploadDisabled, setUploadDisabled] = useState(null);
    const [fetching, setFetching] = useState(false);

    const size = type === "emote" ? "128px" : "256px";

    useEffect(() => {
        const fetchAssets = async () => {
            setFetching(true);
            setAssets([]);
            const fetched = await getUserCommunityAssets(user.id, type);
            setAssets(fetched);
            setFetching(false);
        };

        setSelectedAsset(null);
        fetchAssets();
    }, [user, type]);

    useEffect(() => {
        if (moderation?.asset_upload_disabled_until) {
            const until = new Date(moderation.asset_upload_disabled_until);

            if (until > new Date()) {
                const formatted = new Intl.DateTimeFormat(undefined, { dateStyle: "long", timeStyle: "short" }).format(until);
                setUploadDisabled(`Asset uploads are disabled until ${formatted}.`);
                return;
            }
        }
    }, [moderation]);

    const fetchAsset = async (id) => {
        setSelectedAsset(null);
        const fetched = await getCommunityAsset(id);
        setSelectedAsset(fetched);
        setError2(null);
    }

    const onFileChange = e => {
        const f = e.target.files?.[0];
        if (!f) return;

        setFile(f);

        const url = URL.createObjectURL(f);
        setPreview(url);
    };

    const validatePrefix = (prefix) => {
        if (!prefix || prefix.length === 0) return "Name is required";
        if (prefix.length > 32) return "Name must be between 1-32 characters";
        if (!/^[A-Za-z0-9-]+$/.test(prefix)) return "Name must have only letters, numbers, and '-'";
        return null;
    }

    const onSubmit = async () => {
        if (!file || !name) return;

        const nameValidation = validatePrefix(name.trim());
        if (nameValidation) {
            setError(nameValidation);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", type);

            const res = await fetch("/api/community-asset", { method: "POST", body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Upload failed");

            await createCommunityAsset(data.id, type, name.trim(), keywords.trim());

            setFile(null);
            setPreview(null);
            setName("");
            setKeywords("");
            setAssets([{ id: data.id, prefix: name }, ...assets])
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const onUpdate = async () => {
        const nameValidation = validatePrefix(selectedAsset.prefix.trim());
        if (nameValidation) {
            setError2(nameValidation);
            return;
        }

        setLoading(true);
        setError2(null);

        try {
            await updateCommunityAsset(selectedAsset.id, selectedAsset.prefix.trim(), selectedAsset.keywords.trim());
            setSelectedAsset(null);
            setAssets(p => p.map(asset => asset.id === selectedAsset.id ? { ...selectedAsset } : asset))
        } catch (err) {
            setError2(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async id => {
        setLoading(true);
        await deleteCommunityAsset(id);
        setSelectedAsset(null);
        setAssets(p => p.filter(v => v.id !== id));
        setLoading(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        {uploadDisabled ?
            <p style={{ color: uiColors.red }}>{uploadDisabled}</p> :
            <>
                <h3 style={{ marginBottom: 0 }}>Upload a new {type}</h3>

                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    {preview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="preview" style={{ width: 128, height: "auto", borderRadius: 8 }} />
                    )}

                    <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={onFileChange} />

                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.2rem" }}>
                        <div />
                        <button onClick={() => inputRef.current?.click()} disabled={loading}>
                            Select Image
                        </button>

                        <span style={{ display: "flex", justifyContent: "end" }}>
                            <span {...getGeneralTooltipProps("Main way to search and identify assets")} className="hover-text">Name:</span>
                        </span>
                        <input value={name} onChange={(e) => setName(e.target.value)} />
                        <span style={{ display: "flex", justifyContent: "end" }}>
                            <span {...getGeneralTooltipProps("Additional terms to help search for the asset")} className="hover-text">Keywords:</span>
                        </span>
                        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                    </div>
                </div>

                <span className="sub-text" style={{ textAlign: "center" }}>
                    Assets are given a randomized id for uniqueness on upload but will be searchable by the given name and keywords.
                </span>

                <button onClick={onSubmit} disabled={loading || !file || !name}>
                    Upload
                </button>
                {error && <p style={{ margin: 0, color: uiColors.red }}>{error}</p>}
            </>
        }

        <HorizontalDivider />

        <h3 style={{ marginBottom: 0 }}>Your {type}s</h3>

        {selectedAsset && <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <CommunityAsset id={selectedAsset.id} type={"lg"} style={{ width: 128, height: "auto", borderRadius: 8 }} />

                <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.2rem" }}>
                    <span style={{ display: "flex", justifyContent: "end" }}>
                        <span {...getGeneralTooltipProps("Main way to search and identify assets")} className="hover-text">Name:</span>
                    </span>
                    <input value={selectedAsset.prefix} onChange={(e) => setSelectedAsset(p => ({ ...p, prefix: e.target.value }))} />
                    <span style={{ display: "flex", justifyContent: "end" }}>
                        <span {...getGeneralTooltipProps("Additional terms to help search for the asset")} className="hover-text">Keywords:</span>
                    </span>
                    <input value={selectedAsset.keywords} onChange={(e) => setSelectedAsset(p => ({ ...p, keywords: e.target.value }))} />
                    <div />
                    <button {...getGeneralTooltipProps("Deleting an asset will make it unsearchable, but it may still be available where it was already used.")} onClick={() => handleDelete(selectedAsset.id)} disabled={loading}>
                        Delete {type}
                    </button>
                </div>
            </div>

            <button onClick={onUpdate} disabled={loading}>
                Update
            </button>
            {error2 && <p style={{ margin: 0, color: uiColors.red }}>{error2}</p>}
        </>}

        {fetching ?
            <p className="title-text">Loading...</p> :
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${size}, 1fr))`, gap: "0.5rem", maxWidth: "min(1600px, 100%)" }}>
                {assets.map(({ id, prefix }) =>
                    <div key={id}
                        className={styles.asset}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                        onClick={() => fetchAsset(id)}
                    >
                        <CommunityAsset id={id} type={"sm"} />
                        <span>{prefix}_{id}</span>
                    </div>
                )}
            </div>
        }
    </div>
}

export default function CommunityAssetsPage() {
    const [mode, setMode] = useLocalState("communityAssetsMode", "search");
    const [type, setType] = useLocalState("communityAssetsType", "emote");

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>
            Community Assets
        </h1>
        <span style={{ maxWidth: "1000px", textAlign: "center", display: "block" }}>
            Upload emojis and stickers that can be used with tokens across the site. All uploaded assets are open to use for everyone.
        </span>
        <span className="sub-text">
            Please only upload content you have permission to use. Inappropriate content or misuse of the system may result in upload restrictions.
        </span>
        <span className="sub-text">
            Use search to check for existing assets before uploading new ones.
        </span>

        <div style={{ display: "flex", gap: "1rem" }}>
            <div
                {...getGeneralTooltipProps("Search for existing assets uploaded by the community")}
                className={`tab-header ${mode === "search" ? "active" : ""}`}
                onClick={() => setMode("search")}
            >
                Search
            </div>
            <div
                {...getGeneralTooltipProps("Upload new assets or edit assets you've previously uploaded")}
                className={`tab-header ${mode === "manage" ? "active" : ""}`}
                onClick={() => setMode("manage")}
            >
                Manage
            </div>
        </div>

        {mode === "search" ?
            <span>Browsing assets uploaded by the community</span> :
            <span>Managing uploaded assets</span>
        }

        <div style={{ display: "flex", gap: "1rem" }}>
            <div className={`tab-header ${type === "emote" ? "active" : ""}`} onClick={() => setType("emote")}>Emotes</div>
            <div className={`tab-header ${type === "sticker" ? "active" : ""}`} onClick={() => setType("sticker")}>Stickers</div>
        </div>

        {mode === "search" ?
            <SearchComponent type={type} /> :
            <ManageComponent type={type} />
        }
    </div>
}


