"use client";

import Logo from "@/app/components/logo";
import { QRCodeCanvas } from "qrcode.react";
import ContainerCard from "@/app/components/containerCard";
import { useRef } from "react";
import { forwardRef } from "react";
import {generateQR} from "@/app/utils/generateDeliveryPdf";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

interface AssetLabelProps {
  data: {
    qr_string: string; // 👈 FULL STRING COMING FROM API
  };
}

const AssetLabel = ({ data }: AssetLabelProps) => {
const targetRef = useRef<HTMLDivElement | null>(null);

  // ✅ RAW STRING
  const qrRaw =
    data?.qr_string ??
    "SRC 220UGBKLA;UG;BK;FUNFRUTI;31654151100003;NC/HIL/2016/220/0424";

  // ✅ SPLIT STRING
  const qrParts = qrRaw.split(";");
  // const rawModel = qrParts[0] || "";
  // const model = rawModel.split(" ").slice(0, 2).join(" ") || "-";

  // const model = qrParts[0] || "-";
  const rawModel = qrParts[0] || "";
  const modelParts = rawModel.split(" ");
  const model =
    modelParts.length >= 2
      ? `${modelParts[0]} ${modelParts[1].replace(/[A-Za-z]/g, "")}`
      : "-";
  
  const serialNumber = qrParts[4] || "-";
  const assetCode = qrParts[5] || "-";

  //  const generatePdf = async () => {
  //   if (!targetRef.current) return;

  //   const canvas = await html2canvas(targetRef.current, {
  //     scale: 2,
  //     useCORS: true,
  //   });

  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF({
  //     orientation: "landscape",
  //     unit: "px",
  //     format: [canvas.width, canvas.height],
  //   });

  //   pdf.addImage(
  //     imgData,
  //     "PNG",
  //     0,
  //     0,
  //     canvas.width,
  //     canvas.height
  //   );

  //   pdf.save(`asset-label-${assetCode}.pdf`);
  // };




  return (
    <div ref={targetRef}>
      <ContainerCard
        className="
          w-[600px]
          h-[380px]
          mx-auto
          border-[5px]
          border-red-600
          rounded-[20px]
          px-[32px]
          py-[24px]
          flex
          gap-[32px]
        "
      >
        {/* LEFT */}
        <div className="flex flex-col justify-between flex-1">
          <div>
            <div className="mb-[20px]">
              <Logo type="full" />
            </div>

            <div className="space-y-[14px] text-[15px]">
              <div>
                <div className="font-bold mb-[6px]">Asset Code:</div>
                <div className="border rounded-[6px] px-[14px] py-[8px] max-w-[360px] font-semibold">
                  {assetCode}
                </div>
              </div>

              <div>
                <div className="font-bold mb-[6px]">Serial NO:</div>
                <div className="border rounded-[6px] px-[14px] py-[8px] max-w-[360px] font-semibold">
                  {serialNumber}
                </div>
              </div>

              <div>
                <div className="font-bold mb-[6px]">Model:</div>
                <div className="border rounded-[6px] px-[14px] py-[8px] max-w-[360px]  font-semibold">
                  {model}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center font-semibold text-[14px]">
            Property of Hariss International Ltd.
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col items-center justify-between">
          <QRCodeCanvas
            value={qrRaw} // ✅ SAME FULL STRING
            size={240}
            level="H"
          />

          <div className="text-red-600 font-bold text-[18px]">
            Call free : 0800 299 008
          </div>
        </div>
      </ContainerCard>
    </div>
  );
};

export default AssetLabel;
