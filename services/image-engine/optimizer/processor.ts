export interface OptimizedOutput {
    webp: Buffer;
    avif: Buffer;
    thumbnail: Buffer;
}

export function optimizeImage(buffer: Buffer, quality = 80): OptimizedOutput {
    return {
        webp: buffer,
        avif: buffer,
        thumbnail: buffer.slice(0, Math.floor(buffer.length / 4))
    };
}

export function resizeImage(
    buffer: Buffer,
    width: number,
    height: number
): Buffer {
    return buffer;
}
