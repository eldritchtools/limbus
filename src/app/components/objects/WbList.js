import { useCallback, useState } from "react";

import styles from "./WbList.module.css";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import AllIdEgoSelector from "../selectors/AllIdEgoSelector";

import { useAuth } from "@/app/database/authProvider";
import { getCompany } from "@/app/database/companies";
import { getLocalStore } from "@/app/database/localDB";
import { bitsetFunctions } from "@/app/lib/bitset";

export function useWbState() {
    const [mode, setMode] = useState("b");
    const [list, setList] = useState([]);
    const [listDisplay, setListDisplay] = useState("mixed");
    const [companyLoading, setCompanyLoading] = useState(false);

    const setState = useCallback((key, vOrFn) => {
        const fn = typeof vOrFn === 'function' ? vOrFn : () => vOrFn;
        switch(key) {
            case "mode": setMode(p => fn(p)); return;
            case "list": setList(p => fn(p)); return;
            case "listDisplay": setListDisplay(p => fn(p)); return;
            case "companyLoading": setCompanyLoading(p => fn(p)); return;
        }
    }, []);

    const updateState = useCallback(newState => {
        if(newState.mode) setMode(newState.mode)
        if(newState.list) setList(newState.list)
        if(newState.listDisplay) setListDisplay(newState.listDisplay)
        if(newState.companyLoading) setCompanyLoading(newState.companyLoading)
    }, []);

    const getSavedState = useCallback(() => ({mode, list, listDisplay}), [mode, list, listDisplay]);

    return { mode, list, listDisplay, companyLoading, setState, updateState, getSavedState };
}

export default function WbList({ wbState }) {
    const {user} = useAuth();
    const [identities, identitiesLoading] = useData("identities_mini");
    const [egos, egosLoading] = useData("identities_mini");

    const applyCompanyData = useCallback(() => {
        if (identitiesLoading || egosLoading) return;
        wbState.setState("companyLoading", true);

        const handleCompany = company => {
            if (!company) return;
            const newValues = [];
            const idMasks = company.identities.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(identities).forEach(([id, identity]) => {
                if (bitsetFunctions.hasFlag(idMasks[identity.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(id);
            });
            const egoMasks = company.egos.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(egos).forEach(([id, ego]) => {
                if (bitsetFunctions.hasFlag(egoMasks[ego.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(id);
            });

            wbState.updateState({mode: "b", list: newValues, companyLoading: false});
        }

        if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }, [identities, identitiesLoading, egos, egosLoading, user, wbState]);

    const listComponent = useMemo(() => {
        if (identitiesLoading || egosLoading) return null;

        const component = (id, i) => {
            if (`${id}`[0] === "1")
                return <div key={i} className={styles.wbComponent} onClick={() => wbState.setState("list", p => p.filter(x => x !== id))}>
                    <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} />
                </div>
            else
                return <div key={i} className={styles.wbComponent} onClick={() => wbState.setState("list", p => p.filter(x => x !== id))}>
                    <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} />
                </div>
        }

        if (wbState.listDisplay === "mixed")
            return <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                {wbState.list.map((x, i) => component(x, i))}
            </div>

        const bySinner = {};
        wbState.list.forEach(x => {
            let sinnerId = `${x}`[0] === "1" ? identities[x].sinnerId : egos[x].sinnerId;
            if (sinnerId in bySinner) bySinner[sinnerId].push(x);
            else bySinner[sinnerId] = [x];
        })

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {Object.entries(bySinner).map(([sinnerId, list]) => <div key={sinnerId} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                    {list.map((x, i) => component(x, i))}
                </div>
            </div>)}
        </div>;
    }, [wbState, identities, egos, identitiesLoading, egosLoading])

    if (identitiesLoading || egosLoading) return null;

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: "1rem", alignSelf: "start", alignItems: "center" }}>
            <span className={`tab-header ${wbState.mode === "b" ? "active" : null}`} onClick={() => wbState.setState("mode", "b")}>Blacklist</span>
            <span className={`tab-header ${wbState.mode === "w" ? "active" : null}`} onClick={() => wbState.setState("mode", "w")}>Whitelist</span>
            <button onClick={() => applyCompanyData()} disabled={wbState.companyLoading}>Apply Company Data</button>
            <button onClick={() => wbState.setState("list", [])}>Clear All</button>
        </div>
        <div className="panel-container" style={{ width: "100%", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>Display:</span>
                <span className={`tab-header ${wbState.listDisplay === "mixed" ? "active" : null}`} onClick={() => wbState.setState("listDisplay", "mixed")}>Mixed</span>
                <span className={`tab-header ${wbState.listDisplay === "sinner" ? "active" : null}`} onClick={() => wbState.setState("listDisplay", "sinner")}>Per Sinner</span>
            </div>
            {listComponent}
        </div>
        <AllIdEgoSelector
            identityIds={wbState.list.filter(x => `${x}`[0] === "1")}
            egoIds={wbState.list.filter(x => `${x}`[0] === "2")}
            setIdentityId={x => wbState.setState("list", p => [...p, x])}
            setEgoId={x => wbState.setState("list", p => [...p, x])}
            identityOptions={identities}
            egoOptions={egos}
        />
    </div>
}