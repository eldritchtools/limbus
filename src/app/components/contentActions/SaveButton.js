import { useEffect, useMemo, useState } from "react";

import ActionTemplate from "./ActionTemplate";
import { SaveOutline, SaveSolid } from "./Symbols";

import { useAuth } from "@/app/database/authProvider";
import { isLocalId, localStores } from "@/app/database/localDB";
import { useRequestsCache } from "@/app/database/RequestsCacheProvider";

function NormalSaveButton({ targetType, targetId, type = "button", iconSize, shortText = false }) {
    const { checkSaved, toggleSave, fetchUserData } = useRequestsCache();
    const [loading, setLoading] = useState(false);

    useEffect(() => fetchUserData(targetType, [targetId]), [fetchUserData, targetType, targetId]);
    const saved = useMemo(() => checkSaved(targetType, targetId), [checkSaved, targetType, targetId]);
    const text = shortText ? "" : saved ? "Saved" : `Save`;

    const handleClick = async () => {
        setLoading(true);
        await toggleSave(targetType, targetId);
        setLoading(false);
    };

    return <ActionTemplate type={type} active={saved} disabled={loading} onClick={handleClick}>
        {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
    </ActionTemplate>
}

function LocalSaveButton({ targetType, targetId, type = "button", iconSize, shortText = false }) {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const text = shortText ? "" : (saved ? "Saved" : "Save");

    const store = useMemo(() => {
        switch (targetType) {
            case "build": return localStores["savedBuilds"];
            case "collection": return localStores["savedCollections"];
            case "md_plan": return localStores["savedMdPlans"];
            default: return null;
        }
    }, [targetType]);

    useEffect(() => {
        const fetchSaved = async () => {
            setSaved(await store.get(targetId) !== undefined);
        }
        fetchSaved();
    }, [store, targetId]);

    if (isLocalId(targetId)) return null;

    const handleClick = async () => {
        setLoading(true);
        if (saved) {
            await store.remove(targetId);
            setSaved(false);
        } else {
            await store.save({ id: targetId });
            setSaved(true);
        }
        setLoading(false);
    };

    return <ActionTemplate type={type} active={saved} disabled={loading} onClick={handleClick}>
        {saved ? <SaveSolid text={text} size={iconSize} /> : <SaveOutline text={text} size={iconSize} />}
    </ActionTemplate>
}

export default function SaveButton({ ...params }) {
    const { user } = useAuth();
    if (!user) return <LocalSaveButton {...params} />;
    else return <NormalSaveButton {...params} />
}
