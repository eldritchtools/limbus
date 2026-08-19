import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import { SocialIcon, socialsData } from "./userSocials";
import DropdownButton from "../objects/DropdownButton";

import { uiColors } from "@/app/lib/colors";

export default function SocialsEditor({ socials, setSocials }) {
    const socialsOptions = useMemo(() => Object.entries(socialsData).reduce((acc, [k, v]) => { acc[k] = v.label; return acc; }, {}), []);
    
    const addSocial = (value) => {
        setSocials(p => [...p, { type: value, value: "" }]);
    }

    const swapOrder = (i1, i2) => {
        const arr = [...socials];
        [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
        setSocials(arr)
    }

    const handleChange = (index, value) => {
        setSocials(socials.map((social, i) => index === i ? { ...social, value: value } : social));
    }

    const handleRemove = (index) => {
        setSocials(socials.filter((s, i) => index !== i));
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <DropdownButton setValue={addSocial} defaultDisplay={"+ Add Social"} options={socialsOptions} />
        {socials.map((social, i) =>
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <button onClick={() => swapOrder(i, i - 1)} style={{ fontSize: "0.5rem", padding: "1px 3px" }} disabled={i === 0}><FaChevronUp /></button>
                    <button onClick={() => swapOrder(i, i + 1)} style={{ fontSize: "0.5rem", padding: "1px 3px" }} disabled={i === socials.length - 1}><FaChevronDown /></button>
                </div>
                <SocialIcon type={social.type} iconSize={1.5} link={false} />
                <input
                    type="text"
                    value={social.value}
                    onChange={e => handleChange(i, e.target.value)}
                    style={{ borderColor: social.invalid ? uiColors.red : "var(--secondary-border-color)" }}
                    placeholder={socialsData[social.type].placeholder}
                />
                <button onClick={() => handleRemove(i)} style={{ color: uiColors.red, fontWeight: "bold" }}> ✕ </button>
            </div>
        )}
    </div>
}