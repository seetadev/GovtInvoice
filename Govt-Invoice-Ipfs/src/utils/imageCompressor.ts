/**
 * Image Compressor Utility
 * 
 * Automatically compresses images (logos, signatures) to fit under a
 * specified file-size threshold using canvas-based resizing and JPEG
 * quality reduction. Falls back to progressive downscaling when the
 * quality floor is reached.
 */

/**
 * Compress an image file to fit under `maxSizeBytes`.
 *
 * Strategy:
 *   1. Draw the image onto a canvas at its original dimensions.
 *   2. Export as JPEG, lowering quality iteratively.
 *   3. If quality drops below 0.1 and the image is still too large,
 *      scale the canvas dimensions down by 20% and repeat.
 *   4. Returns the compressed data-URL (JPEG) ready to be stored.
 *
 * @param file        The original File / Blob from the file input.
 * @param maxSizeBytes  Target ceiling in bytes (e.g. 100 * 1024).
 * @returns A Promise that resolves to the compressed data-URL string.
 */
export async function compressImage(
    file: File,
    maxSizeBytes: number
): Promise<string> {
    // If already small enough, just return the original data-URL
    if (file.size <= maxSizeBytes) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Load image into an HTMLImageElement
    const img = await loadImage(file);
    return compressImageElement(img, maxSizeBytes);
}

export async function compressDataUrl(
    dataUrl: string,
    maxSizeBytes: number
): Promise<string> {
    if (dataUrlToBytes(dataUrl) <= maxSizeBytes) {
        return dataUrl;
    }

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });
    return compressImageElement(img, maxSizeBytes);
}

async function compressImageElement(
    img: HTMLImageElement,
    maxSizeBytes: number
): Promise<string> {
    const MAX_DIMENSION = 800; // Invoice logos/signatures don't need to be huge
    
    let scaleFactor = 1;
    if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        scaleFactor = MAX_DIMENSION / Math.max(img.width, img.height);
    }
    
    const MIN_QUALITY = 0.4;
    const MAX_ITERATIONS = 10; // safety net

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const width = Math.round(img.width * scaleFactor);
        const height = Math.round(img.height * scaleFactor);

        // Try decreasing quality at this scale
        let quality = 0.8; // Start slightly lower than 0.9 for faster matching
        while (quality >= MIN_QUALITY) {
            const dataUrl = drawToCanvas(img, width, height, quality);
            const size = dataUrlToBytes(dataUrl);
            if (size <= maxSizeBytes) {
                return dataUrl;
            }
            quality -= 0.15; // Faster steps
        }

        // Quality bottomed out — shrink dimensions by 25%
        scaleFactor *= 0.75;

        // Prevent scaling below 30×30 pixels
        if (img.width * scaleFactor < 30 || img.height * scaleFactor < 30) {
            break;
        }
    }

    // Last resort: return the smallest version we produced
    const finalW = Math.max(30, Math.round(img.width * scaleFactor));
    const finalH = Math.max(30, Math.round(img.height * scaleFactor));
    return drawToCanvas(img, finalW, finalH, MIN_QUALITY);
}

// --------------- helpers ---------------

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function drawToCanvas(
    img: HTMLImageElement,
    width: number,
    height: number,
    quality: number
): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
}

function dataUrlToBytes(dataUrl: string): number {
    // data:image/jpeg;base64,<payload>
    const base64 = dataUrl.split(",")[1] || "";
    // Each base64 char encodes 6 bits → 4 chars = 3 bytes
    return Math.ceil((base64.length * 3) / 4);
}
