"use client"

import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function CustomerDetailsForm() {
  const [customerType, setCustomerType] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [sapId, setSapId] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [outletChannel, setOutletChannel] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      <InputFields
        label="Customer Type"
        value={customerType}
        onChange={(e) => setCustomerType(e.target.value)}
        options={[
          { value: "retail", label: "Retail" },
          { value: "wholesale", label: "Wholesale" },
          { value: "distributor", label: "Distributor" },
        ]}
      />


      <InputFields
        label="Customer Code"
        value={customerCode}
        onChange={(e) => setCustomerCode(e.target.value)}
      />

      <InputFields
        label="SAP ID"
        value={sapId}
        onChange={(e) => setSapId(e.target.value)}
      />

      <InputFields
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={[
          { value: "retail", label: "Retail" },
          { value: "wholesale", label: "Wholesale" },
          { value: "distributor", label: "Distributor" },
        ]}
      />

      <InputFields
        label="Sub Category"
        value={subCategory}
        onChange={(e) => setSubCategory(e.target.value)}
        options={[
          { value: "retail", label: "Retail" },
          { value: "wholesale", label: "Wholesale" },
          { value: "distributor", label: "Distributor" },
        ]}
      />

      <InputFields
        label="Outlet Channel"
        value={outletChannel}
        onChange={(e) => setOutletChannel(e.target.value)}
        options={[
          { value: "retail", label: "Retail" },
          { value: "wholesale", label: "Wholesale" },
          { value: "distributor", label: "Distributor" },
        ]}
      />
    </div>
  );
}
