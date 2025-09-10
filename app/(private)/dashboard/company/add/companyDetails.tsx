"use client"

import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function CompanyDetails() {
  const [companyType, setCompanyType] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      <InputFields
        label="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      
      <InputFields
        label="Company Type"
        value={companyType}
        onChange={(e) => setCompanyType(e.target.value)}
        options={[
          { value: "main", label: "Main" },
          { value: "branch", label: "Branch" },
          { value: "warehouse", label: "Warehouse" },
        ]}
      />


      <InputFields
        label="Company Code"
        value={companyCode}
        onChange={(e) => setCompanyCode(e.target.value)}
      />

      
      <InputFields 
  label="Company Logo" 
  type="file"
  value="companyLogo" 
  onChange={(e) => setCompanyLogo(e.target.value)} 
/>


     
    </div>
  );
}
