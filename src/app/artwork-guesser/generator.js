import { useData } from "../components/DataProvider";

const WIDTH = 1920;
const HEIGHT = 1080;

const REGIONS = {
    leftColumn: {xMin: 0.00, xMax: 0.33, yMin: 0.00, yMax: 1.00},
    centerColumn: {xMin: 0.33, xMax: 0.67, yMin: 0.00, yMax: 1.00},
    rightColumn: {xMin: 0.67, xMax: 1.00, yMin: 0.00, yMax: 1.00},

    topLeft: { xMin: 0.00, xMax: 0.33, yMin: 0.00, yMax: 0.4 },
    topRight: { xMin: 0.67, xMax: 1.00, yMin: 0.00, yMax: 0.4 },
    bottomLeft: { xMin: 0.00, xMax: 0.33, yMin: 0.60, yMax: 1.00 },
    bottomRight: { xMin: 0.67, xMax: 1.00, yMin: 0.60, yMax: 1.00 },
};

const DIFFICULTY = {
    easy: {
        crop: 300,
        regions: ["centerColumn"],
    },
    normal: {
        crop: 300,
        regions: ["leftColumn", "rightColumn"],
    },
    hard: {
        crop: 200,
        regions: ["leftColumn", "rightColumn"],
    },
    distort: {
        crop: 200,
        regions: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
    },
    quad: {
        crop: 100,
        regions: ["topLeft", "topRight", "bottomLeft", "bottomRight"],
    }
};

function random(min, max) {
    return min + Math.random() * (max - min);
}

export function generateCrop(difficulty) {
    const config = DIFFICULTY[difficulty];
    const regionName = config.regions[Math.floor(Math.random() * config.regions.length)];
    const region = REGIONS[regionName];

    const size = config.crop;
    const x = Math.floor(random(region.xMin * WIDTH, region.xMax * WIDTH - size));
    const y = Math.floor(random(region.yMin * HEIGHT, region.yMax * HEIGHT - size));

    return {
        x: x / WIDTH,
        y: y / HEIGHT,
        width: size / WIDTH,
        height: size / HEIGHT,
        imgWidth: WIDTH,
        imgHeight: HEIGHT
    };
}

const MODIFIERS = {
    easy: [{ type: "none" }],
    normal: [{ type: "none" }],
    hard: [{ type: "none" }],
    distort: [
        { type: "grayscale" },
        { type: "invert" },
        { type: "blur" },
        { type: "pixelate" },
        { type: "quad" },
    ],
};

export function generateModifier(difficulty) {
    const list = MODIFIERS[difficulty];
    const modifier = list[Math.floor(Math.random() * list.length)]

    if (modifier.type === "blur")
        return {
            type: "blur",
            amount: 5 + Math.random() * 10
        }

    if (modifier.type === "quad")
        return {
            type: "quad",
            crops: Array.from({ length: 4 }, () => generateCrop("quad"))
        }

    return { ...modifier };
}


export function generateArtworkQuiz(identities, settings) {
    const answers = [...Object.keys(identities)].sort(() => 0.5 - Math.random()).slice(0, settings.rounds);
    const problems = answers.map(answer => {
        const uptie =
            settings.includeUptie && settings.includePreuptie ?
                (Math.random() < 0.5) :
                (settings.includeUptie)

        return {
            answer: answer,
            uptie: uptie,
            crop: generateCrop(settings.difficulty),
            modifier: generateModifier(settings.difficulty)
        }
    });

    return {
        title: "Artwork Guess",
        problems,
    };
}

export function useArtworkQuizGenerator(settings) {
    const [identities, identitiesLoading] = useData("identities_mini");

    if (settings.mode === "daily") {
        return async () => {
            const response = await fetch("/api/dailies/artwork");
            const data = await response.json();
            console.log(data);
            return data;
        }
    }

    if (settings.mode === "standard") {
        if (identitiesLoading) return null;

        return () => generateArtworkQuiz(identities, settings);
    }

    return null;
}
