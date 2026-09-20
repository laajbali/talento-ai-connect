/** Browser-side CV text extraction for PDF, DOCX/DOC and plain text files. */

const MAX_BYTES = 15 * 1024 * 1024;

export class CvExtractError extends Error {}

function clean(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  const limit = Math.min(doc.numPages, 15);
  for (let i = 1; i <= limit; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim(),
    );
  }
  await doc.destroy();
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

export async function extractCvText(file: File): Promise<string> {
  if (file.size === 0) throw new CvExtractError("The file is empty.");
  if (file.size > MAX_BYTES) throw new CvExtractError("The file is larger than 15MB.");

  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = name.endsWith(".docx") || name.endsWith(".doc");

  let text = "";
  try {
    if (isPdf) text = await extractPdf(file);
    else if (isDocx) text = await extractDocx(file);
    else text = await extractPlain(file);
  } catch {
    if (isDocx) {
      // Legacy .doc binaries are not DOCX archives — fall back to raw text salvage.
      text = await extractPlain(file);
    } else {
      throw new CvExtractError("This file could not be opened. Try a text-based PDF, DOCX or TXT.");
    }
  }

  if (text.replace(/\s/g, "").length < 40) {
    throw new CvExtractError(
      "No readable text found. Scanned or image-only CVs are not supported — export a text-based PDF or DOCX.",
    );
  }
  return text;
}
