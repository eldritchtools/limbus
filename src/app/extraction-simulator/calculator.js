const CHUNK_LIMIT = 20;

self.onmessage = function (e) {
    const { command, params } = e.data;
    if (command === "start") {
        computeRates(params);
    } else if (command === "cancel") {
        cancelled = true;
    }
};

let cancelled = false;

function computeRates({ maxPulls, countId, countEgo, countAnnouncer, offBannerAnnouncers, announcersInBanner, computeAll }) {
    const stateSize = (countId + 1) * (countEgo + 1) * (countAnnouncer + 1);
    cancelled = false;

    let currDP = new Float64Array(stateSize).fill(0);
    let nextDP = new Float64Array(stateSize).fill(0);

    function getIndex(ids, egos, announcers) {
        return ((ids * (countEgo + 1) + egos) * (countAnnouncer + 1) + announcers);
    }

    function fromIndex(idx) {
        let tmp = idx;
        let announcers = tmp % (countAnnouncer + 1); tmp = Math.floor(tmp / (countAnnouncer + 1));
        let egos = tmp % (countEgo + 1); tmp = Math.floor(tmp / (countEgo + 1));

        return { ids: tmp, egos, announcers };
    }

    currDP[getIndex(0, 0, 0)] = 1.0;

    let currentPull = 1;

    const handleChunk = () => {
        if (cancelled) {
            self.postMessage({ type: "done", cancelled: cancelled });
            return;
        }

        const results = [];
        while (results.length < CHUNK_LIMIT && currentPull <= maxPulls) {
            nextDP.fill(0);

            for (let idx = 0; idx < stateSize; idx++) {
                const probState = currDP[idx];
                if (probState < 1e-15) continue;

                let { ids, egos, announcers } = fromIndex(idx);

                let remainingRate = 1;
                if (announcersInBanner && announcers < countAnnouncer) {
                    const rate = offBannerAnnouncers ? 0.0065 : 0.013; // 1.3% with optional 50%/100%
                    const uniqueRate = rate * (countAnnouncer - announcers) / countAnnouncer;
                    remainingRate -= uniqueRate;
                    nextDP[getIndex(ids, egos, announcers + 1)] += probState * uniqueRate;
                }

                if (egos < countEgo) {
                    const rate = 0.0065; // 50% of 1.3%
                    remainingRate -= rate;
                    nextDP[getIndex(ids, egos + 1, announcers)] += probState * rate;
                }

                if (ids < countId) {
                    const rate = 0.0145; // 50% of 2.9%
                    const uniqueRate = rate * (countId - ids) / countId
                    remainingRate -= uniqueRate;
                    nextDP[getIndex(ids + 1, egos, announcers)] += probState * uniqueRate;
                }
                nextDP[idx] += probState * remainingRate;
            }

            // compile probabilities for each k
            let totalProb = 0;
            let probIds = new Float64Array(countId + 1).fill(0);
            let probEgos = new Float64Array(countEgo + 1).fill(0);
            let probAnnouncers = new Float64Array(countAnnouncer + 1).fill(0);
            let probAll = 0;
            for (let idx = 0; idx < stateSize; idx++) {
                const probState = nextDP[idx];
                totalProb += probState;
                if (probState < 1e-15) continue;
                let { ids, egos, announcers } = fromIndex(idx);
                probIds[ids] += probState;
                probEgos[egos] += probState;
                probAnnouncers[announcers] += probState;
                if (ids === countId && egos === countEgo && announcers === countAnnouncer) probAll = probState;
            }

            for (let i = countId - 1; i >= 0; i--) probIds[i] += probIds[i + 1];
            for (let i = countEgo - 1; i >= 0; i--) probEgos[i] += probEgos[i + 1];
            for (let i = countAnnouncer - 1; i >= 0; i--) probAnnouncers[i] += probAnnouncers[i + 1];


            const res = { pull: currentPull };
            if (countId) res.probIds = [...probIds];
            if (countEgo) res.probEgos = [...probEgos];
            if (countAnnouncer) res.probAnnouncers = [...probAnnouncers];
            if (computeAll) res.probAll = probAll;

            results.push(res);

            // normalize probabilities if the drift gets too big
            if (Math.abs(totalProb - 1) > 1e-12) {
                for (let i = 0; i < stateSize; i++) {
                    nextDP[i] /= totalProb;
                }
            }

            // Swap DP arrays
            [currDP, nextDP] = [nextDP, currDP];
            currentPull++;
        }
        self.postMessage({ type: "results", results: results });

        if (currentPull >= maxPulls) {
            self.postMessage({ type: "done", cancelled: cancelled });
        }

        setTimeout(handleChunk, 0);
    }

    handleChunk();
}