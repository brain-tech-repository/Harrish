"use client";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function CustomerTransactionPromotion() {
    const [barcode, setBarcode] = useState("");
    const [assignQrValue, setAssignQrValue] = useState("");
    const [enablePromo, setEnablePromo] = useState<"yes" | "no" | "">("");

    // Enable submit only if both inputs are filled and promo is selected
   

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputFields
                label="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
            />

            {/* Enable Promo Radio */}
            <div>
                <label className="block mb-2 font-medium text-gray-700">Enable Promo</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="enablePromo"
                            value="yes"
                            checked={enablePromo === "yes"}
                            onChange={() => setEnablePromo("yes")}
                        />
                        Yes
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="enablePromo"
                            value="no"
                            checked={enablePromo === "no"}
                            onChange={() => setEnablePromo("no")}
                        />
                        No
                    </label>
                </div>
            </div>

            <InputFields
                label="Assign QR Value"
                value={assignQrValue}
                onChange={(e) => setAssignQrValue(e.target.value)}
            />



        </div>
    );
}
