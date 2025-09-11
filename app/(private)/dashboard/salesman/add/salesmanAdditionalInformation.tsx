"use client";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";
import CustomSecurityCode from "@/app/components/customSecurityCode";
import CustomDate from "@/app/components/customDate";
export default function SalesmanAdditionalInformation() {
  const [securityCode, setSecurityCode] = useState("");
  const [salesmanRoute, setSalesmanRoute] = useState("");

  const [date, setDate] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <CustomDate
        label="Joining Date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="User ID"
      />
      <CustomSecurityCode
        label="Security Code"
        value={securityCode}
        onChange={(e) => setSecurityCode(e.target.value)}
        placeholder="User ID"
      />
      <InputFields
        label="Salesman Route"
        value={salesmanRoute}
        onChange={(e) => setSalesmanRoute(e.target.value)}
        options={[
          { value: "mxecutive-GT", label: "Sales Executive-GT" },
          { value: "merchandiser", label: "Merchandiser" },
          { value: "Salesman", label: "Salesman" },
        ]}
      />

      {/* Second Row - Accuracy + Days */}
    </div>
  );
}
