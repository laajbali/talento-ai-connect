/** Browser-side CV text extraction for PDFs, images, DOCX/DOC and plain text files. */

const MAX_BYTES = 15 * 1024 * 1024;
const MIN_READABLE_CHARS = 40;
const UNREADABLE_MESSAGE =
  "Unable to read enough text from this CV. Please upload a clearer file or image.";

export class CvExtractError extends Error {}

export type CvExtractProgress = (message: string) => void;

function clean(text: string) {
  return text
    .normalize("NFKC")
    .replace(/\u0000/g, " ")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isReadable(text: string, minimum = MIN_READABLE_CHARS) {
  const compact = text.replace(/\s/g, "");
  if (compact.length < minimum) return false;
  const readable = compact.match(/[\p{L}\p{N}@.+#&/():،؛-]/gu)?.length ?? 0;
  const replacementCharacters = compact.match(/[�□]/g)?.length ?? 0;
  return readable / compact.length >= 0.55 && replacementCharacters / compact.length < 0.08;
}

async function createOcrWorker(onProgress?: CvExtractProgress) {
  const { createWorker, OEM } = await import("tesseract.js");
  return createWorker(["eng", "ara"], OEM.LSTM_ONLY, {
    logger: ({ status, progress }) => {
      if (status === "recognizing text") {
        onProgress?.(`Reading text from image… ${Math.round(progress * 100)}%`);
      }
    },
  });
}

async function extractImage(file: File, onProgress?: CvExtractProgress): Promise<string> {
  onProgress?.("Reading text from image…");
  const worker = await createOcrWorker(onProgress);
  try {
    const result = await worker.recognize(file);
    return clean(result.data.text ?? "");
  } finally {
    await worker.terminate();
  }
}

async function extractPdf(file: File, onProgress?: CvExtractProgress): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  let ocrWorker: Awaited<ReturnType<typeof createOcrWorker>> | undefined;

  try {
    for (let i = 1; i <= doc.numPages; i++) {
      onProgress?.(`Reading PDF page ${i} of ${doc.numPages}…`);
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let text = clean(
        content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" "),
      );

      if (!isReadable(text, 25)) {
        onProgress?.(`Scanning PDF page ${i} of ${doc.numPages}…`);
        ocrWorker ??= await createOcrWorker((message) =>
          onProgress?.(`${message} Page ${i} of ${doc.numPages}`),
        );
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas rendering is unavailable.");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const result = await ocrWorker.recognize(canvas);
        text = clean(result.data.text ?? "");
        canvas.width = 1;
        canvas.height = 1;
      }

      pages.push(text);
      page.cleanup();
    }
  } finally {
    if (ocrWorker) await ocrWorker.terminate();
    await doc.destroy();
  }

  return clean(pages.join("\n\n"));
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return clean(result.value ?? "");
}

async function extractPlain(file: File): Promise<string> {
  const raw = await file.text();
  return clean(raw.replace(/[^\P{C}\n]/gu, " "));
}

export async function extractCvText(
  file: File,
  onProgress?: CvExtractProgress,
): Promise<string> {
  if (file.size === 0) throw new CvExtractError("The file is empty.");
  if (file.size > MAX_BYTES) throw new CvExtractError("The file is larger than 15MB.");

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = name.endsWith(".docx");
  const isDoc = name.endsWith(".doc");
  const isTxt = name.endsWith(".txt") || file.type === "text/plain";
  const isImage =
    /\.(jpe?g|png|webp)$/.test(name) ||
    ["image/jpeg", "image/png", "image/webp"].includes(file.type);

  if (!isPdf && !isDocx && !isDoc && !isTxt && !isImage) {
    throw new CvExtractError("Unsupported file type. Upload a PDF, DOC, DOCX, TXT, JPG, PNG or WEBP CV.");
  }

  let text = "";
  try {
    if (isPdf) text = await extractPdf(file, onProgress);
    else if (isImage) text = await extractImage(file, onProgress);
    else if (isDocx) text = await extractDocx(file);
    else if (isDoc) {
      try {
        text = await extractDocx(file);
      } catch {
        text = await extractPlain(file);
      }
    } else text = await extractPlain(file);
  } catch (error) {
    if (error instanceof CvExtractError) throw error;
    throw new CvExtractError(UNREADABLE_MESSAGE);
  }

  if (!isReadable(text)) throw new CvExtractError(UNREADABLE_MESSAGE);
  return text;
}