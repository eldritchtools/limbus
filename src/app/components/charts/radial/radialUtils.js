// radialUtils.js

const DEG_TO_RAD = Math.PI / 180;

export function polarToCartesian(cx, cy, radius, angle) {
    const radians = (angle - 90) * DEG_TO_RAD;

    return {
        x: cx + radius * Math.cos(radians),
        y: cy + radius * Math.sin(radians),
    };
}

export function scaleRadius(value, max, innerRadius, outerRadius) {
    if (max <= 0) return innerRadius;
    const usable = outerRadius - innerRadius;
    return innerRadius + (value / max) * usable;
}

export function buildBands(category) {
    const active = category.active ?? 0;
    const backup = category.backup ?? 0;
    const inactive = category.inactive ?? 0;
    const cumulativeActive = active;
    const cumulativeBackup = active + backup;
    const cumulativeTotal = active + backup + inactive;

    return [
        { key: "active", innerValue: 0, outerValue: cumulativeActive, opacity: 1 },
        { key: "backup", innerValue: cumulativeActive, outerValue: cumulativeBackup, opacity: 0.55 },
        { key: "inactive", innerValue: cumulativeBackup, outerValue: cumulativeTotal, opacity: 0.2 },
    ];
}

export function calculateCategoryGeometry({
    category, index, categoryCount,
    cx, cy, innerRadius, outerRadius,
    max, gapDegrees, iconOffset = 18,
}) {
    const sliceAngle = 360 / categoryCount;
    const rotation = -sliceAngle / 2;
    const startAngle = rotation + index * sliceAngle + gapDegrees / 2;
    const endAngle = rotation + (index + 1) * sliceAngle - gapDegrees / 2;
    const middleAngle = (startAngle + endAngle) / 2;
    const { x: iconX, y: iconY } = polarToCartesian(cx, cy, outerRadius + iconOffset, middleAngle);

    const bands = buildBands(category).map(band => ({
        ...band,
        innerRadius: scaleRadius(band.innerValue, max, innerRadius, outerRadius),
        outerRadius: scaleRadius(band.outerValue, max, innerRadius, outerRadius),
    }));

    return {
        id: category.id, category,
        startAngle, endAngle, middleAngle,
        iconX, iconY, bands
    };
}

export function gapPixelsToDegrees(gapPixels, radius) {
    if (!gapPixels || radius <= 0) return 0;
    return Math.min((gapPixels / radius) * (180 / Math.PI), 15);
}

export function calculateMax(categories) {
    let max = 0;

    for (const category of categories) {
        const total = (category.active ?? 0) + (category.backup ?? 0) + (category.inactive ?? 0);
        if (total > max) max = total;
    }

    return max;
}

export function calculateChartGeometry({
    width, height, categories,
    padding = 20, gap = 4, innerRadius = 0,
    max, iconOffset = 18,
}) {
    const cx = width / 2;
    const cy = height / 2;

    const outerRadius = Math.min(width, height) / 2 - padding;
    const finalMax = max ?? calculateMax(categories);
    const gapDegrees = gapPixelsToDegrees(gap, outerRadius);

    return {
        cx, cy, innerRadius, outerRadius,
        max: finalMax,
        categories:
            categories.map(
                (category, index) =>
                    calculateCategoryGeometry({
                        category, index, categoryCount: categories.length,
                        cx, cy, innerRadius, outerRadius,
                        max: finalMax, gapDegrees, iconOffset
                    })
            ),
    };
}

export function describeSector(cx, cy, innerRadius, outerRadius, startAngle, endAngle) {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
    ].join(" ");
}

function mix(color1, color2, amount) {
    const parse = color => {
        color = color.replace("#", "");
        if (color.length === 3) color = color.split("").map(c => c + c).join("");

        return {
            r: parseInt(color.slice(0, 2), 16),
            g: parseInt(color.slice(2, 4), 16),
            b: parseInt(color.slice(4, 6), 16),
        };
    };

    const c1 = parse(color1);
    const c2 = parse(color2);

    const lerp = (a, b) => Math.round(a + (b - a) * amount);

    return `rgb(
        ${lerp(c1.r, c2.r)},
        ${lerp(c1.g, c2.g)},
        ${lerp(c1.b, c2.b)}
    )`;
}

export function shadeColor(color, amount) {
    return mix(color, "#000000", amount);
}