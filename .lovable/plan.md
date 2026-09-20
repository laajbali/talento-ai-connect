# Resilient AI CV text extraction

## Scope
- Keep the existing AI CV Screening page design and result cards unchanged.
- Change only file acceptance, extraction/OCR, per-file progress, validation, and the existing AI handoff.

## Implementation
- Extend accepted uploads to JPG, JPEG, PNG, and WEBP while retaining PDF, DOC, DOCX, and TXT.
- Keep direct extraction for TXT and document extraction for DOC/DOCX.
- Extract text from every supported PDF page first; when a page or the complete PDF has insufficient readable text, render the affected page and run OCR.
- Run OCR directly for uploaded images, with English and Arabic recognition enabled for English, Arabic, and mixed-language CVs.
- Normalize extracted text and reject only after all applicable extraction and OCR attempts fail, using the exact requested error message.
- Keep each file independent so one extraction or AI failure does not stop the remaining uploads.
- Preserve the existing secure `screenCv` server function and continue passing only the actual extracted CV text into its validated structured analysis.
- Update per-file progress internally so extraction/OCR and AI analysis remain clearly distinguishable using the existing status UI.

## Validation
- Verify type checking.
- Exercise TXT, DOCX, text PDF, scanned/image PDF, JPG, PNG, English, Arabic, mixed-language, and simultaneous multi-file uploads.
- Confirm successful files produce distinct insights from their own extracted content, failed files receive the requested actionable error, and one failure does not block others.
- Confirm the existing page design and navigation remain unchanged.
