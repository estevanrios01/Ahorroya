export function generateThumbnail(
    buffer: Buffer,
    size = 200
): Buffer {
    return buffer.slice(0, Math.floor(buffer.length / 4));
}

export function generatePreview(
    buffer: Buffer,
    maxWidth = 800
): Buffer {
    return buffer;
}
