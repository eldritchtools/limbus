'use client';

import { useEffect, useState } from "react";

import { useData } from "./components/DataProvider";
import MarkdownRenderer from "./components/markdown/MarkdownRenderer";
import { useAuth } from "./database/authProvider";

export default function RandomTips({ }) {
    const { profile } = useAuth();
    const [tips, tipsLoading] = useData("nudges");
    const [tipIndex, setTipIndex] = useState(null);
    const [force, setForce] = useState(false);

    useEffect(() => {
        if ((tipsLoading || tipIndex !== null) && !force) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForce(false);

        const checkConditions = conditions => {
            conditions.every(x => {
                if (x === "no-profile-picture") return !profile || !profile.avatar_id;
                return true;
            })
        }

        const options = [];
        const weights = [];
        let totalWeight = 0;

        for (let i = 0; i < tips.length; i++) {
            if (tips[i].conditions && !checkConditions(tips[i].conditions)) continue;

            options.push(i);
            weights.push(tips[i].weight ?? 1);
            totalWeight += tips[i].weight ?? 1;
        }

        while(true) {
            let r = Math.random() * totalWeight;

            for (let i = 0; i < options.length; i++) {
                r -= weights[i];
                if (r <= 0) {
                    if(options[i] === tipIndex) break;
                    setTipIndex(options[i]);
                    return;
                }
            }
        }

    }, [tips, tipsLoading, profile, tipIndex, force]);

    if (tipsLoading || tipIndex === null) return null;

    return <div className="panel-container" style={{width: "100%"}}>
        <h3 style={{ margin: 0, marginBottom: "0.5rem", alignSelf: "start" }}>
            Random Tip&nbsp;
            <button style={{fontSize: "0.7rem"}} onClick={() => {setForce(true)}}>Randomize</button>
        </h3>
        <MarkdownRenderer content={tips[tipIndex].text} />
    </div>
}