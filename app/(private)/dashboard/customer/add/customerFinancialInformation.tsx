"use client";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function FinancialInformation() {
  const [form, setForm] = useState({
    credit: "",
    creditLimit: "",
    paymentType: "",
    creditDays: "",
    feesType: "",
    vatNo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const paymentTypes = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "credit", label: "Credit" },
  ];

  const feesTypes = [
    { value: "service", label: "Service Fee" },
    { value: "transaction", label: "Transaction Fee" },
    { value: "other", label: "Other" },
  ];

  return (
   

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Credit Limit */}
        <InputFields
          id="creditLimit"
          label="Credit Limit"
          value={form.creditLimit}
          onChange={handleChange}
        />

        {/* Payment Type */}
        <InputFields
          id="paymentType"
          label="Payment Type"
          value={form.paymentType}
          onChange={handleChange}
          options={paymentTypes}
        />

        {/* Credit Days */}
        <InputFields
          id="creditDays"
          label="Credit Days"
          value={form.creditDays}
          onChange={handleChange}
        />

        {/* Fees Type */}
        <InputFields
          id="feesType"
          label="Fees Type"
          value={form.feesType}
          onChange={handleChange}
          options={feesTypes}
        />

        {/* VAT No */}
        <InputFields
          id="vatNo"
          label="VAT No"
          value={form.vatNo}
          onChange={handleChange}
        />
      </div>
   
  );
}
