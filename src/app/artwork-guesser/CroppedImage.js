import PixelatedCrop from "./PixelatedCrop";
import IdentityImage from "../components/icons/IdentityImage";
import { getIdentityArtSrc } from "../components/icons/imgSrc";

function Crop({ id, uptie, crop, style = {} }) {
    return <div style={{
        position: "relative", width: crop.width * crop.imgWidth, height: crop.height * crop.imgHeight, overflow: "hidden"
    }}>
        <IdentityImage id={id}
            uptie={uptie}
            style={{
                position: "absolute", userSelect: "none", pointerEvents: "none",
                width: crop.imgWidth, height: crop.imgHeight,
                left: -crop.x * crop.imgWidth, top: -crop.y * crop.imgHeight,
                ...style
            }}
        />
    </div>
}

export default function CroppedImage({ problem, answer }) {
    if (!problem) return null;

    if (problem.modifier?.type === "quad")
        return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px #ddd solid" }}>
            <Crop id={answer} uptie={problem.uptie} crop={problem.modifier.crops[0]} />
            <Crop id={answer} uptie={problem.uptie} crop={problem.modifier.crops[1]} />
            <Crop id={answer} uptie={problem.uptie} crop={problem.modifier.crops[2]} />
            <Crop id={answer} uptie={problem.uptie} crop={problem.modifier.crops[3]} />
        </div>

    if (problem.modifier?.type === "grayscale")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: "grayscale(100%)" }} />
        </div>

    if (problem.modifier?.type === "blur")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: `blur(${problem.modifier.amount}px)` }} />
        </div>

    if (problem.modifier?.type === "invert")
        return <div style={{ border: "1px #ddd solid" }}>
            <Crop id={answer} uptie={problem.uptie} crop={problem.crop} style={{ filter: "invert(1)" }} />
        </div>

    if (problem.modifier?.type === "pixelate")
        return <div style={{ border: "1px #ddd solid" }}>
            <PixelatedCrop image={getIdentityArtSrc(answer, problem.uptie)} crop={problem.crop} />
        </div>

    return <div style={{ border: "1px #ddd solid" }}>
        <Crop id={answer} uptie={problem.uptie} crop={problem.crop} />
    </div>
}