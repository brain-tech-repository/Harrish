import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import Logo from "@/app/components/logo";
import { renderToStaticMarkup } from "react-dom/server";

interface AssetData {
  qr_string?: string;
  osa_code?: string;
  uuid?: string;
  [key: string]: any;
}

/**
 * Generates asset label PDF using html2pdf with HTML/CSS syntax
 * 
 */
const logoHtml = renderToStaticMarkup(<Logo type="full" />);


export const generateAssetLabelPdfDirect = async (
  rowData: AssetData,
  assetCode: string
): Promise<void> => {
  try {
    // Parse QR string
    const qrRaw =
      rowData.qr_string ??
      "SRC 220UGBKLA;UG;BK;FUNFRUTI;31654151100003;NC/HIL/2016/220/0424";

    const qrParts = qrRaw.split(";");
    const rawModel = qrParts[0] || "";
    const modelParts= rawModel.split(" ");
    const model =
      modelParts.length >= 2
        ? `${modelParts[0]} ${modelParts[1].replace(/[A-Za-z]/g, "")}`
        : "-";

    const serialNumber = qrParts[4] || "-";
    const assetCodeDisplay = qrParts[5] || "-";

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrRaw, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 240,
    });

    // Create HTML content for PDF
  const htmlContent = `
<div style="
  width: 600px;
  height: 380px;
  border: 6px solid #e30613;
  border-radius: 18px;
  padding: 22px 26px;
  background: #ffffff;
  font-family: Arial, sans-serif;
  display: flex;
  box-sizing: border-box;
">

  <!-- LEFT SECTION -->
  <div style="
    width: 52%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  ">
    <div>
      <!-- LOGO -->
      <div style="margin-bottom: 18px;">
        ${logoHtml}
      </div>

      <!-- Asset Code -->
      <div style="margin-bottom: 14px;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">
          Asset Code:
        </div>
        <div style="
          border: 1.5px solid #000;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 15px;
          font-weight: 600;
        ">
          ${assetCodeDisplay}
        </div>
      </div>

      <!-- Serial -->
      <div style="margin-bottom: 14px;">
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">
          Serial NO:
        </div>
        <div style="
          border: 1.5px solid #000;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 15px;
          font-weight: 600;
        ">
          ${serialNumber}
        </div>
      </div>

      <!-- Model -->
      <div>
        <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">
          Model:
        </div>
        <div style="
          border: 1.5px solid #000;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 15px;
          font-weight: 600;
        ">
          ${model}
        </div>
      </div>
    </div>

    <!-- LEFT FOOTER -->
    <div style="
      font-size: 15px;
      font-weight: 700;
      margin-top: 10px;
      text-align: center;
    ">
      Property Of Hariss International Ltd.
    </div>
  </div>

  <!-- RIGHT SECTION -->
  <div style="
    width: 48%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  ">
    <img
      src="${qrDataUrl}"
      style="
        width: 250px;
        height: 250px;
      "
    />

    <div style="
      font-size: 18px;
      font-weight: 800;
      color: #e30613;
      white-space: nowrap;
    ">
      Call Free : 0800 299 008
    </div>
  </div>

</div>
`;



    // Create temporary element
    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    // PDF options
    const options = {
      margin: 0,
      filename: `asset-label-${assetCode || "export"}.pdf`,
      image: { type: "png" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape" as const, unit: "px", format: [600, 380] as [number, number] },
    };

    // Generate and save PDF
    html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};