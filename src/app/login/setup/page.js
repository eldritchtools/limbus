'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/database/authProvider';
import { localStores } from '@/app/database/localDB';
import { useRequestsCache } from '@/app/database/RequestsCacheProvider';
import { insertBuild } from '@/app/database/builds';
import { createMdPlan } from '@/app/database/mdPlans';
import { insertCollection } from '@/app/database/collections';

export default function UsernameSetup() {
    const router = useRouter();
    const { user, profile, loading, updateUsername, refreshProfile } = useAuth();
    const { toggleSave } = useRequestsCache();

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [localData, setLocalData] = useState({});
    const [syncs, setSyncs] = useState([]);

    const [syncDone, setSyncDone] = useState(false);
    const [localLoading, setLocalLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchLocal = async () => {
        const entries = await Promise.all(
            Object.entries(localStores).map(async ([name, store]) => {
                const data = await store.getAll();
                return data.length ? [name, data] : null;
            })
        );

        setLocalData(Object.fromEntries(entries.filter(Boolean)));
        setSyncs(entries.filter(Boolean).map(([name]) => name));
        setLocalLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLocal();
    }, []);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading user...</p>;
    }

    if (!user) {
        router.replace('/login');
        return null;
    }

    const handleSubmitUsername = async (e) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        setSubmitting(true);

        const { error } = await updateUsername(user.id, username);

        setSubmitting(false);

        if (error) {
            if (error.code === '23505') setError('That username is already taken.');
            else setError(error.message);
            return;
        }

        await refreshProfile();
    };

    if (!profile.username) {
        return <main style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Set up your username</h2>
            <form onSubmit={handleSubmitUsername}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Continue'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>;
    }

    if (localLoading) {
        return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Checking for local data...</p>;
    }

    if (!syncDone && Object.keys(localData).length > 0) {
        const handleSync = async () => {
            setSyncing(true);
            setError("");

            let failed = false;

            if (syncs.includes("builds")) {
                for (const build of localData["builds"]) {
                    try {
                        const data = await insertBuild({
                            userId: user.id,
                            title: build.title,
                            body: build.body,
                            identityIds: build.identity_ids,
                            egoIds: build.egoIds,
                            keywordIds: build.keyword_ids,
                            deploymentOrder: build.deployment_order,
                            activeSinners: build.active_sinners,
                            teamCode: build.team_code,
                            youtubeVideoId: build.youtube_video_id,
                            tags: build.tags,
                            extraOpts: build.extra_opts,
                            blockDiscovery: build.block_discovery,
                            published: false
                        });
                        if (data) await localStores["builds"].remove(build.id);
                    } catch (err) {
                        setError("Failed to sync a build, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            if (syncs.includes("savedBuilds")) {
                for (const save of localData["savedBuilds"]) {
                    try {
                        await toggleSave("build", save.id)
                        await localStores["savedBuilds"].remove(save.id);
                    } catch (err) {
                        setError("Failed to sync a saved build, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            if (syncs.includes("collections")) {
                for (const collection of localData["collections"]) {
                    try {
                        const trimmedItems = collection.items.map(({ type, data, note, submitted_by }) => {
                            const result = { target_type: type, target_id: data.id, note };
                            if (submitted_by) result.submitted_by = submitted_by;
                            return result;
                        });
                        const data = await insertCollection({
                            title: collection.title,
                            body: collection.body,
                            shortDesc: collection.short_desc,
                            submissionMode: "closed",
                            published: false,
                            blockDiscovery: collection.block_discovery,
                            items: trimmedItems,
                            tags: collection.tags
                        });
                        if (data) await localStores["collection"].remove(collection.id);
                    } catch (err) {
                        setError("Failed to sync a collection, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            if (syncs.includes("savedCollections")) {
                for (const save of localData["savedCollections"]) {
                    try {
                        await toggleSave("collection", save.id)
                        await localStores["savedCollections"].remove(save.id);
                    } catch (err) {
                        setError("Failed to sync a saved collection, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            if (syncs.includes("mdPlans")) {
                for (const plan of localData["mdPlans"]) {
                    try {
                        const data = await createMdPlan({
                            title: plan.title,
                            body: plan.body,
                            recommendationMode: plan.recommendation_mode,
                            difficulty: plan.difficulty,
                            identityIds: plan.identity_ids,
                            egoIds: plan.ego_ids,
                            graceLevels: plan.grace_levels,
                            cost: plan.cost,
                            keywordId: plan.keyword_id,
                            startGiftIds: plan.start_gift_ids,
                            observeGiftIds: plan.observe_gift_ids,
                            targetGiftIds: plan.target_gift_ids,
                            floors: plan.floors,
                            youtubeVideoId: plan.youtube_video_id,
                            published: plan.is_published,
                            blockDiscovery: plan.block_discovery,
                            buildIds: plan.builds.map(build => build.id),
                            tags: plan.tags
                        });
                        if (data) await localStores["mdPlans"].remove(plan.id);
                    } catch (err) {
                        setError("Failed to sync an md plan, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            if (syncs.includes("savedMdPlans")) {
                for (const save of localData["savedMdPlans"]) {
                    try {
                        await toggleSave("md_plan", save.id);
                        await localStores["savedMdPlans"].remove(save.id);
                    } catch (err) {
                        setError("Failed to sync a saved md plan, try again or cancel syncing.");
                        setSyncing(false);
                        failed = true;
                        break;
                    }
                }
            }

            setSyncing(false);
            if (failed) await fetchLocal();
            else setSyncDone(true);
        }

        const labelMapping = {
            "builds": "Builds",
            "savedBuilds": "Saved Builds",
            "collections": "Collections",
            "savedCollections": "Saved Collections",
            "mdPlans": "MD Plans",
            "savedMdPlans": "Saved MD Plans"
        }

        return <main style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: 'center', marginTop: '3rem' }}>
            <span style={{ fontSize: "1.2rem" }}>
                Local data was found on your device. Would you like to sync them to your account?
                <br />
                Unsynced data cannot be accessed while logged in.
                <br /><br />
                Choose what data to sync:
            </span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.2rem" }}>
                {
                    Object.entries(labelMapping)
                        .filter(([name]) => name in localData)
                        .map(([name, label]) => <label key={name}>
                            <input type="checkbox" checked={syncs[name]} onChange={e => setSyncs(p => {
                                if (e.target.checked) return [...p, name];
                                else return p.filter(x => x !== name)
                            })} />
                            {label}
                        </label>)
                }
            </div>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
                <button onClick={handleSync} disabled={syncing}>
                    Sync Data
                </button>
                <button onClick={() => setSyncDone(true)} disabled={syncing}>
                    Don&apos;t Sync
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </main>;
    }

    router.replace("/");
    return null;
}
