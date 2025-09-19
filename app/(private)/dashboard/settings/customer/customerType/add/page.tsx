"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";

import BorderIconButton from "@/app/components/borderIconButton";
import CustomDropdown from "@/app/components/customDropdown";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { customerTypeList, deleteCustomerType } from "@/app/services/allApi";

// 🔹 API response type
interface CustomerType {
  id?: string | number;
  code?: string;
  name?: string;
  status?: string;
  [key: string]: string | number | undefined;
}

// 🔹 Dropdown menu items
const dropdownDataList = [
  { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
  { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
  { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

// 🔹 Table columns
const columns = [
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
];

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerType | null>(null);

  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  // normalize table data
  const tableData: TableDataType[] = customers.map((c) => ({
    id: c.id?.toString() ?? "",
    code: c.code ?? "",
    name: c.name ?? "",
    status: c.status === "active" ? "Active" : "Inactive",
  }));

  // fetch list
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customerTypeList();
        setCustomers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch customer types ❌", error);
      }
    };

    fetchCustomerTypes();
  }, []);

  // ✅ Formik setup
  const formik = useFormik({
    initialValues: {
      customerType: "",
      customerCode: "",
      status: "active",
    },
    validationSchema: Yup.object({
      customerType: Yup.string().required("Customer type is required"),
      customerCode: Yup.string().required("Customer code is required"),
      status: Yup.string().required("Status is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      console.log("Submitting values:", values);
      try {
        const res = await addCustomerType(values);
        console.log("✅ Customer Type Added:", res);
        alert("Customer type added successfully!");
        resetForm();
      } catch (error) {
        console.error("❌ Add Customer Type failed", error);
        alert("Failed to add customer type");
      }
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[20px] font-semibold text-[#181D27]">Customer Type</h1>

        <div className="flex gap-[12px] relative">
          <BorderIconButton icon="gala:file-document" label="Export CSV" />
          <BorderIconButton icon="mage:upload" />

          <DismissibleDropdown
            isOpen={showDropdown}
            setIsOpen={setShowDropdown}
            button={<BorderIconButton icon="ic:sharp-more-vert" />}
            dropdown={
              <div className="absolute top-[40px] right-0 z-30 w-[226px]">
                <CustomDropdown>
                  {dropdownDataList.map((link, idx) => (
                    <div
                      key={idx}
                      className="px-[14px] py-[10px] flex items-center gap-[8px] hover:bg-[#FAFAFA]"
                    >
                      <Icon
                        icon={link.icon}
                        width={link.iconWidth}
                        className="text-[#717680]"
                      />
                      <span className="text-[#181D27] font-[500] text-[16px]">
                        {link.label}
                      </span>
                    </div>
                  ))}
                </CustomDropdown>
              </div>
            }
          />
        </div>
      </div>

      <form onSubmit={formik.handleSubmit}>
        {/* Customer Type Details */}
        <ContainerCard>
          <h2 className="text-lg font-semibold mb-6">Customer Type Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Customer Type Dropdown */}
            <InputFields
              type="select"
              name="customerType"
              label="Customer Type"
              value={formik.values.customerType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customerType && formik.errors.customerType}
              options={customerTypes}
            />

            {/* Customer Code */}
            <InputFields
              type="text"
              name="customerCode"
              label="Customer Code"
              value={formik.values.customerCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.customerCode && formik.errors.customerCode}
            />

            {/* Status */}
            <InputFields
              type="select"
              name="status"
              label="Status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && formik.errors.status}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>
        </ContainerCard>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
            type="button"
            onClick={() => formik.resetForm()}
          >
            Cancel
          </button>

          <SidebarBtn
            label="Submit"
            isActive={true}
            leadingIcon="mdi:check"
            type="submit"
          />
        </div>
      )}
    </>
  );
}