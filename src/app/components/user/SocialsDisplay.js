import { useState } from "react";
import { FaEllipsisH } from "react-icons/fa";

import { SocialIcon } from "./userSocials";


export default function SocialsDisplay({ socials, expandDirection = "row", align = "center", button = false, expandedDefault = false }) {
    const [expanded, setExpanded] = useState(expandedDefault);

    const style = { display: "flex", gap: "0.5rem" };
    if (expanded && expandDirection === "column") {
        style.flexDirection = "column";
    } else {
        style.flexDirection = "row";
        style.flexWrap = "wrap";
        style.alignItems = "center";
        style.justifyContent = align;
    }

    return <div style={style}>
        {socials.map((social, i) =>
            <div key={i} style={{ display: "flex" }}>
                <SocialIcon
                    type={social.type}
                    value={social.value}
                    includeText={expanded}
                    iconSize={1.25}
                    link={true}
                    button={button}
                />
            </div>)
        }
        {!expanded ?
            <button onClick={() => setExpanded(true)} style={{ border: "none", background: "none", padding: "0" }}>
                <FaEllipsisH />
            </button>
            : null
        }
    </div>
}
