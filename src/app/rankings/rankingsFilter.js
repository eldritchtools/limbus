import { checkFilterMatch, filterByFilters } from "../lib/filter";

export function rankingsFilter({
    type, identityReviews, egoReviews,
    rankingMode, identities, egos, minRatings = 0,
    filters, searchString, globalRanking, strictFiltering, separateByPoint,
    userIdentityReviews, userEgoReviews
}) {
    if ((type === "identity" || type === "reviewer") && !identityReviews) return [];
    if ((type === "ego" || type === "reviewer") && !egoReviews) return [];

    const filtered = [];
    const rankableItems = [];
    const unrankedItems = new Set();
    const ranks = {};

    const getScore = rankingMode === "overall" ?
        ((id, reviewList) => id in reviewList ? reviewList[id].overallRating : null) :
        ((id, reviewList) => id in reviewList ? reviewList[id].rating[rankingMode] : null)

    const sortFunction = ([ca, ua, xa], [cb, ub, xb]) => {
        if (ca === cb) {
            if (ua === ub) {
                if(xa.sinnerId !== xb.sinnerId) return xa.sinnerId - xb.sinnerId;
                if(xa.id[0] === xb.id[0]) return xb.id.localeCompare(xa.id);
                return xa.id[0] === "1" ? -1 : 1;
            }
            if (ua === null) return 1;
            if (ub === null) return -1;
            return ub - ua;
        }
        if (ca === null) return 1;
        if (cb === null) return -1;
        return cb - ca;
    }

    if (type === "identity" || type === "users") {
        const newList = filterByFilters("identity",
            Object.values(identities),
            filters,
            identity => {
                if (searchString.length > 0 && !checkFilterMatch(searchString, identity.name)) return false;
                return true;
            },
            strictFiltering
        )
            .map(identity => {
                if (!(identity.id in identityReviews) || identityReviews[identity.id].votes < minRatings)
                    return [null, getScore(identity.id, userIdentityReviews ?? {}), identity]
                else
                    return [getScore(identity.id, identityReviews), getScore(identity.id, userIdentityReviews ?? {}), identity]
            })

        const items = [];
        if (globalRanking) {
            Object.keys(identities).forEach(id => {
                if (id in identityReviews) items.push([getScore(id, identityReviews), id]);
            })
        } else {
            newList.forEach(([cs, , identity]) => {
                if (cs !== null) items.push([cs, identity.id]);
            })
        }

        items.forEach(([sc, id]) => {
            if (!(id in identityReviews) || identityReviews[id].votes < minRatings)
                unrankedItems.add(id);
            else
                rankableItems.push([sc, id]);
        });

        filtered.push(...newList);
    }

    if (type === "ego" || type === "users") {
        const newList = filterByFilters("ego",
            Object.values(egos),
            filters,
            ego => {
                if (searchString.length > 0 && !checkFilterMatch(searchString, ego.name)) return false;
                return true;
            },
            strictFiltering
        )
            .map(ego => {
                if (!(ego.id in egoReviews) || egoReviews[ego.id].votes < minRatings)
                    return [null, getScore(ego.id, userEgoReviews ?? {}), ego]
                else
                    return [getScore(ego.id, egoReviews), getScore(ego.id, userEgoReviews ?? {}), ego]
            })

        const items = [];
        if (globalRanking) {
            Object.keys(egos).forEach(id => {
                if (id in egoReviews) items.push([getScore(id, egoReviews), id]);
            })
        } else {
            newList.forEach(([cs, , ego]) => {
                if (cs !== null) items.push([cs, ego.id]);
            })
        }

        items.forEach(([sc, id]) => {
            if (!(id in egoReviews) || egoReviews[id].votes < minRatings)
                unrankedItems.add(id);
            else
                rankableItems.push([sc, id]);
        });

        filtered.push(...newList);
    }

    rankableItems.sort((a, b) => b[0] - a[0]);

    let currentRank, lastScore;
    for (let i = 0; i < rankableItems.length; i++) {
        if (rankableItems[i][0] !== lastScore) {
            currentRank = i + 1;
            lastScore = rankableItems[i][0];
        }

        ranks[rankableItems[i][1]] = currentRank;
    }

    filtered.sort(sortFunction);
    for (let i = 0; i < filtered.length; i++) {
        filtered[i].push(ranks[filtered[i][2].id] ?? null);
    }

    if (separateByPoint) {
        return filtered.reduce((acc, item) => {
            if (item[0] === null) {
                if ("none" in acc) acc["none"].push(item);
                else acc["none"] = [item];
            } else {
                const t = Math.floor(item[0]);
                if (t in acc) acc[t].push(item);
                else acc[t] = [item]
            }
            return acc;
        }, {});
    }

    return filtered;
}