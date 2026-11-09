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

Welcome manager! Your job is to hire agents, assign them to departments, schedule work with research subjects, and deploy teams on expeditions to recover equipment and new subjects.

#### How Time Works
* The game progresses in real time. Exactly **1 real-life hour = 1 simulation tick**.
* Your facility continues running while you are offline. When you return, the game simulates any missed hours up to a maximum of **168 hours** (7 days).

#### Currency (Ahn)
Ahn is your primary resource. You earn Ahn whenever agents complete work blocks in the facility. Ahn is spent to recruit agents, purchase equipment copies, expand your facility with new departments, and fund expeditions.
`
    },

    facility: {
        guide: `
### Facility & Schedules

Your facility is divided into departments. Each department holds up to **5 agents** and **4 research subjects**. Agents can only work on subjects assigned to their own department.

#### Scheduling Work Cycles
* Each department runs on an independent repeating cycle from **1 to 48 hours (blocks)**. When a cycle reaches its end, it automatically loops back to block 1.
* In each block, an agent can either be assigned to **Work** on a specific subject, or take a **Break**.

#### Break Recovery & Idle Agents
Agents cannot work continuously without breaking down. Taking a break block restores **20% of Maximum HP** and **15 SP**. 

Agents not assigned to any department and not deployed on an expedition rest automatically on every tick, recovering health and sanity at the standard break rate.

#### Scheduling Strategy & Sustainability
* **Case-by-Case Pacing:** A schedule of 6 work blocks and 2 break blocks per 8 hours is a good baseline, but it is not universal. Some subjects may have unusually high offense ratings (inflicting heavy HP damage) or unique passive conditions that will shred an agent's health regardless of how low the subject's SP cost is. Adjust your break ratios based on both HP damage and SP cost.
* **Shift Cycling:** Agents do not need to be locked to a single subject. Rather than having one agent hog a punishing subject and quickly burn out, you can schedule multiple agents to alternate shifts on the difficult subject while working on safer subjects during their off-hours.
`
    },

    work: {
        guide: `
### Work & Success Rates

Completing a work block yields rewards for your facility and agents, while inflicting damage on the working agent:

#### Rewards Earned
* **Ahn:** Currency added to your facility funds, scaling with the subject's difficulty.
* **Agent XP:** Experience granted to the working agent toward their next level.
* **Research XP:** Familiarity experience granted to the subject toward its next research level.

#### Damage Taken
* **HP Damage:** Physical damage dealt to the agent based on the subject's offense ratings, mitigated by the agent's defense ratings.
* **SP Damage:** Sanity damage dealt to the agent based on the subject's SP cost.

---

#### Outcome Modifiers
Every work block resolves as a **Good**, **Average**, or **Bad** outcome, modifying those baseline earnings and damage:
* **Good:** $+25\\%$ Ahn, $+25\\%$ Agent XP, agent takes $25\\%$ less damage, and the subject gains $+2$ Research XP.
* **Average:** Standard Ahn and XP, standard damage, $+1$ Research XP.
* **Bad:** $-50\\%$ Ahn, $-50\\%$ Agent XP, agent takes $+50\\%$ more damage, and $+0$ Research XP.

#### What Determines Your Success Rate?
Your success rate is determined by comparing your agent's **Effective Work Efficiency (WE)** against the subject's **WE Requirement**.

1. **Offense Ratings Add to Work Efficiency:** An agent's Effective WE is not just their base efficiency—**their Offense ratings directly provide bonus Work Efficiency**. Each point of offense is multiplied by the subject's defense multiplier for that affinity:
   * If an agent has 10 {kw:wrath} Offense, and the subject has $\\times 1.5$ {kw:wrath} Defense, that affinity grants **+15 bonus WE**.
   * If an agent has 10 {kw:sloth} Offense against a subject with $\\times 0.5$ {kw:sloth} Defense, it only grants **+5 bonus WE**.
2. **Sanity (SP) Snowball:** Sanity ranges from $-45$ to $+45$. High Sanity provides up to a **+25% bonus** to your final work efficiency ratio. Stressed agents (low SP) suffer up to a **-25% penalty**, which leads to more bad outcomes, higher damage, and further SP loss.
3. **Research Familiarity:** Each level of research on a subject grants a permanent **+1% work efficiency bonus** to any agent working on it.
`,
        formula: `
#### Work Resolution Formulas

**1. Effective Work Efficiency (WE)**
$$ \\text{Effective WE} = \\text{Base WE} + \\sum_{i=1}^7 (\\text{Agent Offense}_i \\times \\text{Subject Defense}_i) $$

**2. Efficiency Ratio & Outcome Probabilities**
$$ \\text{Ratio} = \\frac{\\text{Effective WE}}{\\text{Requirement}} \\times \\left(1 + \\frac{\\text{SP}}{45} \\times 0.25 + \\frac{\\text{Research Level}}{100}\\right) $$
$$ d = \\text{Ratio} - 1 $$

$$ P(\\text{Good}) = \\text{clamp}(0.40 + 1.2 \\cdot d, \\, 0, \\, 0.95) $$
$$ P(\\text{Bad}) = \\text{clamp}(0.20 - 1.2 \\cdot d, \\, 0, \\, 0.85) $$
$$ P(\\text{Average}) = 1 - P(\\text{Good}) - P(\\text{Bad}) $$

**3. Rewards & Damage**
$$ \\text{Defense Factor} = \\text{clamp}(1.5 - 0.5 \\times \\text{Avg Subject Defense}, \\, 0.5, \\, 1.5) $$
$$ \\text{Base Payout} = 20 \\times \\text{Requirement} \\times \\text{Defense Factor} \\times \\text{Reward Multiplier} $$
$$ \\text{Agent XP} = \\frac{\\text{Base Payout}}{100} \\times \\text{Outcome Multiplier} $$

$$ \\text{HP Damage} = \\sum_{i=1}^7 (\\text{Subject Offense}_i \\times \\text{Agent Defense}_i) \\times \\text{Outcome Damage Mult} $$
$$ \\text{SP Damage} = \\text{Subject SP Cost} \\times \\text{Outcome Damage Mult} $$
`
    },

    agents: {
        guide: `
### Agents & Progression

Agents carry out department schedules and fight in expeditions.

#### Leveling Up
Agents gain experience from completing work and expeditions. When an agent levels up:
* Maximum HP increases by **+5** (and restores 5 current HP).
* Base Work Efficiency increases by **+3**.
* You receive **3 stat points** to allocate freely to any sin offense affinity.

#### Hiring Agents
* Hiring costs increase based on how many agents you currently own.
* Each recruitment generates 3 random candidates. Candidates begin with three randomly boosted affinities (starting at 5 instead of 3). You can reroll candidates for 10% of the hire price.
* **Catch-up Hiring:** You can hire agents starting above Level 1 (up to 3 levels below your highest-leveled agent) by paying extra Ahn for the skipped experience. Points for skipped levels are pre-allocated randomly (90% weighted toward boosted affinities).

#### Incapacitation & Panic
* **Incapacitation (0 HP):** An agent whose HP drops to 0 is knocked out for **24 ticks (hours)**, restoring to full HP upon recovery.
* **Panic (-45 SP):** An agent whose sanity collapses to -45 panics for **12 ticks (hours)**, restoring to 0 SP upon recovery.
* While incapacitated or panicked, an agent skips all work and breaks.
* **Permadeath:** If enabled in Settings, agents reaching 0 HP die permanently instead of becoming incapacitated.
`,
        formula: `
#### Agent Progression Formulas

$$ \\text{XP Required for Level } L + 1 = \\text{round}(120 \\times L^{1.15}) $$
*(Level cap: 30)*

$$ \\text{Base Hire Cost} = 10{,}000 \\times 1.15^N \\quad (N = \\text{currently owned agents}) $$
$$ \\text{Reroll Cost} = \\text{Base Hire Cost} \\times 0.10 $$
$$ \\text{Catch-up Surcharge} = \\text{Skipped XP} \\times 100\\text{ Ahn} $$
`
    },

    gear: {
        guide: `
### Equipment & Unlocks

Agents can equip three categories of equipment:
1. **Weapons (1 per agent):** Provide multipliers for each of the 7 sin affinities, scaling the agent's base offense ratings.
2. **Armor (1 per agent):** Provide defense multipliers against incoming damage. Without armor, an agent takes baseline $\\times 1.0$ damage across all affinities.
3. **E.G.O Gifts (Up to 5 per agent):** Provide flat stat boosts, resistances, or combat effects. Gifts occupy a dynamic list of up to 5 items—they do not have rigid fixed slots, and equipping pushes into the next available slot.

#### Acquiring Gear
* **Subject Research:** Raising a subject's research level unlocks purchase limits for weapons and armor in the Inventory tab.
* **Expedition Drops:** Many weapons, armor, and gifts drop as rare rewards from expeditions.
* Each copy of an item can only be worn by one agent at a time.
`,
        formula: `
#### Equipment Cost Growth

$$ \\text{Price of Copy } (N + 1) = \\text{Base Price} \\times 1.25^N \\quad (N = \\text{currently owned copies}) $$
`
    },

    subjects: {
        guide: `
### Research Subjects

Subjects are abnormalities, peccatula, and distortions studied in your facility. Working with them yields Ahn, agent XP, and research progress.

#### Research Levels
Every work block awards Research XP to the subject (+2 for Good, +1 for Average, 0 for Bad).

Increasing a subject's research level provides two permanent facility benefits:
1. **Familiarity Bonus:** Grants a permanent **+1% Work Efficiency bonus** per research level to all agents working on that subject.
2. **Equipment Unlocks:** Unlocks purchase limits for weapons and armor associated with that subject in the Inventory tab.
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

Expeditions let you deploy a team of 1 to 5 agents outside the facility to battle through enemy waves.

#### Combat Mechanics
* Combat resolves in the same hourly tick loop as the facility.
* **Gauntlet:** There is no healing between waves; agents do not take breaks and HP carries over from wave to wave.
* **Damage Distribution:** Damage is split evenly among opposing targets. Your agents divide their combined damage across all living enemies, and enemies divide their damage across all surviving agents.
* **Sanity in Combat:** Agent damage scales with Sanity. High SP (+45) increases combat damage dealt by up to **+25%**, while low SP (-45) reduces damage dealt by up to **-25%**. Enemy damage does not scale with SP.

#### Outcomes
* **Clear:** Defeating all enemy waves completes the expedition, awarding participating agents XP, item drop chances, and first-clear bonuses (such as unlocking new research subjects).
* **Failure:** Occurs if all agents reach 0 HP or if the expedition reaches 48 hours. Failed expeditions grant no rewards.
* **Events:** Certain expeditions can trigger events upon clearing, presenting choices that can grant additional equipment or rewards.
`,
        formula: `
#### Expedition Combat Formulas

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
        setShowFormulas(false); // Reset formula toggle when switching topics
    };

    const currentContent = SECTION_CONTENT[selectedSection];

    return (
        <div className={styles.tile} style={{
            flexDirection: "row",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1000px",
            minHeight: "550px",
            gap: "1rem",
            padding: "0.75rem",
            boxSizing: "border-box"
        }}>
            {/* Left Column: Topic List */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
                width: "220px",
                minWidth: "220px",
                borderRight: "1px var(--primary-border-color) solid",
                paddingRight: "0.5rem"
            }}>
                <span style={{ fontWeight: "bold", fontSize: "1.1rem", padding: "0.2rem 0.4rem", marginBottom: "0.2rem" }}>
                    Manual Index
                </span>

                {SECTIONS.map(sec => {
                    const isSelected = selectedSection === sec.id;
                    return (
                        <div
                            key={sec.id}
                            className={styles.clickableTile}
                            style={{
                                alignItems: "flex-start",
                                padding: "0.5rem 0.6rem",
                                background: isSelected ? "var(--bg-hover)" : undefined,
                                borderColor: isSelected ? "var(--secondary-border-color)" : undefined
                            }}
                            onClick={() => handleSelectSection(sec.id)}
                        >
                            <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{sec.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Right Column: Guide Content & Optional Formula Drawer */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "0 0.5rem",
                maxHeight: "750px",
                overflowY: "auto",
                overflowX: "hidden",
                lineHeight: "1.5"
            }}>
                {/* Main Tutorial / Handbook Text */}
                <MarkdownRenderer content={currentContent.guide} />

                {/* Optional Expandable Formula Section */}
                {currentContent.formula && (
                    <div style={{
                        marginTop: "1.2rem",
                        borderTop: "1px var(--primary-border-color) solid",
                        paddingTop: "0.75rem",
                        paddingBottom: "1rem"
                    }}>
                        <button
                            onClick={() => setShowFormulas(prev => !prev)}
                            style={{
                                padding: "0.4rem 1rem",
                                cursor: "pointer",
                                fontSize: "0.9rem"
                            }}
                        >
                            {showFormulas ? "Hide Formulas & Math ▲" : "Show Formulas & Math ▼"}
                        </button>

                        {showFormulas && (
                            <div style={{ marginTop: "0.75rem" }}>
                                <MarkdownRenderer content={currentContent.formula} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}