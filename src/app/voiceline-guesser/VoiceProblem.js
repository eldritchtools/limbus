import { useEffect, useRef, useState } from "react";

import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { AUDIO_ROOT } from "../paths";

function getAudioSrc(id) {
    return `${AUDIO_ROOT}/ego/${id}.wav`;
}

export default function VoiceProblem({ problem, showControl }) {
    const contextRef = useRef();
    const bufferRef = useRef();
    const sourceRef = useRef();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const context = new AudioContext();
        contextRef.current = context;

        let cancelled = false;

        async function load() {
            setLoading(true);
            const response = await fetch(getAudioSrc(problem.id));
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            if (!cancelled) {
                bufferRef.current = audioBuffer;
                setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
            sourceRef.current?.stop();
            context.close();
        };
    }, [problem.id]);

    async function play() {
        const context = contextRef.current;
        const buffer = bufferRef.current;

        if (!buffer) return;

        await context.resume();

        // Stop previous playback if necessary
        sourceRef.current?.stop();

        const source = context.createBufferSource();
        source.buffer = buffer;

        // Default output
        let output = source;

        // ----- Modifier -----

        switch (problem.modifier.type) {
            case "speed up":
                source.playbackRate.value = 1.25;
                break;

            case "slow down":
                source.playbackRate.value = 0.8;
                break;

            case "muffle": {
                const filter = context.createBiquadFilter();
                filter.type = "lowpass";
                filter.frequency.value = 1200;

                source.connect(filter);
                output = filter;
                break;
            }

            case "telephone": {
                const filter = context.createBiquadFilter();
                filter.type = "bandpass";
                filter.frequency.value = 1800;
                filter.Q.value = 1;

                source.connect(filter);
                output = filter;
                break;
            }

            // default: no modifier
        }

        output.connect(context.destination);

        source.start(
            0,
            problem.clip.start,
            problem.clip.duration
        );

        sourceRef.current = source;
    }

    return (
        <>
            <button
                onClick={play}
                disabled={loading}
            >
                {loading ? "Loading..." : "▶ Play"}
            </button>

            {showControl && (
                <>
                    <span className="hover-text" {...getGeneralTooltipProps("Some voicelines may be split into multiple shorter clips, so even this full clip may not be complete.")}>Full Clip:</span>

                    <audio
                        controls
                        src={getAudioSrc(problem.id)}
                        preload="auto"
                    />
                </>
            )}
        </>
    );
}