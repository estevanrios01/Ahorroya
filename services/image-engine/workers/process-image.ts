import { ImageUpload, ImageVersion } from "../domain/types";
import { optimizeImage } from "../optimizer/processor";
import { generateThumbnail } from "../thumbnails/generator";
import { saveImage, saveVersion } from "../storage/repository";
import { extractText } from "../ocr/extractor";
import { classifyImage } from "../classification/classifier";
import { registerHash, findDuplicates } from "../duplicates/detector";
import { publishToCdn } from "../cdn/publisher";

export async function processImage(upload: ImageUpload): Promise<{
    versions: ImageVersion[];
    ocr: ReturnType<typeof extractText>;
    classification: ReturnType<typeof classifyImage>;
    duplicates: string[];
}> {
    await saveImage(upload);

    const hash = registerHash(upload.id, upload.buffer);
    const duplicates = findDuplicates(upload.buffer);

    const optimized = optimizeImage(upload.buffer);
    const thumbnail = generateThumbnail(upload.buffer);

    const versions: ImageVersion[] = [
        {
            id: crypto.randomUUID(),
            imageId: upload.id,
            format: "webp",
            url: "",
            width: upload.width,
            height: upload.height,
            sizeBytes: optimized.webp.length
        },
        {
            id: crypto.randomUUID(),
            imageId: upload.id,
            format: "avif",
            url: "",
            width: upload.width,
            height: upload.height,
            sizeBytes: optimized.avif.length
        },
        {
            id: crypto.randomUUID(),
            imageId: upload.id,
            format: "thumbnail",
            url: "",
            width: 200,
            height: 200,
            sizeBytes: thumbnail.length
        }
    ];

    for (const version of versions) {
        version.url = await publishToCdn(version);
        await saveVersion(version);
    }

    const ocr = extractText(upload.buffer);
    const classification = classifyImage(ocr.text);

    return { versions, ocr, classification, duplicates };
}
