import { getIdentityImageSrc } from "../components/icons/IdentityImage";

const WIDTH = 1920;
const HEIGHT = 1080;

const REGIONS = {
    leftColumn: { xMin: 0.00, xMax: 0.33, yMin: 0.00, yMax: 1.00 },
    centerColumn: { xMin: 0.33, xMax: 0.67, yMin: 0.00, yMax: 1.00 },
    rightColumn: { xMin: 0.67, xMax: 1.00, yMin: 0.00, yMax: 1.00 },

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

async function loadImageData(src) {
    const image = new Image();
    image.src = src;

    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
    return ctx.getImageData(0, 0, WIDTH, HEIGHT);
}

function isInterestingCrop(imageData, crop) {
    const gridSize = 20;
    const threshold = 80;
    const required = 4;

    const pixels = [];
    const cellWidth = crop.width / gridSize;
    const cellHeight = crop.height / gridSize;

    for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
            const px = Math.floor(crop.x + (gx + Math.random()) * cellWidth);
            const py = Math.floor(crop.y + (gy + Math.random()) * cellHeight);
            const index = (py * WIDTH + px) * 4;
            pixels.push([imageData.data[index], imageData.data[index + 1], imageData.data[index + 2]]);
        }
    }

    const average = pixels.reduce(
        (sum, [r, g, b]) => [sum[0] + r, sum[1] + g, sum[2] + b],
        [0, 0, 0]
    ).map(value => value / pixels.length);

    let different = 0;

    for (const [r, g, b] of pixels) {
        const distance = Math.sqrt((r - average[0]) ** 2 + (g - average[1]) ** 2 + (b - average[2]) ** 2);

        if (distance >= threshold) {
            different++;
            if (different >= required) return true;
        }
    }

    return false;
}

function createRandomCrop(difficulty) {
    const config = DIFFICULTY[difficulty];
    const regionName = config.regions[Math.floor(Math.random() * config.regions.length)];
    const region = REGIONS[regionName];
    const size = config.crop;

    return {
        x: Math.floor(random(region.xMin * WIDTH, region.xMax * WIDTH - size)),
        y: Math.floor(random(region.yMin * HEIGHT, region.yMax * HEIGHT - size)),
        width: size,
        height: size
    };
}

function formatCrop(crop) {
    return {
        x: crop.x / WIDTH,
        y: crop.y / HEIGHT,
        width: crop.width / WIDTH,
        height: crop.height / HEIGHT,
        imgWidth: WIDTH,
        imgHeight: HEIGHT
    };
}

function generateCrop(difficulty, imageData) {
    for (let i = 0; i < 20; i++) {
        const crop = createRandomCrop(difficulty);
        if (isInterestingCrop(imageData, crop)) return formatCrop(crop);
    }

    return formatCrop(createRandomCrop(difficulty));
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

export function generateModifier(difficulty, imageData) {
    const list = MODIFIERS[difficulty];
    const modifier = list[Math.floor(Math.random() * list.length)]

    if (modifier.type === "blur")
        return {
            type: "blur",
            label: modifier.label,
            amount: 5 + Math.random() * 10
        }

    if (modifier.type === "quad") {
        return {
            type: "quad",
            label: modifier.label,
            crops: Array.from(
                { length: 4 },
                () => generateCrop("quad", imageData)
            )
        };
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

function getRandomAnswer(identities) {
    const keys = Object.keys(identities);
    return keys[Math.floor(Math.random() * keys.length)];
}

export async function generateArtworkQuiz(identities, settings) {
    const answers = (settings.infinite || settings.rounds === 1) ?
        [getRandomAnswer(identities)] :
        shuffle(Object.keys(identities)).slice(0, settings.rounds);

    const problems = [];

    for (const answer of answers) {
        const uptie = settings.includeUptie && settings.includePreuptie ? Math.random() < 0.5 : settings.includeUptie;
        const imageData = await loadImageData(getIdentityImageSrc(identities[answer], uptie));

        problems.push({
            answer,
            uptie,
            crop: generateCrop(settings.difficulty, imageData),
            modifier: generateModifier(settings.difficulty, imageData)
        });
    }

    return {
        title: "Artwork Guess",
        problems
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
