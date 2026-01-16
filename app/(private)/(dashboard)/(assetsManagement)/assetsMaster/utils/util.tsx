import html2pdf from "html2pdf.js";
import QRCode from "qrcode";
import Logo from "@/app/components/logo";
import { renderToStaticMarkup } from "react-dom/server";
// import  assestMasterQR from "@/app/services/allApi";

interface AssetData {
  osa_code?: string;
  serial_number?: string;
  model_number?: {
    name?: string;
  };
  manufacturer?: {
    name?: string;
  };
  capacity?: string;
  uuid?: string;
  [key: string]: any;
}

const logoHtml = renderToStaticMarkup(<Logo type="full" />);

// 🔹 helper → har row ke liye QR string
const generateQrString = (row: AssetData) => {
  const manufacturer = row.manufacturer?.name || "-";
  const model = row.model_number?.name || "-";
  const capacity = row.capacity || "-";
  const serial = row.serial_number || "-";
  const assetCode = row.osa_code || "-";

  // 👉 company format (aap change kar sakti ho)
  return ` ${model};${capacity};${serial};${assetCode}`;
};

export const generateAssetLabelPdfDirect = async (
  rowData: AssetData,
  assetCode?: string
): Promise<void> => {
  try {
    // 🔹 1. Dynamic QR string (per row)
    const qrRaw = generateQrString(rowData);
    const qrParts = qrRaw.split(";");

    // 🔹 2. UI values
     const model = qrParts[0];            // LG AMN0293
    const serialNumber = qrParts[2];     // SR000023
    const assetCodeDisplay = qrParts[3]; // CHLR2026000005

    // 🔹 3. QR image
    const qrDataUrl = await QRCode.toDataURL(qrRaw, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      width: 240,
    });

    // 🔹 4. HTML
    const htmlContent = `
<div style="width:90vw;height:90vh;display:flex;justify-content:center;align-items:center;background:#fff;">
  <div style="width:600px;height:380px;border:6px solid #e30613;border-radius:18px;
    padding:22px 26px;font-family:Arial;display:flex;box-sizing:border-box;">
    
    <div style="width:52%;display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div style="margin-bottom:18px;">${logoHtml}</div>

        <div style="margin-bottom:14px;">
          <div style="font-weight:700;margin-bottom:6px;">Asset Code:</div>
          <div style="border:1.5px solid #000;border-radius:8px;padding:10px 14px;font-weight:600;">
            ${assetCodeDisplay}
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="font-weight:700;margin-bottom:6px;">Serial NO:</div>
          <div style="border:1.5px solid #000;border-radius:8px;padding:10px 14px;font-weight:600;">
            ${serialNumber}
          </div>
        </div>

        <div>
          <div style="font-weight:700;margin-bottom:6px;">Model:</div>
          <div style="border:1.5px solid #000;border-radius:8px;padding:10px 14px;font-weight:600;">
            ${model}
          </div>
        </div>
      </div>

      <div style="font-weight:700;text-align:center;">
        Property Of Hariss International Ltd.
      </div>
    </div>

    <div style="width:48%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;">
      <img src="${qrDataUrl}" style="width:250px;height:250px;" />
      <div style="font-size:18px;font-weight:800;color:#e30613;">
        Call Free : 0800 299 008
      </div>
    </div>
  </div>
</div>`;

    const element = document.createElement("div");
    element.innerHTML = htmlContent;

    html2pdf()
      .set({
        margin: 0,
        filename: `asset-label-${assetCodeDisplay}.pdf`,
        image: { type: "png", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "landscape", unit: "px", format: [1300, 1000] },
      })
      .from(element)
      .save();

  } catch (error) {
    console.error("PDF generation error:", error);
  }
};
