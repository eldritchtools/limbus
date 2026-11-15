import { useEffect, useState } from "react";

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function CommentRandomizer({ pool }) {
    const [shuffled, setShuffled] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (pool?.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShuffled(shuffle(pool));
            setIndex(0);
        }
    }, [pool]);

    if (!pool?.length) return null;

    const end = Math.min(index + 10, shuffled.length);
    const messages = shuffled.slice(index, end);

    const next = () => {
        if (index + 10 >= shuffled.length) {
            setShuffled(shuffle(pool));
            setIndex(0);
        } else {
            setIndex(p => p + 10);
        }
    };

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "1600px", alignSelf: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "0.25rem", width: "100%" }}>
            {messages.map((x, i) =>
                <div key={`${index}-${i}`}
                    style={{
                        border: "1px solid var(--primary-border-color)", borderRadius: "0.5rem",
                        padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem"
                    }}
                >
                    <div style={{ fontSize: "0.78rem", opacity: 0.7, fontWeight: "bold" }}>
                        {x.rating !== null && x.rating !== undefined ? `Rating: ${x.rating} / 10` : "No rating"}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", lineHeight: 1.45, maxHeight: "8rem", overflowY: "auto", textAlign: "start" }}>
                        {x.text}
                    </div>
                </div>
            )}
        </div>

        {pool.length > 10 &&
            <button
                className="text-link"
                style={{ background: "transparent", border: "1px solid var(--primary-border-color)", borderRadius: "6px", cursor: "pointer" }}
                onClick={next}
            >
                Draw 10 New Comments
            </button>
        }
    </div>
}