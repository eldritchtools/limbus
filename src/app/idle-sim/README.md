# Idle Simulation — Design Document

## Overview

An idle management minigame inspired by *Lobotomy Corporation* and *Limbus Company*.

Players manage a facility containing agents and research subjects. Agents follow repeating work schedules, earning rewards while sustaining damage and recovering during breaks. Players use their earnings to develop their agents, acquire equipment, expand their facility, and send expeditions to obtain new subjects and equipment.

The game progresses in real time, with one simulation tick representing one hour.

This document describes the planned mechanics. Details marked as undecided can be determined during implementation.

## 1. Game Interface

The game is divided into four main tabs.

### 1.1 Reports

An optional history of recent simulation activity.

* Display a summary of what happened during each tick or group of ticks.
* Retain only the latest configurable number of entries.
* Record relevant events such as work results, rewards, incapacitations, and expedition progress.

Besides providing feedback to players, this history may support future mechanics that depend on recent events.

### 1.2 Facility

The primary management interface.

Players manage departments, assign agents and subjects, configure work schedules, and develop their facility.

### 1.3 Agents

Players view agent stats, assign points, equip weapons and armor, manage E.G.O gifts, and handle recruitment.

### 1.4 Expedition

Players spend currency to send agents on expeditions consisting of successive enemy encounters.

Expeditions provide agent experience, E.G.O gifts, and new subjects.

### 1.5 Settings

Contains game options, including:

* Permadeath toggle.
* Game reset.
* Other gameplay and interface preferences as needed.

## 2. Facility

Each player owns a single facility containing multiple departments.

* A new player starts with one department.
* Additional departments can be unlocked by spending currency.
* Department expansion may also be limited by progression or future updates.
* Each department holds up to five agents and four subjects.

Agents and subjects are assigned to departments. Agents can only perform scheduled work on subjects in their own department.

### 2.1 Department Schedules

Each department has a repeating schedule divided into one-hour blocks.

For each block, an agent can either:

* Work on one of the subjects assigned to their department.
* Take a break.

The player chooses the schedule's length. Different departments can have different cycle lengths, but all agents within the same department share the same cycle length to prevent their schedules from becoming misaligned.

Schedule lengths should support both short management cycles and convenient daily routines. Candidate lengths include 6, 8, 12, and 24 hours.

Schedules repeat automatically when their cycle completes.

### 2.2 Simulation Ticks

Whenever a tick occurs:

1. Determine the current scheduled activity for each agent in every department.
2. Resolve all scheduled work.
3. Apply rewards, damage, recovery, and other resulting effects.
4. Advance the schedules to their next blocks.
5. Record relevant events for the reports history.

The simulation then waits until the next tick.

An incapacitated agent skips their scheduled work.

An agent without scheduled work takes a break and recovers HP and SP.

Some subjects may have special effects when left unattended. For example, a subject might require continuous work scheduled or trigger an effect if it remains idle for too long.

Multiple agents may work on the same subject during a single tick, subject to the subject's maximum concurrent agent limit.

Each agent resolves their work independently, receiving their own rewards and damage. Subject-specific effects may introduce different interactions in the future.

### 2.3 Breaches

A potential future feature is subject containment breaches.

A breach triggers combat against the escaped subject. Agents currently on break would be called to fight it.

This feature is not required for the initial version.

## 3. Agents

Agents are characters owned by the player. They can be assigned to facility departments, equipped with gear, and sent on expeditions.

### 3.1 Agent Stats

Each agent has the following permanent or progression-related stats:

| Stat            | Description                                         |
| --------------- | --------------------------------------------------- |
| Level           | Determines the agent's progression.                 |
| Maximum HP      | The agent's maximum health.                         |
| Work efficiency | Determines how effectively the agent performs work. |
| Offense ratings | Seven raw values, one for each sin affinity.        |

Each agent also has the following current state:

| State          | Description                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| Current HP     | The agent's remaining health.                                                |
| Current SP     | The agent's current sanity, ranging from -45 to +45.                         |
| Equipment      | The agent's equipped weapon, armor, and E.G.O gifts.                         |
| Incapacitation | Whether the agent is currently unable to work and, if so, when they recover. |

### 3.2 Hiring and Leveling

New agents start at level 1 with default maximum HP (100) and work efficiency (25).

Their offense ratings begin at a baseline (3), with three randomly selected affinities receiving a boost (5).

The hiring system may present the player with three candidates, each with a different randomized affinity distribution, from which they choose one to recruit. This is the preferred direction, pending implementation.

Each level-up:

* Increases maximum HP by 5.
* Increases work efficiency by 3.
* Grants 3 points that the player can allocate to offense ratings.

### 3.3 Equipment

Agents have three equipment categories.

**Weapons**

* One weapon per agent.
* Provide multipliers to offense ratings.

**Armor**

* One armor piece per agent.
* Provides defense ratings for the seven sin affinities.
* An agent without armor has a defense multiplier of 1.0 for every affinity.

**E.G.O Gifts**

* Each agent can equip up to five gifts.
* Gifts provide various effects, such as increased offense or defense ratings, SP resistance, and other bonuses.

Equipment acquisition and progression are described in the relevant facility and expedition sections.

## 4. Research Subjects

Subjects represent abnormalities, distortions, peccatula, and other entities that can be researched or encountered by the player.

Each subject has the following stats:

| Stat                        | Description                                                                                        |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| Maximum HP                  | The subject's maximum health.                                                                      |
| SP cost                     | The amount of SP damage inflicted on an agent when work is performed.                              |
| Work efficiency requirement | The baseline work efficiency needed to obtain favorable results.                                   |
| Offense ratings             | Seven raw values, one for each sin affinity.                                                       |
| Defense ratings             | Seven multipliers, one for each sin affinity.                                                      |
| Maximum concurrent agents   | The maximum number of agents permitted to work on the subject during a single tick. Defaults to 1. |

An active subject also tracks its current HP.

Subjects may have additional passive effects or special mechanics, including effects triggered by being left unattended. These can be introduced as individual subjects are implemented.

### 4.1 Subject Research Progression

Each subject has a research level and accumulated research XP. This represents the facility's familiarity with the subject, not a change in the subject's own level or inherent strength.

Research XP is earned through facility work. Work outcomes may grant different amounts of XP, with the exact values to be determined.

Increasing a subject's research level:

* Provides a small bonus to work success probabilities.
* Unlocks equipment associated with the subject at specified research levels.
* May provide additional unlocks on a case-by-case basis.

Research progression provides a reason to continue working with existing subjects while gradually unlocking additional equipment options.

Exact XP requirements, bonuses, and unlock conditions remain to be determined.

## 5. Combat and Rating System

Both agents and subjects use seven sin affinities.

Offense and defense ratings use different representations:

* **Offense:** A raw numerical value, such as 1, 100, or 178.
* **Defense:** A multiplier, such as 0.5, 1.0, or 2.0.

An offense rating of 100 combined with a defense multiplier of 0.5 produces an effective value of 50.

When resolving damage, the attacker's offense rating is multiplied by the target's defense multiplier for the corresponding affinity.

The same general system applies to facility work and expedition combat, although their resolution rules differ.

## 6. Facility Work Resolution

When an agent performs scheduled work on a subject, the game determines the outcome, awards rewards, and applies damage.

### 6.1 Work Outcome

The result is classified as one of three outcomes:

* Good.
* Average.
* Bad.

The outcome is based on the relationship between the agent's work efficiency and the subject's work efficiency requirement.

The calculation also considers:

* The agent's offense ratings.
* The subject's defense ratings.
* The agent's current SP.

For each affinity, the agent's offense rating is multiplied by the subject's defense multiplier. The resulting values contribute bonuses to the agent's effective work efficiency.

The agent's SP modifies the final outcome probabilities. Positive SP provides a bonus, while negative SP imposes a penalty.

The exact formula and probability thresholds remain undecided.

### 6.2 Rewards

Work grants currency and agent experience.

The outcome affects the rewards:

* Good results provide a 25% bonus to rewards and deal 25% reduced HP and SP damage.
* Average results provide no bonus to rewards or damage.
* Bad results provide a 50% reduction to rewards and deal 50% additional damage.

Exact reward amounts and scaling remain undecided.

### 6.3 Damage

After work, the agent receives HP and SP damage.

**HP damage**

* Based on the subject's offense ratings multiplied by the agent's defense multipliers.
* Bad results deal more damage than average or good results.

**SP damage**

* Based on the subject's SP cost.
* Modified by the work outcome if appropriate.

The precise damage formulas remain undecided.

### 6.4 Breaks

When an agent has no scheduled work during a block, they recover HP and SP.

Breaks are an important part of schedule management: continuously working may produce more rewards in the short term but leave agents vulnerable to incapacitation.

The amount of HP and SP restored per break remains undecided.

### 6.5 Incapacitation

An agent becomes incapacitated when either:

* Their HP reaches 0.
* Their SP reaches -45.

An incapacitated agent cannot perform work for a set duration. Once recovered, the agent returns with full HP and 45 SP.

The default incapacitation duration is tentatively 24 hours.

A permadeath setting may allow agents who reach 0 HP to be permanently removed instead of incapacitated.

The interaction between permadeath and SP-based incapacitation should be defined during implementation.

## 7. Facility Progression and Equipment Acquisition

Players earn currency through facility work and spend it to develop their facility.

Potential purchases include:

* Hiring agents.
* Additional departments.
* Weapons.
* Armor.
* Other upgrades introduced later.

The available weapons and armor depend on the subjects currently present in the player's facility, as well as other progression requirements.

This creates a progression loop in which acquiring new subjects unlocks additional equipment options.

The exact shop inventory, prices, and unlock conditions remain undecided.

## 8. Expeditions

Expeditions let players spend currency to send agents on missions outside the facility.

### 8.1 Structure

An expedition consists of a series of enemy encounters.

Enemies use the same general stats as research subjects, including offense and defense ratings.

During combat:

* Agents and enemies deal damage to each other.
* Damage is calculated using offense ratings and the target's defense multipliers.
* Combat continues until one side is defeated.

If the agents survive an encounter, they advance to the next one.

The expedition ends when the agents are defeated or the final encounter is cleared.

### 8.2 Duration and Simulation

The exact simulation model is undecided.

Two possible approaches are being considered:

**Complete simulation**

* The entire expedition is simulated and resolved at once.
* Results are presented after the simulation finishes.

**Tick-based simulation**

* Expeditions progress over successive simulation ticks.
* Players can observe progress over time.
* An expedition can fail before reaching its final encounter.

The approach should be chosen during implementation based on how much interaction and visibility expeditions need.

### 8.3 Rewards

Clearing an expedition grants:

* Experience for participating agents.
* Random E.G.O gift drops drawn from the expedition's reward pool.

The first successful clear of an expedition also grants its associated research subject.

This is the primary way to acquire additional subjects beyond the initial subjects available to the player.

## 9. Settings and Persistence

The game uses real-time hourly ticks and saves player progress.

The simulation should support:

* Persistent progress across sessions.
* Offline catch-up, subject to a maximum number of simulated ticks.
* Periodic autosaving and immediate saves when needed.
* A local-save option for players who are not using account-based saves.
* Resetting the game to its initial state.

The exact settings available to players can expand as new mechanics are added.

## 10. Initial Development Priorities

The initial implementation should focus on a small, playable version rather than introducing every planned feature at once.

A suggested order is:

1. **Core simulation:** Complete the tick loop, persistence, and schedule advancement.
2. **Basic facility:** Support one department, agents, subjects, and repeating schedules.
3. **Work resolution:** Implement outcome probabilities, rewards, damage, breaks, and incapacitation.
4. **Progression:** Add currency, experience, leveling, subject research experience, and offense point allocation.
5. **Equipment:** Add weapons, armor, and their stat effects.
6. **Expeditions:** Implement encounters, combat, and rewards.
7. **Expansion:** Add additional departments, more subjects, and more equipment.
8. **Optional features:** Add reports, breaches, cooperative work assignments, and other mechanics as appropriate.

This order is provisional and can be adjusted as implementation reveals dependencies between systems.

## 11. Open Design Questions

The following details do not need to be finalized before development begins.

* What are the starting stats and stat growth rates for agents?
* How are offense points distributed across affinities?
* What exact formulas determine work outcomes and their probabilities?
* How much HP and SP damage does work inflict?
* How much HP and SP do agents recover during breaks?
* How are currency and experience rewards calculated?
* How long does incapacitation last?
* How should permadeath interact with incapacitation?
* What determines equipment availability and pricing?
* How does expedition combat progress, and how long does an expedition take?
* How much recent history should Reports retain?
* What additional subject-specific mechanics should be introduced?

These questions should be answered as the corresponding systems are implemented, rather than blocking work on the core simulation.
