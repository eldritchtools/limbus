import { fetchData } from "../DataFetcherServer";
import MarkdownRenderer from "./MarkdownRenderer";
import { extractMarkdownDependencies } from "./MarkdownUtil";

import { getSkillName } from "@/app/lib/skill";

export default async function MarkdownRendererServer({ content, guardedLinks }) {
    const deps = extractMarkdownDependencies(content);
    const context = {};
    const fetchList = [];

    let fetchIds = false;
    let fetchIdsSkill = false;

    if (deps.identity.size > 0) {
        fetchIds = true;
    }

    if (deps.ego.size > 0) {
        fetchList.push(["ego", "egos_mini"]);
    }

    if (deps.skill.size > 0) {
        for (const id of deps.skill) {
            const [ownerId, skillId] = id.split("|");
            if (ownerId[0] === '1') {
                fetchList.push(["skill", `identities/${ownerId}`, ownerId, skillId, "identity"]);
                fetchIdsSkill = true;
            } else {
                fetchList.push(["skill", `egos/${ownerId}`, ownerId, skillId, "ego"]);
            }
        }
    }

    if (fetchIdsSkill) fetchList.push(["identity", "identities"]);
    else if (fetchIds) fetchList.push(["identity", "identities_mini"]);

    if (deps.status.size > 0) {
        fetchList.push(["status", "statuses"]);
    }

    if (deps.gift.size > 0 || deps.gifticon.size > 0) {
        fetchList.push(["gift", "gifts"]);
    }

    if (deps.themepack.size > 0) {
        fetchList.push(["themepack", "md_theme_packs"]);
    }

    if (deps.encounter.size > 0) {
        fetchList.push(["encounter", "encounters"]);
    }

    if (deps.icon.size > 0) {
        fetchList.push(["icon", "additional_icons"]);
    }

    const fetchedData = await Promise.all(fetchList.map(([, x]) => fetchData(x)));

    fetchedData.forEach((data, i) => {
        if (fetchList[i][0] === "skill") return;
        switch (fetchList[i][0]) {
            case "identity":
                context.identity =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id))
                        .map(([id, data]) => {
                            const { sinnerId, name, skillKeywordList } = data;
                            return [id, { sinnerId, name, skillKeywordList }]
                        })
                    )
                break;
            case "ego":
                context.ego =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id))
                        .map(([id, data]) => {
                            const { sinnerId, name } = data;
                            return [id, { sinnerId, name }]
                        })
                    )
                break;
            case "status":
                context.status =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id))
                        .map(([id, data]) => {
                            const { name, buffType, srcPath } = data;
                            return [id, { name, buffType, srcPath }]
                        })
                    )
                break;
            case "gift":
                context.gift =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id) || deps["gifticon"].has(id))
                        .map(([id, data]) => {
                            const { names, srcPath, keyword, tier } = data;
                            if (deps.gifticon.has(id)) return [id, { id, names, srcPath, keyword, tier }];
                            else return [id, { id, names }];
                        })
                    )
                break;
            case "themepack":
                context.themepack =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id))
                        .map(([id, data]) => {
                            const { name } = data;
                            return [id, { name }]
                        })
                    )
                break;
            case "icon":
                context.icon =
                    Object.fromEntries(Object.entries(data)
                        .filter(([id]) => deps[fetchList[i][0]].has(id))
                    )
                break;
            case "encounter":
                context.encounter = {};
                for (const str of deps.encounter) {
                    const [cat, enc] = str.split("|");
                    if (!(cat in context.encounter)) context.encounter[cat] = {};
                    context.encounter[cat][enc] = data[cat][enc];
                }
                break;
        }
    })

    fetchedData.forEach((data, i) => {
        if (fetchList[i][0] !== "skill") return;
        if (!("skill" in context)) context.skill = {};
        const fullId = `${fetchList[i][2]}${fetchList[i][3]}`
        if (fetchList[i][4] === "identity") {
            context.skill[fullId] = getSkillName("identity", data, fullId, 5);
        } else {
            context.skill[fullId] = getSkillName("ego", data, fullId, 5);
        }
    })

    return <MarkdownRenderer content={content} context={context} guardedLinks={guardedLinks} />
}
