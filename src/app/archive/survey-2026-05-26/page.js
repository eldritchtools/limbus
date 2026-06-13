"use client";

import AnswerSection from "./AnswerSection";

const submissions = 153;

function ConcernSection({ title, response }) {
    return <div style={{ borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span>{response} </span>
    </div>
}

export default function SurveyPage() {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Survey Results</h2>
        <span>
            Hi! This page shows the results of the survey conducted between 2026-05-26 to 2026-06-09 about the future direction of the site in case people are curious.
        </span>

        <span className="title-text">
            Total number of responses: 153
        </span>

        <div style={{ borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", gap: "0.5rem" }}>
            <h3 style={{ margin: 0 }}>Site Usage</h3>
            <span>
                Which of these main features or pages do you use regularly (at least once every so often or when the game updates) or have found useful at least once or twice?
            </span>
            <AnswerSection
                total={submissions}
                texts={[
                    "Team Builds",
                    "MD Plans",
                    "Collections",
                    "Community Ranking and Reviews",
                    "Identity/E.G.O Pages",
                    "Encounters Page",
                    "Timers and Roadmap Page",
                    "MD Achievement Tracker",
                    "MD Reference Pages",
                    "Daily Randomized Team",
                    "Dispense and Training Calculator",
                    "Team Solver",
                    "Team Randomizer",
                    "Floor Planner"
                ]}
                values={[
                    105, 77, 23, 58, 115, 61, 73, 54, 93, 11, 38, 51, 15, 57
                ]}
            />
            <br />
            <span>
                Which of these secondary features do you use regularly (at least once every so often or when the game updates) or have found useful at least once or twice?
            </span>
            <AnswerSection
                total={submissions}
                texts={[
                    "Tokens",
                    "Display Type",
                    "Tracking Mode for MD Plans",
                    "Reviewers Tab",
                    "Review Bumping",
                    "Basic/Advanced Compare Mode for Identities/E.G.O",
                    "Uptie/Threadspin Compare Mode",
                    "Encounter Tags for Builds",
                    "Company Page",
                    "Site Customization"
                ]}
                values={[
                    31, 56, 47, 38, 21, 47, 55, 20, 36, 26, 1, 1
                ]}
            />
        </div>

        <div style={{ borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", gap: "0.5rem" }}>
            <h3 style={{ margin: 0 }}>Future Features</h3>
            <span>
                How interested would you be in extraction-related features? (e.g. extraction simulator, extraction probability calculator)
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[20, 17, 18, 37, 61]}
                average={true}
            />
            <br />
            <span>
                How interested would you be in more game utility features? (similar to the team solver/randomizer or floor planner)
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[4, 5, 28, 45, 71]}
                average={true}
            />
            <br />
            <span>
                How interested would you be in more community-focused features? (e.g. popularity poll, spotlights, creators section, forum-like sections)
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[9, 21, 32, 44, 47]}
                average={true}
            />
            <br />
            <span>
                How interested would you be in non-gameplay features? (e.g. abno observation logs, dante&apos;s notes, though these already exist in the wiki)
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[15, 28, 38, 18, 54]}
                average={true}
            />
        </div>

        <div style={{ borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", gap: "0.5rem" }}>
            <h3 style={{ margin: 0 }}>Site Maintenance</h3>
            <span>
                How comfortable are you with a Patreon support option?
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[6, 2, 43, 42, 60]}
                average={true}
            />
            <br />
            <span>
                How comfortable are you with header, sidebar, or footer ads being added to the site?
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[12, 22, 49, 31, 39]}
                average={true}
            />
            <br />
            <span>
                How comfortable are you with in-content ads (between content sections) being added to the site?
            </span>
            <AnswerSection
                total={submissions}
                texts={[1, 2, 3, 4, 5]}
                values={[63, 46, 29, 11, 4]}
                average={true}
            />
        </div>

        <div style={{ borderTop: "1px solid var(--secondary-border-color", padding: "0.5rem", display: "flex", flexDirection: "column", width: "100%", maxWidth: "1200px", gap: "0.5rem" }}>
            <h3 style={{ margin: 0 }}>Summary of Concerns and Some Responses</h3>
            <span>
                This section contains the questions or concerns submitted that I can respond to. Repeat questions are merged into a single item.
            </span>
            <ConcernSection
                title={"Damage Calculator numbers are too low."}
                response={"This was due to the calculator not taking passives and other effects like status inflictions (e.g. Fragility) into account. Passives have been included in an update since the survey started so the numbers should be closer to what's expected. Other interactions will not be included since they don't really work with how the calculator is currently implemented."}
            />
            <ConcernSection
                title={"Don't allow people to rate things with all 0s."}
                response={"This doesn't solve the issue most people are thinking of (fake ratings trying to bring down the ranks of certain identities or E.G.Os) since people can always just rate them all 1s or all 0s with a single 1. This does however solve a different issue: people who want to leave a review without leaving a rating, so I will be implementing this in a future update. I will also recompute the scores to ignore existing reviews with all 0s when that update comes.\n\nNot the same but related, I've also received mentions of tagging reviews as meme reviews. I may also implement this in the future."}
            />
            <ConcernSection
                title={"Easier way to insert images"}
                response={"I've added images to posts with a limit of 1 per post for now. I may increase the limit or add them to comments later on depending on how things go. I've also added the community assets feature where you can upload emotes and stickers to use across the site using tokens."}
            />
            <ConcernSection
                title={"More filtering options across the site"}
                response={"I've added advanced sorting/filtering options to the identity/E.G.O selection menus across the site in one of the updates since the survey started."}
            />
            <ConcernSection
                title={"Guide page/section for navigating the site"}
                response={"I just added the Manager's Guide page!"}
            />
            <ConcernSection
                title={"Stricter filtering when selecting Identities or E.G.Os (e.g. selecting two statuses for having both instead of either)"}
                response={"This is the same as Strict Filtering in the overall identities or E.G.Os page. I've added this in the advanced sorting/filtering options."}
            />
            <ConcernSection
                title={"Filter Team Builds based on specific encounters (Railway, Reflectrial, etc)"}
                response={"This has already been implemented through the encounter tags, though people have been making builds without tagging them."}
            />
            <ConcernSection
                title={"More site customization options (mostly aesthetic related) and making the UI cleaner"}
                response={"I've been trying to add more customization options whenever I think of them! If you have any ideas feel free to submit them through the feedback page or on the Discord. I've also been gradually making small changes to the UI whenever I find something to improve."}
            />
            <ConcernSection
                title={"Share customization options between devices"}
                response={"This has been added (optional save and load buttons on the page). Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Placeholder identities in the Team Solver"}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Tokens for sinner icons"}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Swapping between uptie arts in a Team Build"}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Tokens for skills"}
                response={"This is a bit on the harder end of things, but I'll see if I can get it done."}
            />
            <ConcernSection
                title={"Stats in the Company page (number/percent owned, levels, upties)"}
                response={"I've added number/percentage owned. I'm currently not too sure about adding levels and upties."}
            />
            <ConcernSection
                title={"Link Floor Planner to the encounters."}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Add more details (resists, sin requirements of passives, etc) to the browse all identities page."}
                response={"You can check this using the Advanced Compare Mode feature!"}
            />
            <ConcernSection
                title={"Better way to add encounter tags."}
                response={"I've added a button to the tags section of Team Builds to make this easier!"}
            />
            <ConcernSection
                title={"A way to copy Team Codes from the game into the site."}
                response={"This already existed since before. You can paste the team code into the team code text box when making a build."}
            />
            <ConcernSection
                title={"Adding more official arts to the site (full arts, combat sprites)."}
                response={"This is possible, but the wiki already does this so it's probably not too major. I'll think about adding them in the future."}
            />
            <ConcernSection
                title={"Viewing Theme Packs Choice Events can appear in and vice versa."}
                response={"I've added a Theme Packs filter in the Choice Events page, though this only applies to the Theme Pack exclusive ones. For now I'm avoiding adding the general Choice Events since they'd end up filling up the entire list for most theme packs."}
            />
            <ConcernSection
                title={"Add a Mirror Dungeon section for Team Building."}
                response={"You can use tokens to refer to theme packs and gifts, but if you really want to create a build for MD, you can use MD Plans for this."}
            />
            <ConcernSection
                title={"Viewing details of identities while in editing mode (for selecting based on HP, skill sins, etc)."}
                response={"For now the bigger Identities/E.G.Os menu can show you this based on the filters and advanced options. I'll think about whether I can add even more details to the tooltips or somewhere else on the editing section."}
            />
            <ConcernSection
                title={"Other languages for in-game items using other game languages or Limbus Localization Manager"}
                response={"I have considered this, but it'll be a bit difficult to implement it with how the site currently works plus having to pull updates every time they're available. I'll see if I can do it in the future."}
            />
            <ConcernSection
                title={"Allow other statuses as icons for team builds"}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Grey out completed achievements"}
                response={"This has been added. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"It's difficult to check keywords when team building on mobile."}
                response={"I've added customization options to change how the selection menus look like. You can add the keywords to the display for mobile using this."}
            />
            <ConcernSection
                title={"Seeing token types while using tokens"}
                response={"I've added an autocomplete for the token types as well as a note in the placeholder text on markdown editors. Thanks for the suggestion."}
            />
            <ConcernSection
                title={"Viewing lore flavour texts (inside skills and statuses)"}
                response={"These are already on the wiki, but I'll consider adding them somewhere in the future in a more easily searchable format."}
            />
            <ConcernSection
                title={"Adding more filters to E.G.O gifts based on interactions like resonance, power, etc"}
                response={"Currently you can do this using the search feature in the gifts page since it searches through descriptions as well, but I'll see if I can add a more straightforward way of adding this."}
            />
            <ConcernSection
                title={"Adding compatibility tags to E.G.O gifts so it shows which identities it affects"}
                response={"This would take a lot of work, not just to add the tags, but also how to concisely display all the affected sinners for all the gifts. I will have to think about it, but this may be a long term goal if I were to add it."}
            />
            <ConcernSection
                title={"Add community rankings for E.G.O gifts"}
                response={"This is an interesting idea, but I'll have to take some time to think about it, so I can't answer this one at the moment."}
            />
            <ConcernSection
                title={"Showing alternative identity suggestions for teams"}
                response={"I think it should be the owner in charge of suggesting these. I could easily make a feature that suggests other ids with the same keywords or something, but a lot of teams will have other reasons why they choose a specific id, and it won't always be as straightforward as that."}
            />
            <ConcernSection
                title={"Separate E.G.O gifts into separate sections in MD Plans"}
                response={"I'll see if I can add this as an option when viewing a plan."}
            />
            <ConcernSection
                title={"Add voice lines of identities (theater and in battle voice lines)"}
                response={"This is probably better handled by the wiki, but I'll see if I can do something like this in the future if people want it."}
            />
            <ConcernSection
                title={"Abnormality Database"}
                response={"This is probably better in the wiki, but I'll think about adding it if I can think of some use that isn't already covered in the wiki."}
            />
            <ConcernSection
                title={"Limbus Profile Showcase & Friendlists"}
                response={"This may be possible, but I'll have to take a deeper look into it. I don't think it's something I can consider a priority though or even something people would want."}
            />
            <ConcernSection
                title={"Lowest turn clear leaderboards for boss fights"}
                response={"I could add this to the encounters page, but I don't think I'll be able to verify and regulate submissions properly, so I'd have to assume people are generally uploading trustworthy results."}
            />
            <ConcernSection
                title={"Patreon Support"}
                response={"I'm glad people are open to the possibility. I'll probably add it at some point. I just feel a bit guilty that I can only offer minor cosmetics or stuff like that, but if people are willing then I'm not going to say no."}
            />
            <ConcernSection
                title={"Concerns about Ads"}
                response={"The concerns about ads being obnoxious are 100% justified, but I really don't plan on making it that way. It seems like people are mostly fine with my original plan of making them optional and just on the sides and not too distracting. I'm leaning towards implementing them eventually, but I'll see how things go."}
            />
        </div>
    </div>
}
