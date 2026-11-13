import React, { useState } from "react";

import styles from "./idleSim.module.css";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";

const SECTIONS = [
    { id: "overview", title: "Overview & Time" },
    { id: "facility", title: "Facility & Schedules" },
    { id: "work", title: "Work & Success Rates" },
    { id: "agents", title: "Agents & Progression" },
    { id: "gear", title: "Equipment & Unlocks" },
    { id: "subjects", title: "Research Subjects" },
    { id: "expeditions", title: "Expeditions & Combat" }
];

const SECTION_CONTENT = {
    overview: {
        guide: `
### Overview & Time

#### Simulation Ticks
* Time progresses in real time: **1 real life hour = 1 simulation tick**.
* Missed ticks are simulated upon login up to a maximum of **168 ticks (7 days)**.

#### Ahn (Currency)
Ahn is the game's primary currency. It is earned by completing work on research subjects in departments, and is spent on:
* Hiring agents.
* Constructing new departments.
* Purchasing unlocked equipment.
* Dispatching expeditions.
`
    },

    facility: {
        guide: `
### Facility & Schedules

#### Departments
* The facility starts with 1 department and can be expanded by purchasing additional departments with Ahn.
* Each department holds up to **5 agents** and **4 research subjects**.
* Agents can only be assigned to work on subjects located within their own department.

#### Schedules
* Each department operates on an independent repeating cycle of **1 to 48 hour blocks**.
* For each block, an agent can be set to **Work** on an assigned subject or take a **Break**.

#### Breaks & Idle Recovery
* Scheduled breaks restore **20% of Maximum HP** and **15 SP**.
* Agents unassigned to any department (and not on an expedition) rest automatically every tick, recovering at the standard break rate.
`
    },

    work: {
        guide: `
### Work Resolution

When an agent completes a scheduled work block on a research subject, they earn rewards while sustaining damage:
* **Ahn & Agent XP:** Payouts scale based on the subject's WE requirement and overall defenses.
* **Research XP:** Contributes toward unlocking the subject's next research level.
* **HP Damage:** Physical damage dealt by the subject's offense ratings, mitigated by the agent's defense multipliers.
* **SP Damage:** Sanity damage inflicted based on the subject's flat SP cost.

#### Outcome Modifiers
Every work block concludes with one of three outcomes, scaling baseline rewards and damage:
* **Good:** $\\times 1.25$ Ahn, $\\times 1.25$ Agent XP, $\\times 0.75$ damage taken, and $+2$ Research XP.
* **Average:** Baseline rewards and damage taken, and $+1$ Research XP.
* **Bad:** $\\times 0.5$ Ahn, $\\times 0.5$ Agent XP, $\\times 1.5$ damage taken, and $+0$ Research XP.

#### Determining Success
Outcome probabilities depend on comparing the agent's **Effective Work Efficiency (WE)** against the subject's **WE Requirement**. An agent's effective WE is their base WE modified by the following factors:
* The agent's offense ratings contribute bonus WE. For each affinity, the agent's corresponding offense rating is multiplied by the subject's defense multiplier, then is added to their WE.
* The agent's current SP modifies the final WE by up to $\\pm 25\\%$ ($+25\\%$ at $+45$ SP and $-25\\%$ at $-45$ SP)
* Each research level on the subject permanently adds $+1\\%$ to the final WE for any agent working on it.
`,
        formula: `
#### Work Resolution Formulas

**Effective Work Efficiency (WE)**
$$ \\text{Effective WE} = \\text{Base WE} + \\sum_{i=1}^7 (\\text{Agent Offense}_i \\times \\text{Subject Defense}_i) $$

**Efficiency Ratio & Outcome Probabilities**
$$ \\text{Ratio} = \\frac{\\text{Effective WE}}{\\text{Requirement}} \\times \\left(1 + \\frac{\\text{SP}}{45} \\times 0.25 + \\frac{\\text{Research Level}}{100}\\right) $$
$$ d = \\text{Ratio} - 1 $$

$$ P(\\text{Good}) = \\text{clamp}(0.40 + 1.2 \\cdot d, \\, 0, \\, 0.95) $$
$$ P(\\text{Bad}) = \\text{clamp}(0.20 - 1.2 \\cdot d, \\, 0, \\, 0.85) $$
$$ P(\\text{Average}) = 1 - P(\\text{Good}) - P(\\text{Bad}) $$

**Rewards & Damage**
$$ \\text{Defense Factor} = \\text{clamp}(1.5 - 0.5 \\times \\text{Avg Subject Defense}, \\, 0.5, \\, 1.5) $$
$$ \\text{Base Payout} = 20 \\times \\text{WE Requirement} \\times \\text{Defense Factor} \\times \\text{Reward Multiplier} $$
$$ \\text{Ahn} = \\text{Base Payout} \\times \\text{Outcome Multiplier} $$
$$ \\text{Agent XP} = \\frac{\\text{Base Payout}}{100} \\times \\text{Outcome Multiplier} $$

$$ \\text{HP Damage} = \\sum_{i=1}^7 (\\text{Subject Offense}_i \\times \\text{Agent Defense}_i) \\times \\text{Outcome Damage Mult} $$
$$ \\text{SP Damage} = \\text{Subject SP Cost} \\times \\text{Outcome Damage Mult} $$
`
    },

    agents: {
        guide: `
### Agents

#### Stats & Leveling
Agents gain XP from work and expeditions. Leveling up grants:
* **+5 Maximum HP** (and restores 5 HP).
* **+3 Work Efficiency**.
* **3 Stat Points** to allocate to offense ratings.

#### Hiring
* Base hiring cost increases per agent owned.
* Each recruitment generates 3 candidates with 3 randomly boosted affinities (starting at 5 instead of 3). Rerolls cost 10% of the base hire price.
* Agents can be hired at a higher starting level (up to 3 levels below the player's highest level agent) by paying Ahn for the skipped xp. Skipped stat points are randomly distributed (90% to boosted affinities, 10% to others).

#### Incapacitation, Panic & Permadeath
* **Incapacitation (0 HP):** 24-tick lockout. Restored to maximum HP upon recovery.
* **Panic (-45 SP):** 12-tick lockout. Restored to 0 SP upon recovery.
* Incapacitated and panicked agents skip all scheduled work and breaks.
* **Permadeath:** Setting toggle. When enabled, agents whose HP reaches 0 are permanently deleted instead of incapacitated.
`,
        formula: `
#### Agent Progression Formulas

**XP Required for Level L + 1**
$$ \\text{Level} < 30: \\text{round}(50 \\times (L - 0.7)^{1.4}) $$
$$ \\text{Level} \\ge 30: \\text{round}(120 \\times (L - 0.7)^{1.15}) $$

$$ \\text{Base Hire Cost} = 10{,}000 \\times 1.15^N \\quad (N = \\text{currently owned agents}) $$
$$ \\text{Reroll Cost} = \\text{Base Hire Cost} \\times 0.10 $$
$$ \\text{Catch-up Surcharge} = \\text{Skipped XP} \\times 100\\text{ Ahn} $$
`
    },

    gear: {
        guide: `
### Equipment

Agents have three equipment categories:
* **Weapons (1 per agent):** Apply multipliers to the agent's base offense ratings across the seven affinities.
* **Armor (1 per agent):** Set defense multipliers against incoming damage. Agents without armor take baseline $\\times 1.0$ damage across all affinities.
* **E.G.O Gifts (Up to 5 per agent):** Provide passive effects, stat bonuses, or other unique effects. Duplicate gifts cannot be equipped on the same agent.

#### Purchasing & Limits
* Raising a subject's research level unlocks purchase limits for its associated weapons and armor in the Inventory.
* Certain gear and gifts are drop only from expeditions.
* Each purchased copy can be equipped by one agent at a time. The cost of each additional copy increases per copy owned.
`,
        formula: `
#### Equipment Cost Growth

$$ \\text{Price of Copy } (N + 1) = \\text{Base Price} \\times 1.25^N \\quad (N = \\text{currently owned copies}) $$
`
    },

    subjects: {
        guide: `
### Research Subjects

Subjects represent abnormalities and other entities housed in departments. 

#### Subject Stats
* **Work Efficiency Requirement:** The baseline WE needed for favorable outcomes.
* **SP Cost:** Base sanity damage inflicted per work block.
* **Offense Ratings:** Affinity values used to calculate HP damage dealt to agents.
* **Defense Multipliers:** Multipliers that modify agent offense into bonus Work Efficiency.

#### Research Progression
Completing work awards Research XP to the subject (+2 for Good, +1 for Average, 0 for Bad).

Advancing a subject's research level provides:
* Permanent **+1% Work Efficiency** per research level to any agent working on that subject.
* Unlocks purchase limits for weapons and armor in the Inventory tab.
`,
        formula: `
#### Subject Research Progression

$$ \\text{Research XP to Level } (L + 1) = (L + 1) \\times 25 $$
$$ \\text{Research Efficiency Bonus} = +1\\% \\times \\text{Research Level} $$
`
    },

    expeditions: {
        guide: `
### Expeditions & Combat

Expeditions dispatch teams of 1 to 5 agents outside the facility to fight gauntlets of enemies.

#### Costs
Launching an expedition costs a **Base Fee** plus a **Per Agent Fee**.

#### Combat Rules
* Combat resolves in the same 1-hour tick loop as the facility.
* HP carries over between waves. Deployed agents do not rest or heal between waves.
* Damage is split evenly among opposing targets. All agents split their combined damage across all enemies, and all enemies split their damage across all agents.
* Agent damage is scaled by SP by up to $\\pm 25\\%$ (at $+45$ and $-45$ SP). Enemy damage is not scaled by SP.

#### Resolution & Events
* **Clear:** Defeating all waves completes the expedition. Successful clears award XP to all participating agents, random item drops, and first clear bonuses.
* **Failure:** An expedition fails if all agents hit 0 HP or if combat reaches **48 ticks (hours)**. Failed expeditions grant no rewards.
* **Events:** Certain expeditions can trigger an event upon clearing. Option conditions are evaluated at the moment the expedition ends based on the team's state. Claiming rewards can be done at any time on the Expeditions Tab.
`,
        formula: `
#### Expedition Formulas

**Dispatch Cost**
$$ \\text{Total Cost} = \\text{Base Fee} + (\\text{Per Agent Fee} \\times \\text{Agents Deployed}) $$

**Agent Damage Dealt to Enemy**
$$ \\text{Damage to Enemy} = \\frac{\\sum_{i=1}^7 (\\text{Agent Offense}_i \\times \\text{SP Mult} \\times \\text{Enemy Defense}_i)}{\\text{Number of Living Enemies}} $$

where:
$$ \\text{SP Mult} = 1 + \\left(\\frac{\\text{SP}}{45} \\times 0.25\\right) $$

**Enemy Damage Dealt to Agent**
$$ \\text{Damage to Agent} = \\frac{\\sum_{i=1}^7 (\\text{Enemy Offense}_i \\times \\text{Agent Defense}_i)}{\\text{Number of Standing Agents}} $$

*(Timeout: Missions automatically fail after **48 ticks**)*
`
    }
};

export default function ManualTab() {
    const [selectedSection, setSelectedSection] = useState("overview");
    const [showFormulas, setShowFormulas] = useState(false);

    const handleSelectSection = (id) => {
        setSelectedSection(id);
        setShowFormulas(false);
    };

    const currentContent = SECTION_CONTENT[selectedSection];

    return <div className={styles.tile} style={{
        flexDirection: "row", alignItems: "stretch", width: "100%", maxWidth: "1000px", minHeight: "550px",
        gap: "1rem", padding: "0.75rem", boxSizing: "border-box"
    }}>
        <div style={{
            display: "flex", flexDirection: "column", gap: "0.3rem", width: "220px", minWidth: "220px",
            borderRight: "1px var(--primary-border-color) solid", paddingRight: "0.5rem"
        }}>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem", padding: "0.2rem 0.4rem", marginBottom: "0.2rem" }}>
                Index
            </span>

            {SECTIONS.map(sec => {
                const isSelected = selectedSection === sec.id;
                return <div key={sec.id} className={styles.clickableTile}
                    style={{
                        alignItems: "flex-start", padding: "0.5rem 0.6rem",
                        background: isSelected ? "var(--bg-hover)" : undefined,
                        borderColor: isSelected ? "var(--secondary-border-color)" : undefined
                    }}
                    onClick={() => handleSelectSection(sec.id)}
                >
                    <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{sec.title}</span>
                </div>;
            })}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 0.5rem", lineHeight: "1.5" }}>
            <MarkdownRenderer content={currentContent.guide} />

            {currentContent.formula && (
                <div style={{ marginTop: "1.2rem", borderTop: "1px var(--primary-border-color) solid", paddingTop: "0.75rem", paddingBottom: "1rem" }}>
                    <button onClick={() => setShowFormulas(prev => !prev)} style={{ cursor: "pointer", fontSize: "0.9rem" }}>
                        {showFormulas ? "Hide Formulas & Math ▲" : "Show Formulas & Math ▼"}
                    </button>

                    {showFormulas && <div style={{ marginTop: "0.75rem" }}>
                        <MarkdownRenderer content={currentContent.formula} />
                    </div>}
                </div>
            )}
        </div>
    </div>
}