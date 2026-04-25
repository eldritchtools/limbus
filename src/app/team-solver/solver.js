let STEPS_PER_CHUNK = 200;
let MAX_SOLUTIONS = 20;

self.onmessage = function (e) {
    const { command, params } = e.data;
    if (command === "start") {
        solve(params);
    } else if (command === "cancel") {
        cancelled = true;
    }
};

let cancelled = false;

function permute(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function solve({ identityOptions, fixedIdentityIds, enabledSinnerIds, deployedSinners, keywordTargets, statusTargets, solvers }) {
    const solutionsPerSolver = Math.ceil(MAX_SOLUTIONS / solvers);
    const kwToIndex = Object.fromEntries(Object.entries(keywordTargets).filter(([, cnt]) => cnt > 0).map(([kw], i) => ([kw, i])));
    let condCount = Object.keys(kwToIndex).length;
    const stToIndex = Object.fromEntries(Object.entries(statusTargets).filter(([, cnt]) => cnt > 0).map(([st], i) => ([st, i + condCount])));
    condCount += Object.keys(stToIndex).length;

    const condPerIdentity = {};
    const matchCountPerSinner =
        Object.fromEntries(
            enabledSinnerIds.filter(x => !(x in fixedIdentityIds))
                .map(x => [x, Array.from({ length: condCount }, () => 0)])
        );
    const identitiesPerSinner = Object.fromEntries(enabledSinnerIds.filter(x => !(x in fixedIdentityIds)).map(x => [x, []]));
    identityOptions.forEach(identity => {
        if (!(identity.sinnerId in identitiesPerSinner)) return;

        const conds = Array.from({ length: condCount }, () => false);
        let matches = 0;
        (identity.skillKeywordList ?? []).forEach(kw => {
            if (kw in kwToIndex) {
                conds[kwToIndex[kw]] = true;
                matches++;
            }
        });
        (identity.statuses ?? []).forEach(st => {
            if (st in stToIndex) {
                conds[stToIndex[st]] = true;
                matches++;
            }
        });

        if(matches === 0) return;

        matchCountPerSinner[identity.sinnerId][matches - 1]++;

        identitiesPerSinner[identity.sinnerId].push({
            id: identity.id,
            sinnerId: identity.sinnerId,
            conds: conds
        });

        condPerIdentity[identity.id] = conds;
    });

    const initRequirement = Array.from({ length: condCount }, () => 0);
    Object.entries(keywordTargets).forEach(([kw, cnt]) => initRequirement[kwToIndex[kw]] = cnt);
    Object.entries(statusTargets).forEach(([st, cnt]) => initRequirement[stToIndex[st]] = cnt);
    Object.values(fixedIdentityIds).forEach(id => {
        const identity = identityOptions.find(x => x.id === id);
        (identity.skillKeywordList ?? []).forEach(kw => { if (kw in kwToIndex) initRequirement[kwToIndex[kw]]-- });
        (identity.statuses ?? []).forEach(st => { if (st in stToIndex) initRequirement[stToIndex[st]]-- });
    })

    const solverStates = Array.from({ length: solvers }, () => ({
        sinnerOrder: permute([...Object.keys(identitiesPerSinner)]),
        identityOrders: {},
        stack: [{ sinnerIndex: 0, identityIndex: 0 }],
        solution: [...Object.values(fixedIdentityIds)],
        needed: [...initRequirement],
        remain: deployedSinners - Object.keys(fixedIdentityIds).length,
        done: false,
        solutionsAllowed: solutionsPerSolver
    }));

    solverStates[0].sinnerOrder.sort((a, b) => {
        for (let i = Object.keys(kwToIndex).length - 1; i >= 0; i--) {
            if (matchCountPerSinner[a][i] === matchCountPerSinner[b][i]) continue;
            return matchCountPerSinner[b][i] - matchCountPerSinner[a][i];
        }
        return 0;
    })

    Object.entries(identitiesPerSinner).forEach(([sinnerId, identities]) => {
        solverStates[0].identityOrders[sinnerId] = [...identities].sort((a, b) => {
            const acnt = condPerIdentity[a.id].filter(x => x).length;
            const bcnt = condPerIdentity[b.id].filter(x => x).length
            if (acnt === bcnt) return b.id.localeCompare(a.id);
            return bcnt - acnt;
        });
    });

    solverStates[0].solutionsAllowed *= 2;

    const pushId = (solver, id) => {
        solver.solution.push(id);
        const conds = condPerIdentity[id];
        for (let i = 0; i < solver.needed.length; i++) {
            if (conds[i]) solver.needed[i]--;
        }
        solver.remain--;
    }

    const popId = solver => {
        const popped = solver.solution.pop();
        const conds = condPerIdentity[popped];
        for (let i = 0; i < solver.needed.length; i++) {
            if (conds[i]) solver.needed[i]++;
        }
        solver.remain++;
    }

    const stepSolver = solver => {
        const frame = solver.stack[solver.stack.length - 1];
        const sinnerId = solver.sinnerOrder[frame.sinnerIndex];

        if (!(sinnerId in solver.identityOrders)) {
            solver.identityOrders[sinnerId] = permute([...identitiesPerSinner[sinnerId]]);
        }

        if (frame.identityIndex >= solver.identityOrders[sinnerId].length) {
            if (frame.sinnerIndex >= solver.sinnerOrder.length - 1) {
                solver.stack.pop();
                if (solver.stack.length === 0) {
                    solver.done = true;
                } else {
                    popId(solver);
                }
                return null;
            } else {
                frame.sinnerIndex++;
                frame.identityIndex = 0;
                return null;
            }
        }

        const identity = solver.identityOrders[sinnerId][frame.identityIndex++];
        pushId(solver, identity.id);

        let newSolution = null;

        if (solver.remain <= 0) {
            let valid = solver.needed.every(x => x <= 0);
            if (valid) newSolution = [...solver.solution];
            popId(solver);
        } else if (solver.needed.some(x => x > solver.remain)) {
            popId(solver);
        } else if (frame.sinnerIndex === solver.sinnerOrder.length - 1) {
            popId(solver);
        } else {
            solver.stack.push({
                sinnerIndex: frame.sinnerIndex + 1,
                identityIndex: 0
            });
        }

        return newSolution;
    }

    const solutions = new Set();
    let solverIndex = 0;

    const key = solution => [...solution].sort().join(",");

    const handleChunk = () => {
        if (cancelled) {
            self.postMessage({ type: "done", cancelled: cancelled });
            return;
        }

        let steps = 0;
        while (steps < STEPS_PER_CHUNK) {
            const solver = solverStates[solverIndex];
            solverIndex = (solverIndex + 1) % solverStates.length;
            if (solver.done) continue;

            const result = stepSolver(solver);
            if (result) {
                const k = key(result);
                if (!solutions.has(k)) {
                    solutions.add(k);
                    solver.solutionsAllowed--;
                    self.postMessage({ type: "result", result: result });
                }
            }

            if (solver.done || solver.solutionsAllowed <= 0) {
                solverStates.splice(solverIndex - 1, 1);
                if (solverStates.length === 0) break;
                solverIndex %= solverStates.length;
            }

            if (solutions.size >= MAX_SOLUTIONS) {
                self.postMessage({ type: "done", cancelled: cancelled });
                return;
            }

            steps++;
        }

        if (solverStates.length === 0) {
            self.postMessage({ type: "done", cancelled: cancelled });
            return;
        }

        setTimeout(handleChunk, 0);
    }

    handleChunk();
}