import { useEffect, useState } from "react";

export default function ParticipantGrid({ participants, children }) {
    const [wide, setWide] = useState(false);

    useEffect(() => {
        const update = () => setWide(window.innerWidth >= 1150);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const columns = Math.min(participants.length, wide ? 8 : 4);

    return <div style={{display: "grid", gridTemplateColumns: `repeat(${columns}, 128px)`, justifyContent: "center", gap: "0.5rem 1rem"}}>
        {participants.map((participant, i) => (
            <div key={participant.player_id}>
                {children(participant, i)}
            </div>
        ))}
    </div>;
}