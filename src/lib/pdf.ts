/** Rasterise a rendered CV template node into a multi-page A4 PDF. */
export async function downloadNodeAsPdf(node: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pageW) / canvas.width;
  const img = canvas.toDataURL("image/jpeg", 0.95);

  let remaining = imgH;
  let offset = 0;
  pdf.addImage(img, "JPEG", 0, 0, pageW, imgH);
  remaining -= pageH;
  while (remaining > 1) {
    offset += pageH;
    pdf.addPage();
    pdf.addImage(img, "JPEG", 0, -offset, pageW, imgH);
    remaining -= pageH;
  }

  pdf.save(filename);
}
