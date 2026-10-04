/**
 * Client-Side Text Extractor
 * Reads dropped or selected files (PDF, DOCX, TXT) and returns plain text.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  // Plain text formats
  if (extension === "txt" || extension === "md" || extension === "csv" || extension === "json") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // PDF extraction using pdfjs-dist
  if (extension === "pdf") {
    try {
      const pdfjs = await import("pdfjs-dist");
      // Set worker
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n";
      }
      if (fullText.trim().length > 0) {
        return fullText;
      }
    } catch (err) {
      console.warn("PDF.js extraction failed, falling back to basic reader:", err);
    }
  }

  // DOCX extraction using mammoth
  if (extension === "docx") {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value.trim().length > 0) {
        return result.value;
      }
    } catch (err) {
      console.warn("Mammoth extraction failed:", err);
    }
  }

  // Fallback to text reading
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || `[Uploaded file: ${file.name}]`);
    reader.onerror = () => resolve(`[Uploaded file: ${file.name}]`);
    reader.readAsText(file);
  });
}
