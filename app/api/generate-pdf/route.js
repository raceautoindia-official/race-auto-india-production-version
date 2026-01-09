export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const subpaths = [
"/",
  "/two-wheeler",
  "/three-wheeler",
  "/passenger-vehicle",
  "/commercial-vehicle",
  "/tractor",
];

export async function GET() {
  const browser = await puppeteer.launch({ headless: "new" });
  const mergedPdf = await PDFDocument.create();

  try {
    for (const path of subpaths) {
      const page = await browser.newPage();
      await page.goto(`${process.env.NEXT_PUBLIC_BACKEND_URL}Flash-report-pdf${path}`, {
        waitUntil: "networkidle0",
      });

      // Generate PDF in landscape mode
      const pdfBuffer = await page.pdf({
        format: "A3",
        landscape: true,
        printBackground: true,
      });

      const pdf = await PDFDocument.load(pdfBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((p) => mergedPdf.addPage(p));

      await page.close();
    }

    await browser.close();

    const finalPdfBytes = await mergedPdf.save();

    return new NextResponse(finalPdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=all-reports.pdf",
      },
    });
  } catch (error) {
    await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
