import NoPrefetchLink from "./components/NoPrefetchLink";
import styles from "./FooterNavigation.module.css";

const links = {
    "EXPLORE": [
        ["Team Builds", "/builds"],
        ["Mirror Dungeon Plans", "/md-plans"],
        ["Identities", "/identities"],
        ["E.G.Os", "/egos"],
        ["Community Rankings", "/rankings"]
    ],
    "MIRROR DUNGEONS": [
        ["Gifts", "/gifts"],
        ["Fusion Recipes", "/fusions"],
        ["Theme Packs", "/theme-packs"],
        ["Choice Events", "/md-events"],
        ["Achievements", "/achievements"]
    ],
    "TOOLS": [
        ["Team Solver", "/team-solver"],
        ["Training Calculator", "/training-calc"],
        ["Floor Planner", "/floor-planner"],
        ["Extraction Simulator", "/extraction-simulator"],
        ["Team Randomizer", "/team-randomizer"]
    ],
    "UPDATES/SITE": [
        ["Timers and Roadmap", "/timers"],
        ["About", "/about"],
        ["Manager's Guide", "/guide"],
        ["Feedback/Contact", "/feedback"],
        ["Update History", "/update-history"]
    ]
}

export default function FooterNavigation() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div className={styles.footerLinks}>
            {
                Object.entries(links).map(([header, entries]) =>
                    <div key={header} style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
                        <span style={{ fontWeight: "bold" }}>{header}</span>
                        {entries.map(([label, path]) =>
                            <NoPrefetchLink key={label} href={path} className="text-link">
                                {label}
                            </NoPrefetchLink>
                        )}
                    </div>)
            }
        </div>

        <NoPrefetchLink href={"/support"} className="text-link">
            Support the Site
        </NoPrefetchLink>

        <div style={{display: "flex", gap: "0.5rem"}}>
            <NoPrefetchLink href={"/privacy"} className="text-link">Privacy Policy</NoPrefetchLink>
            •
            <NoPrefetchLink href={"/terms"} className="text-link">Terms of Service</NoPrefetchLink>
        </div>
    </div>
}