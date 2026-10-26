// src/lib/filetype.ts

export interface DetectedFileType {
    mimetype: string;
    extension: string;
}

/**
 * Erkennung über die führenden Magic Bytes, wie in api-docs.yaml
 * beschrieben. ZIP und DOCX/XLSX/PPTX beginnen beide mit "PK\x03\x04" und
 * sind ohne tiefere Inspektion (ZIP-Verzeichnis lesen) nicht unterscheidbar
 * — wird hier bewusst einheitlich als "application/zip" behandelt.
 */
const SIGNATURES: Array<{ check: (buf: Buffer) => boolean; mimetype: string; extension: string }> = [
    { check: (b) => b.subarray(0, 4).toString("ascii") === "%PDF", mimetype: "application/pdf", extension: ".pdf" },
    {
        check: (b) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
        mimetype: "application/zip",
        extension: ".zip",
    },
    {
        check: (b) => b.length >= 4 && b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
        mimetype: "application/msword",
        extension: ".doc",
    },
    {
        check: (b) => b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
        mimetype: "image/png",
        extension: ".png",
    },
    {
        check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
        mimetype: "image/jpeg",
        extension: ".jpg",
    },
];

export function detectFileType(buffer: Buffer): DetectedFileType {
    for (const sig of SIGNATURES) {
        if (sig.check(buffer)) return { mimetype: sig.mimetype, extension: sig.extension };
    }
    return { mimetype: "application/octet-stream", extension: ".bin" };
}
