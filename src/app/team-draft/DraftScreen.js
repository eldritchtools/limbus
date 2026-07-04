import { useState } from "react";

import styles from "./DraftScreen.module.css";
import BuildDisplay from "../components/build/BuildDisplay";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import RarityIcon from "../components/icons/RarityIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import HintText from "../components/objects/HintText";
import { uiColors } from "../lib/colors";
import { egoRanks } from "../lib/constants";
import { constructTeamCode } from "../lib/teamCodeEncoding";

function Identity({ identity, sinnerId }) {
    if (!identity)
        return <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SinnerIcon num={sinnerId} style={{ width: "75%", height: "75%", pointerEvents: "none" }} />
        </div>

    return <div style={{ position: "relative", width: "100%" }}>
        <IdentityIcon id={identity} displayName={true} displayRarity={true} style={{ borderRadius: "0.5rem", pointerEvents: "none" }} uptie={4} />
    </div>
}

function Ego({ ego, rank }) {
    if (!ego)
        return <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
            <RarityIcon rarity={rank} alt={true} style={{ width: "18%", height: "auto", pointerEvents: "none" }} />
        </div>

    return <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "4/1" }}>
        <EgoIcon id={ego} type={"awaken"} banner={true} displayName={true} displayRarity={false} style={{ borderRadius: "0.5rem", pointerEvents: "none" }} />
    </div>
}

function Timer({ draft, settings }) {
    const remaining = Math.max(0, draft.endTime - draft.now);
    const percent = remaining / (settings.choiceTime * 1000);
    const urgency = percent < 0.2 ? styles.critical : percent < 0.4 ? styles.warning : null;

    return <div className={`${styles.timer} ${urgency}`}>
        <div className={styles.timerHeader}>
            <span>Time Left: </span>
            <span key={draft.timer} className={`${styles.timerSeconds} ${urgency}`}>{(remaining / 1000).toFixed(2)}s</span>
        </div>
        <div className={styles.timerTrack}>
            <div className={`${styles.timerFill} ${urgency}`} style={{ width: `${percent * 100}%` }} />
        </div>
    </div>
}

export default function DraftScreen({ draft, settings }) {
    const [hintText, setHintText] = useState(null);

    const handleTeamCodeCopy = async () => {
        const code = constructTeamCode(draft.identities, draft.egos);
        
        try {
            await navigator.clipboard.writeText(code);
            setHintText('Copied!');
            setTimeout(() => setHintText(null), 1500);
        } catch (err) {
            setHintText('Failed to copy!');
            setTimeout(() => setHintText(null), 1500);
            console.error('Failed to copy text: ', err);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>{draft.phase === "finished" ? "Completed" : "Current"} Team</h1>

        <BuildDisplay
            identityIds={draft.identities}
            egoIds={draft.egos}
            displayType={"ego-comp"}
        />

        {draft.phase !== "finished" &&
            <span style={{ fontSize: "1.2rem" }}>Round {draft.round}/{settings.rounds}</span>
        }

        {draft.phase === "waiting" &&
            <button onClick={draft.beginCountdown}>Ready!</button>
        }

        {draft.phase === "countdown" && <>
            <div className={styles.countdown}>
                <span key={draft.countdown}>{draft.countdown}</span>
            </div>
            <span style={{ fontSize: "2rem" }}>Get Ready!</span>
        </>
        }

        {(draft.phase === "choosing" || draft.phase === "transition") &&
            <>
                {settings.choiceTime !== 0 && <Timer draft={draft} settings={settings} />}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "1200px", justifyContent: "center" }}>
                    {draft.choices.map((choice, i) =>
                        <div key={i}
                            className={`${styles.option}`}
                            onClick={() => draft.choose(i)}
                            style={{
                                border: draft.chosen === i ? `2px solid ${uiColors.green}` : "1px solid var(--primary-border-color)",
                                background: draft.chosen === i ? "var(--bg-hover)" : null
                            }}
                        >
                            <Identity identity={choice[0]} />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {Array.from({ length: 5 }, (_, rank) =>
                                    <Ego
                                        key={rank}
                                        ego={choice[rank + 1]}
                                        rank={egoRanks[rank]}
                                    />)}
                            </div>
                        </div>
                    )}
                </div>
            </>
        }

        {draft.phase === "finished" &&
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={draft.returnToSetup}>Back to Setup</button>
                <button onClick={draft.startDraft}>Draft again</button>
                <HintText hintText={hintText}>
                    <button onClick={handleTeamCodeCopy}>Copy Team Code</button>
                </HintText>
            </div>
        }
    </div>
}
