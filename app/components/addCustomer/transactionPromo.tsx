"use client";
import { useState } from "react";
import FormCard from "./cordAddCustomer";

export default function TransactionPromo() {
  const [promoTxn, setPromoTxn] = useState("no");

  return (
    <FormCard title="Transaction & Promotion">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Barcode */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm leading-5 text-[#414651] mb-1">
            Enter Barcode
          </label>
          <input
            type="text"
            placeholder="Enter Barcode"
           className=" px-3 py-2 bg-[#FFFFFF] h-[44px] opacity-100 rounded-[8px]  gap-[8px] pt-[10px] pr-[14px] pb-[10px] pl-[14px] flex items-center shadow-[0px_1px_2px_0px_#0A0D120D] border border-[#D5D7DA] font-family: Inter;
font-weight: 400;
font-size: 16px;
leading-trim: NONE;
line-height: 24px;
letter-spacing: 0%;
text-[#717680]
"
          />
        </div>

        {/* Enable Promo Txn */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm leading-5 text-[#414651] mb-1">
            Enable Promo Txn
          </label>
          <div className="flex items-center gap-6 h-[44px] border border-[#D5D7DA] rounded-lg px-3 py-2 shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]">
            <label className="flex items-center gap-2 text-sm text-[#344054]">
              <input
                type="radio"
                name="promoTxn"
                value="yes"
                checked={promoTxn === "yes"}
                onChange={() => setPromoTxn("yes")}
              />
              Yes
            </label>
            <label className="flex items-center gap-2 text-sm text-[#344054]">
              <input
                type="radio"
                name="promoTxn"
                value="no"
                checked={promoTxn === "no"}
                onChange={() => setPromoTxn("no")}
              />
              No
            </label>
          </div>
        </div>

        {/* Assign QR Value */}
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm leading-5 text-[#414651] mb-1">
            Assign QR Value
          </label>
          <input
            type="text"
            placeholder="Enter QR Value"
           className=" px-3 py-2 bg-[#FFFFFF] h-[44px] opacity-100 rounded-[8px]  gap-[8px] pt-[10px] pr-[14px] pb-[10px] pl-[14px] flex items-center shadow-[0px_1px_2px_0px_#0A0D120D] border border-[#D5D7DA] font-family: Inter;
font-weight: 400;
font-size: 16px;
leading-trim: NONE;
line-height: 24px;
letter-spacing: 0%;
text-[#717680]
"
          />
        </div>
      </div>
    </FormCard>
  );
}
