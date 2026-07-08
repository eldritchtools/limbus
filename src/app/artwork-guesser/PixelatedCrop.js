import { useEffect, useRef } from "react";

export default function PixelatedCrop({ image, crop, blockSize = 8 }) {
    const canvasRef = useRef();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();

        img.onload = () => {
            const w = crop.width * crop.imgWidth;
            const h = crop.height * crop.imgHeight;

            canvas.width = w;
            canvas.height = h;

            // Number of "pixels" across
            const smallWidth = Math.ceil(w / blockSize);
            const smallHeight = Math.ceil(h / blockSize);

            // Temporary canvas
            const temp = document.createElement("canvas");
            temp.width = smallWidth;
            temp.height = smallHeight;

            const tempCtx = temp.getContext("2d");

            // Draw crop onto tiny canvas
            tempCtx.drawImage(
                img,
                crop.x * crop.imgWidth, crop.y * crop.imgHeight, w, h,
                0, 0, smallWidth, smallHeight
            );
            
            // Disable smoothing
            ctx.imageSmoothingEnabled = false;

            // Stretch back up
            ctx.drawImage(
                temp,
                0, 0, smallWidth, smallHeight,
                0, 0, w, h
            );
        };

        img.src = image;
    }, [image, crop, blockSize]);

    return <canvas
        ref={canvasRef}
        width={crop.width}
        height={crop.height}
    />
}