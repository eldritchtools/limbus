import React, { useEffect, useRef, useState } from "react";

import ParticipantGrid from "./ParticipantsDisplay";
import ScenarioDisplay from "./ScenarioDisplay";
import { calculateSkillRange } from "./util";
import Icon from "../components/icons/Icon";
import SkillIcon from "../components/icons/SkillIcon";
import NamePill from "../components/objects/NamePill";
import { getClashArenaSkillTooltipProps } from "../components/tooltips/ClashArenaSkillTooltip";
import { uiColors } from "../lib/colors";
import { AUDIO_ROOT } from "../paths";

function useCoinSound() {
    const context = useRef(null);
    const buffer = useRef(null);
    const gain = useRef(null);

    useEffect(() => {
        const audioContext = new AudioContext();
        context.current = audioContext;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.25;
        gainNode.connect(audioContext.destination);
        gain.current = gainNode;

        fetch(`${AUDIO_ROOT}/coin.wav`)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(decoded => {
                buffer.current = decoded;
            });

        return () => audioContext.close();
    }, []);

    return useCallback(() => {
        if (!buffer.current) return;

        if (context.current.state === "suspended") {
            context.current.resume();
        }

        const source = context.current.createBufferSource();
        source.buffer = buffer.current;
        source.connect(gain.current);
        source.start();
    }, []);
}

export default function RoundRevealScreen({ clashBattle }) {
    const playCoinSound = useCoinSound();
    const [completed, setCompleted] = useState(new Set());

    const handleComplete = useCallback(playerId => {
        setCompleted(previous => {
            const next = new Set(previous);
            next.add(playerId);
            return next;
        });
    }, []);

    const allComplete = completed.size === clashBattle.participants.length;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Current Scenario</span>
        <ScenarioDisplay round={clashBattle.round} />

        <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>Results</span>
        <ParticipantGrid participants={clashBattle.participants}>
            {x => {
                const roundScore = clashBattle.results[x.player_id].points;
                const result = clashBattle.results[x.player_id];
                const skillData = clashBattle.clashingData[result.identity_id][result.skill];
                return <div key={x.player_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ wordWrap: "break-word", overflowWrap: "break-word", textAlign: "center" }}>
                        {x.display_name}
                    </span>
                    {
                        allComplete ?
                            <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "center" }}>
                                Score: {x.score} (<span style={{ color: roundScore ? uiColors.green : "#777" }}>{`+${roundScore}`}</span>)
                            </span> :
                            <span style={{ fontSize: "1.25rem", fontWeight: "bold", textAlign: "center" }}>
                                Score: {x.score - roundScore}
                            </span>
                    }
                    <div key={`${x.player_id}-skill`}
                        style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}
                        {...getClashArenaSkillTooltipProps(result.identity_id, result.skill, clashBattle.round)}
                    >
                        <SkillIcon skillData={skillData} />
                        <div style={{ alignSelf: "start", maxWidth: "85%", paddingRight: "2rem", boxSizing: "border-box" }}>
                            <NamePill name={skillData.name} affinity={skillData.affinity} />
                        </div>

                        <ClashResult
                            result={result}
                            skillData={skillData}
                            round={clashBattle.round}
                            playCoinSound={playCoinSound}
                            onComplete={() => handleComplete(x.player_id)}
                        />
                    </div>
                </div>
            }}
        </ParticipantGrid>

        {allComplete && (
            clashBattle.isHost ?
            <span className="text-link" onClick={clashBattle.nextRound}
                style={{ fontSize: "1.2rem", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
                {clashBattle.roundNumber === clashBattle.settings.rounds ? "End Game" : "Next Round"}
            </span> :
            <span>
                Waiting for host to continue to the next round...
            </span>
        )}


    </div >
}

function ClashResult({ result, skillData, round, playCoinSound, onComplete }) {
    const [revealed, setRevealed] = useState(0);
    const [value, setValue] = useState(null);

    const { base: baseValue, coin: coinValue } = calculateSkillRange(skillData, round.self, round.target);

    useEffect(() => {
        setValue(baseValue);

        const timer = setTimeout(() => { setRevealed(1); }, 500 + Math.random() * 1000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (revealed === 0) return;

        const coin = result.coins[revealed - 1];

        if (coin) {
            setValue(value => Math.max(value + coinValue, 0));
            playCoinSound();
        }

        if (revealed === result.coins.length) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => { setRevealed(value => value + 1); }, 250 + Math.random() * 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revealed]);

    return <>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{revealed === result.coins.length ? result.clash_value : value}</div>

        <div style={{ display: "flex", alignItems: "center" }}>
            {result.coins.map((heads, i) =>
                <Icon key={i} path="coin"
                    style={{ width: 24, height: 24, filter: i < revealed ? (heads ? "brightness(1.5)" : "brightness(0.5)") : "brightness(1)" }}
                />
            )}
        </div>
    </>;
}