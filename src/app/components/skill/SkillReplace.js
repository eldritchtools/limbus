const mins = [0, 0, 1];
const maxs = [3, 5, 6];

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export default function SkillReplace({ counts, setCounts, editable = false }) {
    const handleChange = (i, v) => {
        const vstr = v === "" ? "0" : v.slice(-1);
        if (isNaN(Number(vstr))) return;

        const vs = [Number(counts[0]), Number(counts[1]), Number(counts[2])];
        let rem = 6;
        vs[i] = clamp(Number(vstr), mins[i], maxs[i]);
        rem -= vs[i];

        for (let ind = 2; ind >= 0; ind--) {
            if (i === ind) continue;
            vs[ind] = clamp(vs[ind], mins[ind], rem);
            rem -= vs[ind];
        }

        if (i !== 2) vs[2] += rem;
        else vs[1] += rem;
        setCounts(vs.map(x => String(x)).join(""));
    }

    return <div style={{ display: "flex", gap: "0.25rem" }}>
        {[0, 1, 2].map(i =>
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", border: "1px #777 solid", borderRadius: "0.5rem", padding: editable ? "0.1rem" : "0.2rem" }}>
                <span>S{i + 1}</span>
                {editable ?
                    <input
                        type="text" inputMode="numeric" min={mins[i]} max={maxs[i]}
                        value={counts[i]} onChange={e => handleChange(i, e.target.value)}
                        onFocus={e => e.target.select()}
                        style={{ textAlign: "center", width: "1ch" }}
                    /> :
                    <span>x{counts[i]}</span>
                }
            </div>
        )}
    </div>
}