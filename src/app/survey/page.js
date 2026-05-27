"use client";

export default function SurveyPage() {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>
        <h2 style={{margin: 0}}>Survey Results</h2>
        <span>
            Hi! This page just shows the partial results of the survey in case people are curious. There are also a some concerns that came up repeatedly among a few responders that I want to address.
        </span>

        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem"}}>
            <h3 style={{margin: 0}}>Clashing/Damage Calculations</h3>
            <span>
                There were quite a few mentions of the clashing/damage calculations on skills being too low and/or wanting a damage calculator on the site.
                <br/> <br/>
                The reason for the low numbers is explained a bit in the clashing and damage calculator in team builds, but I neglected to explain it more thoroughly on the numbers displayed on skills, which is 100% my bad.
                <br/> <br/>
                If you want to read the explanation of how the calculations work, you can read it below. Otherwise you can skip to the tl;dr.
                <br/> <br/>
                Basically, the main reason for the low numbers is because they do not consider passives and statuses gained or inflicted by the identities. They only considered the raw numbers and conditionals on the skills themselves. I purposely excluded passives and statuses because I felt it was difficult to pinpoint the &quot;optimal&quot; situations to consider due to how complex the interactions can be between some passives and skills. This would lead the computations to become more opinionated rather than exact since I&apos;d end up having to choose what effects make sense to include and not to include. As many people have noticed, this led to a worse problem, where a lot of the numbers feel way too low.
                <br/> <br/>
                With this most recent update, I&apos;ve included many passives and statuses in the computations (though they always assume max uptie for now). While not perfect, the new numbers should feel closer to what people expect. However I&apos;ve run into another problem that makes implementing this a lot more difficult. The numbers on the site aren&apos;t calculated on a spreadsheet then copied over as most people would expect. Instead, I manually take down the different effects on each skill, coin, and passive (like +x% damage, +x coin power, etc) then the site computes the numbers on the fly, essentially simulating the skill. This lets me support all the different features on the calculator on the team builds pages (e.g. computing based on uptie, avg roll based on sp, custom target resists, turning conditionals on and off) instead of only giving one number. My implementation of the calculator though is fairly limited and some of the more complex passives have become very difficult to implement properly into the calculator. A rewrite may eventually be needed if I want more accurate numbers, but that is currently not a priority.
                <br/> <br/>
                <strong>TL;DR</strong> - Some improvements have been made to the computations, but they&apos;re still not perfect due to limitations on how the site computes the numbers.
                <br/> <br/>
                Regarding people looking for the damage calculator. Hi, yes, there is one in the team builds page if you check the Display Type button. There is no standalone one for now though, but that might be something I could make in the future.
            </span>
        </div>

        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem"}}>
            <h3 style={{margin: 0}}>Passives</h3>
            <span>
                Some people have been asking for an easier way to look for passives when team building. Currently, the best way (at least on the site) is to turn on the Advanced Compare Mode option in the Identities/E.G.Os pages. Swap the &quot;Target&quot; to passives, then it will let you search for passives based on their descriptions or sort and filter them based on costs.
                <br/> <br/>
                I&apos;m currently thinking of ways to more easily view them on the edit build page itself, but that will still take some time (if I can even come up with a good method).
            </span>
        </div>

        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem"}}>
            <h3 style={{margin: 0}}>Searching/Filtering Identities or E.G.Os</h3>
            <span>
                This is similar to the previous concern, but more on stats like resists or more comprehensive filter options that are in the main pages but not in other parts of the site (like when editing a build). With this update, I&apos;ve added the main ones to the selection menu that&apos;s used on the editor and most other tools on the site. This does not include the Company page, I&apos;ll get to that later on.
            </span>
        </div>

        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem"}}>
            <h3 style={{margin: 0}}>Ads</h3>
            <span>
                A lot of people are (understandably and justifiably) worried about the ads question. I just wanna say don&apos;t worry. I&apos;m not going to do any of those aggressive ad placements. I hate those too. If I end up implementing them, I&apos;ll make sure they&apos;re pretty minimal, and I&apos;m keeping that option to turn them off.
            </span>
        </div>

        <h3 style={{margin: 0}}>Partial Results as of 2026/05/27</h3>
        <span className="sub-text">Sorry for the formatting. This is just a quick and dirty version for now since it&apos;s just partial results.</span>
        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column"}}>
            <h3 style={{margin: 0}}>Site Usage</h3>
            <span>
                Which of these main features or pages do you use regularly (at least once every so often or when the game updates) or have found useful at least once or twice?
            </span>
            <span>Team Builds - 64%</span>
            <span>MD Plans - 54%</span>
            <span>Collections - 18%</span>
            <span>Community Ranking and Reviews - 34%</span>
            <span>Identity/E.G.O Pages - 76%</span>
            <span>Encounters Page - 40%</span>
            <span>Timers and Roadmap Page - 56%</span>
            <span>MD Achievement Tracker - 30%</span>
            <span>MD Reference Pages - 70%</span>
            <span>Daily Randomized Team - 4%</span>
            <span>Dispense and Training Calculator - 30%</span>
            <span>Team Solver - 30%</span>
            <span>Team Randomizer - 6%</span>
            <span>Floor Planner - 48%</span>
            <br/>
            <span>Which of these secondary features do you use regularly (at least once every so often or when the game updates) or have found useful at least once or twice?</span>
            <span>Tokens - 28%</span>
            <span>Display Type - 42%</span>
            <span>Tracking Mode for MD Plans - 28%</span>
            <span>Reviewers Tab - 20%</span>
            <span>Review Bumping - 14%</span>
            <span>Basic/Advanced Compare Mode for Identities/E.G.O - 34%</span>
            <span>Uptie/Threadspin Compare Mode - 40%</span>
            <span>Encounter Tags for Builds - 20%</span>
            <span>Company Page - 26%</span>
            <span>Site Customization - 24%</span>
        </div>
        
        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column"}}>
            <h3 style={{margin: 0}}>Future Features</h3>
            <span>
                How interested would you be in extraction-related features? (e.g. extraction simulator, extraction probability calculator)
            </span>
            <span>1 - 8%</span>
            <span>2 - 16%</span>
            <span>3 - 8%</span>
            <span>4 - 24%</span>
            <span>5 - 44%</span>
            <span>Avg - 3.8</span>
            <br/>
            <span>
                How interested would you be in more game utility features? (similar to the team solver/randomizer or floor planner)
            </span>
            <span>1 - 0%</span>
            <span>2 - 2%</span>
            <span>3 - 24%</span>
            <span>4 - 20%</span>
            <span>5 - 54%</span>
            <span>Avg - 4.26</span>
            <br/>
            <span>
                How interested would you be in more community-focused features? (e.g. popularity poll, spotlights, creators section, forum-like sections)
            </span>
            <span>1 - 6%</span>
            <span>2 - 14%</span>
            <span>3 - 26%</span>
            <span>4 - 20%</span>
            <span>5 - 34%</span>
            <span>Avg - 3.62</span>
            <br/>
            <span>
                How interested would you be in non-gameplay features? (e.g. abno observation logs, dante&apos;s notes, though these already exist in the wiki)
            </span>
            <span>1 - 14%</span>
            <span>2 - 18%</span>
            <span>3 - 30%</span>
            <span>4 - 10%</span>
            <span>5 - 28%</span>
            <span>Avg - 3.2</span>
        </div>
        
        <div style={{borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column"}}>
            <h3 style={{margin: 0}}>Site Maintenance</h3>
            <span>
                How comfortable are you with a Patreon support option?
            </span>
            <span>1 - 0%</span>
            <span>2 - 2%</span>
            <span>3 - 36%</span>
            <span>4 - 10%</span>
            <span>5 - 52%</span>
            <span>Avg - 4.12</span>
            <br/>
            <span>
                How comfortable are you with header, sidebar, or footer ads being added to the site?
            </span>
            <span>1 - 6%</span>
            <span>2 - 10%</span>
            <span>3 - 24%</span>
            <span>4 - 28%</span>
            <span>5 - 32%</span>
            <span>Avg - 3.7</span>
            <br/>
            <span>
                How comfortable are you with in-content ads (between content sections) being added to the site?
            </span>
            <span>1 - 30%</span>
            <span>2 - 28%</span>
            <span>3 - 28%</span>
            <span>4 - 10%</span>
            <span>5 - 4%</span>
            <span>Avg - 2.3</span>
        </div>
    </div>
}