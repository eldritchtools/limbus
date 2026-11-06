export default function ManualTab({ }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", maxWidth: "1600px" }}>
        <span>
            Note: This only serves as a rough explanation of what to do and what&apos;s happening. The manual will be improved later on to give a more comprehensive tutorial.
        </span>

        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Overview
        </span>

        <span>
            The main game loop consists of assigning agents and research subjects to departments, then assigning them a schedule. Each work block correspods to 1 real life hour and the schedule cycles back to the start whenever it finishes.
            <br /> <br />
            When completing work, each block has a good/average/bad result with the probabilities shown in the Facility tab while assigning schedules. This is computed based on the effective work efficiency (WE) of the agent against the WE requirement of the subject.
            <br /> <br />
            The effective WE is computed as the base WE of the agent plus the sum of their offense ratings multiplied by the corresponding defense ratings of the subject. For example, an agent with 5 wrath against a subject with x1.5 defense rating for wrath will get +7.5 WE for the wrath affinity. Do this for all 7 affinities to get the final effective WE of the agent.
            <br /> <br />
            When completing a work block, the agent receives XP and you receive Ahn based on the work result. The agent will also receive HP and SP damage based on the subjects&apos;s stats and the work result. Good results give a 25% bonus in rewards and 25% reduced damage, while bad results give a 50% penalty in rewards and 50% increased damage.
            <br /> <br />
            Agents that hit 0 hp are incapacitated for 24 hours then heal to max hp. Agents that hit -45 sp are panicked for 12 hours then heal to 0 sp. In both cases, agents are unable to work and skip their assigned work schedules. Agents that are not assigned work blocks automatically take breaks. Each break block heals them for 20% of their max hp and 15 sp.
        </span>

        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Agents
        </span>

        <span>
            Agents can be hired in the agents tab. Each one costs an increased amount based on the number of agents you currently have. You can also increase their starting level by spending more Ahn. The max starting level is 3 less than the level of your current highest level agent.
            <br /> <br />
            When hiring agents, 3 randomly generated choices will appear. These are fixed once generated, but can be rerolled for a fee.
            <br /> <br />
            When leveling, agents gain +5 max hp and +3 base WE. They also gain 3 points for you to spend on any offense rating you want.
            <br /> <br />
            Agents can be equipped with a weapon, and armor, and up to 5 gifts. These are obtained by buying them (unlock from leveling subjects) or from expeditions.
        </span>

        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Subjects
        </span>
        
        <span>
            Upon completing a work block, subjects can gain research XP (+2 on good, +1 on average, 0 on bad). This levels up the their research levels. Each research level gives a +1% boost to the effective WE of all agents that work on that subject. Certain subjects will also unlock weapons and armor that you can purchase based on their research level. Different subjects have different max research levels.
        </span>

        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Expeditions
        </span>

        <span>
            Expeditions are your main source of progression. You can spend money to send up to 5 agents on each expedition. They will fight a gauntlet of enemy waves without any healing in the middle. If all agents are incapacitated before all waves are defeated, the expedition ends in failure.
            <br /> <br />
            Expeditions share the same time blocks system as the facility. Each real life hour, all agents will attack all active enemies and vice versa. The total damage dealt to each unit is the sum of the offense ratings of the opposing side multiplied with their corresponding defense ratings, then divided by the number of targets. For example, an agent with 5 wrath offense against two enemies will inflict 2.5 wrath damage to each of them, multiplied by their wrath defenses. If one of the enemies has a x1 defense rating and the other has a x2, then they would deal 2.5 damage to the first and 5 damage to the second. Repeat for all the remaining affinities.
            <br /> <br />
            On a successful expedition, the agents sent on it gain XP. Most expeditions will also have gear they have a chance to drop. Some expeditions may trigger events that require you to choose an option for other potential rewards at the end. Many expeditions will also have first clear rewards which include potentially unlocking new research subjects.
        </span>
    </div>
}