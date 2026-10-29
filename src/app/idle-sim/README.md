# Idle Simulation — Design Document

## Overview

An idle management minigame inspired by *Lobotomy Corporation* and *Limbus Company*.

Players manage a facility containing agents and research subjects. Agents follow repeating work schedules, earning rewards while sustaining damage and recovering during breaks. Players use their earnings to develop their agents, acquire equipment, expand their facility, and send expeditions to obtain new subjects and equipment.

The game progresses in real time, with one simulation tick representing one hour.

Everything outside Section 12 is settled design unless a line is marked **Open:**. Baseline numbers are gathered in Appendix A and are starting points that will be tuned.

## 1. Game Interface

The game is divided into the following tabs, plus a persistent quest panel.

### 1.1 Reports

A history of recent simulation activity. With one tick per hour and offline catch-up, reviewing what happened is the main way players experience the game.

* One report is recorded for every tick. A report with nothing in it means nothing happened.
* A report lists what each agent in a department did (worked on which subject and with what outcome, took a break, or was incapacitated or in panic), the progress of each ongoing expedition, and notable events such as level-ups, recoveries, deaths, and drops.
* Only the latest 200 reports are retained.
* The player chooses how long a period to view, and the screen compiles the data for that interval. Aggregate totals are shown above or beside a timeline that shows a block for each individual result, so the outcomes can be read visually.

### 1.2 Facility

The primary management interface.

Players manage departments, assign agents and subjects, configure work schedules, and build new departments.

### 1.3 Agents

Players view agent stats, assign points, hire new agents, and equip weapons, armor, and E.G.O gifts.

### 1.4 Research Subjects

Lists every subject in the game. For owned subjects it shows the details: stats, research progress, and the equipment each research level unlocks. For subjects the player does not own, it shows how to obtain them.

### 1.5 Inventory

Lists the player's equipment and the equipment that can be unlocked, and is where gear is purchased.

### 1.6 Expedition

Players spend currency to send agents on expeditions consisting of successive enemy encounters.

Expeditions provide agent experience, E.G.O gifts, new subjects, and sometimes events that offer a choice of extra rewards.

### 1.7 Settings

Contains game options, including:

* Permadeath toggle.
* Game reset.
* Other gameplay and interface preferences as needed.

### 1.8 Manual

A static help page in place of an interactive tutorial. It shows the game's real numbers and may embed read-only copies of real display components (a schedule grid, a report timeline, an agent card) with sample data.

### 1.9 Quest Panel

A collapsible panel that stays on screen. See Section 9.

## 2. Facility

Each player owns a single facility containing multiple departments.

* A new player starts with one department.
* Additional departments are built by spending currency, and each costs more than the last. Departments cannot be removed.
* Each department holds up to five agents and four subjects.

Agents and subjects are assigned to departments. Agents can only perform scheduled work on subjects in their own department. An agent belongs to at most one department, and a subject is assigned to at most one department. Assigning one that is already elsewhere moves it, and moving an agent clears their schedule.

An agent who is in no department and not on an expedition rests as if on a break every tick.

### 2.1 Department Schedules

Each department has a repeating schedule divided into one-hour blocks.

For each block, an agent can either:

* Work on one of the subjects assigned to their department.
* Take a break.

The player chooses the schedule's length, from 1 to 48 blocks. Different departments can have different cycle lengths, but all agents within the same department share the same cycle length to prevent their schedules from becoming misaligned.

Each department keeps its own position in its cycle, so adding or removing blocks does not move agents to a different place in the schedule. Shortening a cycle cuts blocks off the end, and lengthening it adds breaks at the end.

Schedules repeat automatically when their cycle completes.

A subject has a maximum number of agents that can work on it in the same block (default 1). The UI enforces this when scheduling, and agents beyond the limit take a break instead.

### 2.2 Simulation Ticks

Everything that happens during a tick is resolved simultaneously.

Whenever a tick occurs:

1. Agents whose incapacitation or panic has run out recover.
2. For each department, determine each agent's scheduled activity and resolve it (work or break), applying rewards, damage, and recovery.
3. Resolve one tick of every ongoing expedition (Section 8).
4. Agents in no department and not on an expedition take a break.
5. Clamp HP and SP, then check for incapacitation, panic, and permadeath.
6. Record the report and advance each department to its next block.

An incapacitated or panicking agent skips their scheduled work and does not recover until the status ends.

Some subjects may have special effects when left unattended. For example, a subject might require continuous work or trigger an effect if it remains idle for too long.

Multiple agents may work on the same subject during a single tick, up to the subject's limit. Each agent resolves their work independently, receiving their own rewards and damage.

### 2.3 Breaches

A potential future feature is subject containment breaches.

A breach triggers combat against the escaped subject. Agents currently on break would be called to fight it.

This feature is not required for the initial version.

## 3. Agents

Agents are characters owned by the player. They can be assigned to facility departments, equipped with gear, and sent on expeditions. An agent is never in a department and on an expedition at the same time.

### 3.1 Agent Stats

Each agent has the following permanent or progression-related stats:

| Stat            | Description                                                      |
| --------------- | ---------------------------------------------------------------- |
| Level           | Determines the agent's progression. The cap starts at 30.        |
| Maximum HP      | The agent's maximum health.                                      |
| Work efficiency | Determines how effectively the agent performs work.              |
| Offense ratings | Seven raw values, one for each sin affinity.                     |
| Unspent points  | Points from leveling that the player can add to offense ratings. |

Each agent also has the following current state:

| State      | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| Current HP | The agent's remaining health, displayed as a whole number rounded up.               |
| Current SP | The agent's current sanity, from -45 to +45, displayed to two decimals. Agents start at +45. |
| Equipment  | The agent's equipped weapon, armor, and E.G.O gifts.                                |
| Status     | Whether the agent is incapacitated and/or in panic, and when each ends (Section 6.5). |

All formulas in this document use an agent's *derived* stats, meaning their base stats with equipment applied (Section 3.4).

### 3.2 Leveling

New agents start at level 1 with 100 maximum HP and 25 work efficiency. Their offense ratings begin at a baseline of 3, with three randomly selected affinities boosted to 5.

Each level-up:

* Increases maximum HP by 5 and current HP by 5.
* Increases work efficiency by 3.
* Grants 3 points that the player can allocate to offense ratings.

The XP needed to go from level L to L+1 is `120 × L^1.15`, rounded. Excess XP carries over, so one gain can grant several levels. The level cap starts at 30 and is intended to be raised later. XP comes from work (Section 6.2) and expeditions (Section 8.3).

### 3.3 Hiring

Hiring is a paid, multi-step flow:

1. The player starts a hire and chooses a starting level, seeing the cost before confirming.
2. The cost is deducted immediately.
3. Three candidates are generated and saved, so leaving and returning does not reroll them. A candidate is a set of offense ratings with three random boosted affinities.
4. The player may pay a small extra cost to reroll the candidates, which is 10% of the base price.
5. The player picks a candidate, who joins unassigned, and the other candidates are discarded.

Only one hire can be in progress at a time.

**Price.** The base price of the next agent is `10,000 × 1.15^(agents currently owned)`, so every agent costs more than the last.

**Catch-up hiring.** A new agent can start above level 1, up to 3 levels below the player's highest-level agent. Starting higher costs 100 currency for every XP skipped, on top of the base price. The extra offense points for the skipped levels (3 per level) are assigned randomly when the candidates are generated, so the player sees the final ratings before choosing. Each point goes to one of the three boosted affinities with 90% probability (split evenly among them) and to one of the other four otherwise. This makes a catch-up agent "good enough" while a hand-leveled agent, who can concentrate points however they like, can be better.

### 3.4 Equipment

Agents have three equipment categories. Weapons and armor are separate item types with separate limits, even where they share a name.

**Weapons**

* One weapon per agent.
* Provide a multiplier for each of the seven affinities, applied to the agent's offense ratings. The default is 1.0, and a weapon may set some affinities to a low value or 0 in exchange for a large boost to others.

**Armor**

* One armor piece per agent.
* Provides a defense multiplier for each of the seven affinities, applied to damage the agent takes.
* An agent without armor has a defense multiplier of 1.0 for every affinity.

**E.G.O Gifts**

* Each agent can equip up to five gifts, and cannot equip two of the same gift.
* Gifts have various effects, such as increased offense or defense, work efficiency, or SP resistance. Not every gift is a flat bonus.

Effects from weapons, armor, and gifts all have the same precedence, and how an effect combines with others depends on its type.

**Corrosion.** Some weapons and armor will carry a panic modifier called corrosion that changes what happens when the wearer panics.

Each copy of an item can be worn by one agent at a time. Gear cannot be changed for agents who are on an expedition or waiting on an event (Section 8.4). Acquisition is described in Section 7.

## 4. Research Subjects

Subjects represent abnormalities, distortions, peccatula, and other entities that can be researched by the player.

| Stat                        | Description                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Work efficiency requirement | The baseline work efficiency needed to obtain favorable results.                                     |
| SP cost                     | The amount of SP damage inflicted on an agent per work block, before the outcome modifier.           |
| Offense ratings             | Seven raw values, one for each sin affinity. Used to calculate HP damage to agents.                  |
| Defense ratings             | Seven multipliers, one for each sin affinity. A higher value makes the subject easier for agents.    |
| Maximum concurrent agents   | The maximum number of agents permitted to work on the subject during a single block. Defaults to 1.  |
| Reward multiplier           | A manual multiplier on payout for subjects with special mechanics. Defaults to 1.                    |
| Maximum research level      | The highest research level. Authored per subject.                                                    |

Subjects may have additional passive effects or special mechanics. These can be introduced as individual subjects are implemented.

Enemies are defined separately from subjects (Section 8.5).

### 4.1 Subject Research Progression

Each subject has a research level, starting at 0, and accumulated research XP. This represents the facility's familiarity with the subject, not a change in the subject's own strength.

Research XP is earned through facility work and depends only on the outcome: good gives 2, average gives 1, and bad gives 0. The XP needed to go from level n to n+1 is `(n + 1) × 25`. Every subject uses this same curve, and subjects differ in their maximum level and in what unlocks at which level, so their difficulty and time horizon come from those numbers.

Increasing a subject's research level:

* Adds 1% per level to the work efficiency multiplier of agents working on the subject (Section 6.1). This value is temporary. Because subjects with a higher maximum level can reach a higher bonus, it also gives long-term subjects more potential.
* Unlocks copies of equipment (Section 7).
* May provide additional unlocks on a case-by-case basis.

Research progression provides a reason to continue working with existing subjects while gradually unlocking additional equipment options.

## 5. Combat and Rating System

Agents, subjects, and enemies use seven sin affinities: wrath, lust, sloth, gluttony, gloom, pride, and envy.

Offense and defense ratings use different representations:

* **Offense:** A raw numerical value, such as 1, 100, or 178.
* **Defense:** A multiplier, such as 0.5, 1.0, or 2.0.

An offense rating of 100 combined with a defense multiplier of 0.5 produces an effective value of 50.

When resolving damage, the attacker's offense rating is multiplied by the target's defense multiplier for the corresponding affinity, and the results are summed across the affinities.

The same general system applies to facility work and expedition combat, although their resolution rules differ. A level-1 agent's total offense against all-1.0 defenses is about 27, a quarter of their maximum HP.

## 6. Facility Work Resolution

When an agent performs scheduled work on a subject, the game determines the outcome, awards rewards, and applies damage.

### 6.1 Work Outcome

The result is one of three outcomes: good, average, or bad. It depends on how the agent's effective work efficiency compares with the subject's requirement, adjusted by the agent's SP and the subject's research level.

```
effective WE = agent work efficiency + Σ (agent offense[i] × subject defense[i])
ratio        = effective WE / subject requirement
               × (1 + SP / 45 × 0.25 + subject research level / 100)
d            = ratio − 1
P(good)      = clamp(0.40 + 1.2 × d, 0, 0.95)
P(bad)       = clamp(0.20 − 1.2 × d, 0, 0.85)
P(average)   = the remainder
```

SP acts as a ±25% modifier to work efficiency at its extremes. Some consequences are intended:

* At ratio 1.0 and 0 SP, the odds are 40% good, 40% average, 20% bad. At +45 SP they are 70/30/0.
* A heavily overpowered agent almost never gets a bad result, and a heavily underpowered agent never gets a good one.
* SP snowballs. Bad results cost more SP, and low SP raises the chance of further bad results. This is intentional, so that over-scheduling is punished.

A new level-1 agent has about 52 effective work efficiency. At level 1, which three affinities were boosted barely matters (about ±4% of work efficiency). Matching agents to subjects becomes a real decision as points concentrate and gear is added.

### 6.2 Rewards

Work grants currency and agent experience. The base amount depends only on the subject, so that payouts are predictable:

```
payout base    = 20 × requirement × defense factor × reward multiplier
defense factor = clamp(1.5 − 0.5 × average subject defense, 0.5, 1.5)
currency       = payout base × outcome multiplier
agent XP       = payout base / 100 × outcome multiplier
```

The defense factor makes subjects with low defenses (harder for every agent) pay more. The outcome multiplier is 1.25 for a good result, 1.0 for average, and 0.5 for bad. A subject with requirement 50 and average defenses pays about 1,000 currency and 10 XP per block.

Subjects also earn research XP (Section 4.1).

### 6.3 Damage

After work, the agent receives HP and SP damage.

* **HP damage:** `Σ (subject offense[i] × agent defense[i])`, then multiplied by the outcome's damage modifier.
* **SP damage:** the subject's SP cost, multiplied by the outcome's damage modifier.

The damage modifier is 0.75 for good, 1.0 for average, and 1.5 for bad.

### 6.4 Breaks

When an agent has a break block, or is not assigned anywhere, they recover 20% of their maximum HP and 15 SP.

Breaks are an important part of schedule management: continuously working may produce more rewards in the short term but leaves agents vulnerable.

The sustainability target is that 6 work blocks and 2 break blocks per 8-hour cycle is sustainable on a subject the agent matches, and unsustainable on one they do not. SP cost is the main difficulty dial. Roughly:

* **3–4:** forgiving.
* **5:** sustainable at 6 of 8 when the agent matches the subject.
* **6:** needs an agent above the requirement or SP gear.
* **7 and above:** needs gear or heavier break schedules (for example 4 work and 4 break), or rotating agents.

Strong gear combinations may make heavier schedules viable.

### 6.5 Incapacitation, Panic, and Death

An agent's HP or SP reaching its limit has different consequences:

* **Incapacitation (HP reaches 0):** the agent is out for 24 ticks. When it ends, their HP is restored to maximum. SP is unaffected.
* **Panic (SP reaches -45):** the agent is out for 12 ticks. When it ends, their SP is set to 0. HP is unaffected.

The two are independent and can overlap. An agent who reaches both limits at once returns to 0 SP after 12 ticks while still incapacitated, then recovers to full HP 12 ticks later.

An agent who is incapacitated or in panic does not work, rest, or recover.

**Permadeath (setting).** When enabled, an agent whose HP reaches 0 is removed permanently instead of being incapacitated. SP collapse still only causes panic.

## 7. Facility Progression and Equipment Acquisition

Players earn currency through facility work and spend it to develop their facility.

Purchases include:

* Hiring agents (Section 3.3).
* Additional departments.
* Weapons, armor, and gifts that are unlocked for purchase.

**Equipment unlocks.** Subjects unlock equipment gradually. Each item lists unlock entries of the form *subject, research level, number of copies*. The number of copies the player may buy is the sum of the copies from every satisfied entry. An item can have entries from several subjects, and a subject can unlock additional copies at several levels. An item with no entries cannot be bought and is obtained only as a drop. An item can also set a hard cap on copies, which is intended for random drops.

**Cost.** Each additional copy of the same item costs more than the previous one: the price of the next copy is the item's base price times a growth factor (1.25 by default) raised to the number of copies already owned.

**Progression loop.** Acquiring new subjects unlocks additional equipment options, and equipment lets agents take on harder subjects and expeditions.

**Prices.** Prices scale to income. Because a level-1 agent earns about 20,000 per day on a subject at the baseline, prices are best thought of in days of income.

## 8. Expeditions

Expeditions let players spend currency to send agents on missions outside the facility.

### 8.1 Structure

An expedition is a series of **waves**. Each wave is a group of enemies that fight at the same time. A wave starts the tick after the previous one is cleared.

* Each expedition has a recommended team size (1 to 5) and a recommended level. The player picks the agents to send (at least 1, at most 5) and pays the cost up front.
* Agents on an expedition must not be in a department, must not be incapacitated or in panic, and cannot already be on another expedition. The player cannot assign them to a department, change their gear, or spend their points until they come back. Several expeditions can run at the same time with different agents.
* Expeditions are gauntlets. There are no breaks between waves, so HP carries over and there is no healing. Expedition agents do not rest.

### 8.2 Simulation

Expeditions run in the same tick loop as the facility, with one tick being one round for everyone involved.

* Each agent splits their damage evenly among the enemies still alive, and each enemy splits its damage evenly among the agents still standing. Damage to a target is the attacker's offense against the target's defense, as in Section 5.
* An agent's damage is scaled by their SP: ±25% at ±45 SP. There is no SP loss per tick unless an enemy's special effect causes it. Enemy damage is not scaled by SP.
* Agents at 0 HP stop fighting, but they are not incapacitated until the expedition ends. They are then handled as in Section 6.5 (incapacitated, or removed with permadeath).
* A wave is cleared when all its enemies are at 0 HP. When the last wave is cleared, the expedition succeeds. If the last agent falls first, it fails. If both happen on the same tick, the clear takes priority.

### 8.3 Rewards

Rewards are granted on a full clear only. A failed expedition gives nothing.

* Experience for every participating agent, including those who fell.
* Random drops, each rolled separately and subject to the item's maximum number of copies.
* **First-clear rewards** work the same way, but are only granted the first time the expedition is cleared. They can include a subject, which is the primary way to acquire additional subjects.
* A chance for an event (Section 8.4).

### 8.4 Events

An expedition can have events, each with a chance of triggering when it is cleared. The chances of the events on one expedition add up to at most 1, and at most one event triggers per clear.

An event waits for the player and never interrupts the expedition itself.

* An event presents a choice of options, each with effects such as currency, agent XP, healing, or equipment drops. Some options have conditions and cannot be chosen if the conditions are not met. The base expedition reward is always given, and event options add to it. Rewards the player should have to choose between belong in the options.
* The agents who went are locked until the player chooses (no gear changes, point spending, or reassignment, and no resting), so options cannot be unlocked by changing gear or waiting.
* After choosing, the event shows the effects that were applied until the player dismisses it. A dropped item that was already at its maximum is shown as not granted. The agents are released as soon as the choice is made.

### 8.5 Enemies

Enemies have their own definitions, separate from subjects. An enemy has a name, maximum HP, offense ratings, and defense ratings. An enemy that appears in several places with different stats gets a separate entry for each, and an enemy that can also be obtained as a subject has its own enemy entry and its own subject entry.

## 9. Quests

Quests are a list of goals with rewards, shown in a persistent, collapsible panel. They guide a new player through the early game and later act as a long-term progression feature.

* A quest has a name, a description, a condition, prerequisite quests, and rewards, which are not limited to currency.
* A quest is shown when its prerequisites have been claimed. The player claims it with a button once its condition is met.
* The introductory quests form a checklist that walks a new player through the basics.
* Long-term quests all require at least the introductory quests. Multi-step goals (for example employing 10, 20, then 30 agents) require the previous step. Quests could also be unlocked by unlocking subjects or expeditions, though the introductory quests are enough for now.

## 10. Settings and Persistence

The game uses real-time hourly ticks and saves player progress.

* **Offline catch-up** simulates the missed ticks, up to a maximum of 168.
* **Saves** persist across sessions, with periodic autosaving (every 5 minutes when there are unsaved changes) and a save after offline catch-up.
* **Local saves** are available for players without an account. They are separate and **cannot be synced to an account**, and the UI warns local players and encourages them to create an account.
* **Time** for account saves comes from the server, so changing the device clock does not gain extra ticks.
* **Integrity.** The save is client-authored, so a player can edit their own save. This only affects them (there are no leaderboards or trading), and protection is deliberately light.
* **Reset** returns the game to its initial state.

**Initial state of a new game.** One department, no agents, the starter subjects at research level 0, and 50,000 currency, enough to hire several agents, set up work, and send a first expedition. The starting content (the starter subjects and the first expedition) is deliberately easier than the baseline numbers in this document, to ease new players in.

## 11. Development Status

**Implemented and tested (core logic):** the tick loop, work resolution, rewards, damage, breaks, incapacitation, panic, permadeath, leveling and research, hiring with catch-up, facility actions, equipment and unlocks, expeditions, events, quests, reports, and saving.

**Remaining:**

1. **User interface** for every tab and the quest panel.
2. **Content:** real expeditions and enemies, events, equipment for the later subjects, and quest text.
3. **The manual.**
4. **The reports interval and timeline view.**
5. **Save migrations**, written when the first update needs one.

## 12. Open Design Questions

* What is the final price of an additional department?

## Appendix A: Baseline Numbers

These are the current starting values. The starting content is easier than these baselines, which apply to the first subjects and expeditions unlocked after it.

| Area                      | Value                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Tick                      | 1 hour, with a maximum of 168 offline ticks                                                |
| Agent at level 1          | 100 HP, 25 work efficiency, offense 3 with three affinities at 5                           |
| Level-up                  | +5 HP, +3 work efficiency, +3 points, level cap 30                                         |
| Agent XP per level        | `120 × L^1.15`                                                                             |
| Research                  | Starts at level 0. XP per level `(n + 1) × 25`, with 2 / 1 / 0 XP per good / average / bad result, +1% work efficiency per level |
| SP range                  | −45 to +45, with a ±25% effect on work efficiency and on expedition damage                 |
| Outcome odds              | 40 / 40 / 20 (good / average / bad) at ratio 1.0 and 0 SP                                  |
| Outcome rewards / damage  | Good ×1.25 / ×0.75, average ×1 / ×1, bad ×0.5 / ×1.5                                       |
| Payout                    | `20 × requirement × defense factor`, with XP at 1/100 of that                              |
| Break recovery            | 20% maximum HP and 15 SP                                                                   |
| Incapacitation            | 24 ticks, then HP restored to maximum                                                      |
| Panic                     | 12 ticks, then SP set to 0                                                                 |
| Schedule                  | 1 to 48 blocks, with 6 work blocks per 8 as the sustainability target                      |
| Department                | 5 agents, 4 subjects                                                                       |
| Agent price               | `10,000 × 1.15^owned`, with a reroll at 10% of that                                        |
| Catch-up hire             | Up to 3 levels below the highest agent, at 100 currency per XP skipped                     |
| Catch-up points           | 90% to the three boosted affinities, 10% to the others                                     |
| Equipment price           | Base price × 1.25 per copy already owned                                                   |
| Gift slots                | 5 per agent                                                                                |
| Expedition                | At most 5 agents                                                                           |
| Reports                   | The latest 200 ticks                                                                       |
| New game                  | 1 department, 0 agents, the starter subjects, 50,000 currency                              |
| Economy                   | About 20,000 currency per day for a level-1 agent on a baseline subject (requirement 50)   |

## Appendix B: Content Authoring Guidelines

Guidelines for writing new subjects, enemies, expeditions, and gear so they fit the baseline. The starting content should be noticeably easier than these.

**Subjects**

* Work efficiency requirement: about 50 for baseline subjects and about 70 for harder ones. For higher levels, see Appendix C.
* A fresh agent has about 52 effective work efficiency, so a requirement within about 40 to 70 is a sensible early range.
* SP cost sets the difficulty tier (Section 6.4). The total of the subject's offense ratings sets HP damage. Both should rise together with the requirement.
* Defense multipliers in the range of 0.75 to 2.0 make some affinities favorable. Higher average defense makes a subject easier and pays less, through the defense factor.
* Use the reward multiplier only for special mechanics.
* Give early subjects a maximum research level of about 5 and later ones 10 or more. A single agent at 6 of 8 earns roughly 26 research XP per day.

**Expeditions and enemies**

* Combat damage is shared between everyone on a side, so enemy offense totals about twice a work subject's (around 10 per attack).
* Each expedition recommends a team size. The target is that a team of that size at the recommended level clears it with a bit over half their HP left, a team one smaller fails or barely clears, and a team one larger clears it comfortably.
* Every event needs at least one option without conditions.

**Equipment**

* A weapon with ×1.5 on an agent's boosted affinities adds roughly 14% to a fresh agent's effective work efficiency, which is a good size for an early weapon.
* Armor at ×0.8 on a subject's main damage type is about the same benefit as getting a good outcome.
* Items that can drop, from expeditions or events, should have a maximum number of copies.

## Appendix C: Content Scaling Guide

A rough guide to how content stats relate to agent growth, to give new content a starting point. These are not rules. Individual subjects, enemies, and gear will deviate from them where their mechanics, effects, or reward multipliers call for it.

Content is described by a **design level T**, the agent level it is built for. Agent growth (Section 3.2) is fixed and applies at every level, so an agent of level T without gear has about `46 + 6T` effective work efficiency, `95 + 5T` HP, and `24 + 3T` total offense.

**Content power factor.** `G(T)` is how much stronger content is than an ungeared, on-level agent, with gear and special subject mechanics expected to make up the difference. Up to about level 30 a reasonable starting value is `G(T) = max(1, (T / 5)^0.25)`, which is 1 through level 5, where no gear is expected, and about 1.6 at level 30. Later content is expected to grow faster as gear multipliers and effects compound.

| Content                              | Rough guide                                                                                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Subject work efficiency requirement  | `(44 + 6T) × G`                                                                                            |
| Subject offense total                | 7% of an on-level agent's maximum HP × G (the HP damage of an average work block)                          |
| Subject SP cost                      | Does not scale with level, since SP and break recovery are fixed. It is a difficulty tier (Section 6.4).   |
| Subject reward multiplier            | Authored on top for special mechanics. It multiplies XP as well as currency.                               |
| Enemy HP, all waves combined         | About 8 ticks of the recommended team's damage, `8 × n × (30 + 3.75T) × G`                                 |
| Enemy offense on the field per tick  | About 5% of the recommended team's combined HP, `0.05 × n × (95 + 5T) × G`                                 |
| Expedition cost                      | `32 × n ×` the requirement, about a fifth of what the team would earn working for the same time           |
| Expedition XP per agent              | `1.8 ×` the requirement                                                                                    |
| Equipment base price                 | Weapon `540 ×` and armor `720 ×` the requirement (about 1.5 and 2 days of one agent's income)            |

Here `n` is the expedition's recommended team size and `T` its recommended level, which set its difficulty.

Example values (expeditions shown for a recommended team of two; they scale in proportion to `n`):

| T   | G    | Requirement | Subject offense | Income per agent-day | Enemy HP | Enemy offense per tick | Expedition cost | Weapon price |
| --- | ---- | ----------- | --------------- | -------------------- | -------- | ---------------------- | --------------- | ------------ |
| 1   | 1.00 | 50          | 7               | 20K                  | 540      | 10                     | 3.2K            | 27K          |
| 10  | 1.19 | 124         | 12              | 49K                  | 1.3K     | 17                     | 7.9K            | 67K          |
| 30  | 1.57 | 351         | 27              | 138K                 | 3.6K     | 38                     | 22K             | 189K         |

**Pacing.** Roughly, a single agent working design-level subjects at 6 work blocks per 8 spends about 3.5 days per level around level 10 and about 4.5 days per level around level 30, which is about 100 days to level 30. Subjects with a reward multiplier level agents faster.