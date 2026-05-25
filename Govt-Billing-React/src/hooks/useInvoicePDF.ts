import { APP_NAME } from "../app-data";
import * as AppGeneral from "../components/socialcalc/index.js";

/**
 * Takes the raw HTML string from SocialCalc and replaces any <canvas ...></canvas>
 * elements with a placeholder note. No DOM mutation — pure string processing.
 *
 * Why: canvas pixel data can't survive HTML serialisation. Rather than
 * attempting risky DOM swaps (which cause NotFoundError when React re-renders
 * during the swap), we cleanly remove canvases and note their absence.
 */
const replaceCanvasesInHTML = (html: string): string => {
  // Match <canvas ...>...</canvas> — covers both self-closing and paired tags
  return html.replace(
    /<canvas[^>]*>[\s\S]*?<\/canvas>/gi,
    '<p style="color:#888;font-size:10px;font-style:italic;margin:4px 0;">[Chart — view in app]</p>'
  );
};

const buildPDFHTML = (filename: string): string => {
  const rawHTML = AppGeneral.getCurrentHTMLContent();
  const sheetHTML = replaceCanvasesInHTML(rawHTML);
  const exportedAt = new Date().toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${APP_NAME} — ${filename}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a2e;
      background: #fff;
      padding: 32px 40px;
    }
    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #3880ff;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .pdf-header .org-block h1 { font-size: 22px; font-weight: 700; color: #3880ff; }
    .pdf-header .org-block p  { font-size: 11px; color: #555; margin-top: 2px; }
    .pdf-header .meta-block   { text-align: right; font-size: 11px; color: #444; line-height: 1.8; }
    .pdf-header .meta-block .invoice-label {
      font-size: 18px; font-weight: 700; color: #3880ff; display: block; margin-bottom: 4px;
    }
    .sheet-wrapper { overflow-x: auto; }
    .sheet-wrapper table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .sheet-wrapper td, .sheet-wrapper th {
      border: 1px solid #d0d8e8; padding: 5px 8px; vertical-align: top;
    }
    .sheet-wrapper tr:nth-child(even) td { background: #f5f8ff; }
    .sheet-wrapper img { max-width: 100%; height: auto; display: block; margin: 8px 0; }
    .pdf-footer {
      margin-top: 28px; border-top: 1px solid #d0d8e8; padding-top: 12px;
      display: flex; justify-content: space-between; font-size: 10px; color: #888;
    }
    @media print {
      body { padding: 16px; }
      .sheet-wrapper { overflow: visible; }
      @page { margin: 1cm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="org-block">
      <h1>${APP_NAME}</h1>
      <p>Government Billing &amp; Invoicing System</p>
    </div>
    <div class="meta-block">
      <span class="invoice-label">INVOICE</span>
      <span><strong>File:</strong> ${filename}</span>
      <span><strong>Exported:</strong> ${exportedAt}</span>
    </div>
  </div>
  <div class="sheet-wrapper">${sheetHTML}</div>
  <div class="pdf-footer">
    <span>${APP_NAME} — Official Document</span>
    <span>Generated on ${exportedAt}</span>
  </div>
</body>
</html>`;
};

/**
 * Prints via a hidden iframe — avoids window.open popup blocker entirely.
 */
const printViaIframe = (html: string): void => {
  const existing = document.getElementById("__invoice_print_frame__");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "__invoice_print_frame__";
  iframe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;border:none;opacity:0;pointer-events:none;";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error("Could not access iframe document");
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 2000);
  };
};

export const useInvoicePDF = () => {
  const exportAsPDF = (filename: string = "Invoice"): void => {
    const html = buildPDFHTML(filename);
    printViaIframe(html);
  };

  const downloadHTML = (filename: string = "Invoice"): void => {
    const html = buildPDFHTML(filename);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename.replace(/\s+/g, "_")}_invoice.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return { exportAsPDF, downloadHTML };
};