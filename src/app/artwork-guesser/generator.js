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
        { type: "grayscale", label: "Grayscale" },
        { type: "invert", label: "Inverted" },
        { type: "blur", label: "Blurred" },
        { type: "pixelate", label: "Pixelated" },
        { type: "quad", label: "4 Squares" },
    ],
};

export function generateModifier(difficulty) {
    const list = MODIFIERS[difficulty];
    const modifier = list[Math.floor(Math.random() * list.length)]

    if (modifier.type === "blur")
        return {
            type: "blur",
            label: modifier.label,
            amount: 5 + Math.random() * 10
        }

    if (modifier.type === "quad")
        return {
            type: "quad",
            label: modifier.label,
            crops: Array.from({ length: 4 }, () => generateCrop("quad"))
        }

    return { ...modifier };
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function generateArtworkQuiz(identities, settings) {
    const answers = shuffle(Object.keys(identities)).slice(0, settings.rounds);
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

export function constructArtworkQuizGenerator(settings, identities) {
    if (settings.mode === "daily") {
        return async () => {
            const response = await fetch("/api/dailies/artwork");
            return await response.json();
        }
    }

    if (settings.mode === "standard") {
        return () => generateArtworkQuiz(identities, settings);
    }

    return null;
}
