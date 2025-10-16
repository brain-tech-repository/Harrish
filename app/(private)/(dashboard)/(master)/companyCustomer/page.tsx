"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/app/components/customDropdown";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import { Icon } from "@iconify-icon/react";
import Table, { TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Loading from "@/app/components/Loading";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import {
  getCompanyCustomers,
  deleteCompanyCustomer,
  exportCompanyCustomerData,
  companyCustomerStatusUpdate,
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";

/* ---------- Types ---------- */
interface CustomerItem {
  id: number;
  sap_code: string;
  customer_code: string;
  business_name: string;
  owner_name: string;
  owner_no: string;
  whatsapp_no: string;
  email: string;
  language: string;
  contact_no2: string;
  road_street: string;
  town: string;
  landmark: string;
  district: string;
  balance: number;
  payment_type: string;
  bank_name: string;
  bank_account_number: string;
  creditday: string;
  tin_no: string;
  accuracy: string;
  creditlimit: number;
  guarantee_name: string;
  guarantee_amount: number;
  guarantee_from: string;
  guarantee_to: string;
  totalcreditlimit: number;
  credit_limit_validity: string;
  vat_no: string;
  longitude: string;
  latitude: string;
  threshold_radius: number;
  dchannel_id: number;
  status: number;
  created_user: number;
  updated_user: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Dropdown Menu ---------- */
const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
];

/* ========================================================= */
export default function CompanyCustomers() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { setLoading } = useLoading();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<CustomerItem | null>(null);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  // Fetch customers
  useEffect(() => {
    const fetchCompanyCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCompanyCustomers();

        const customersData = data.data // Wrap single object
        console.log("Fetched Customers:", data);

        setCustomers(customersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyCustomers();
  }, []); // 🔴 Use empty dependency array, NOT showSnackbar

  /* ---------- Map to TableData ---------- */
  const tableData: TableDataType[] = customers.map((c) => ({
    id: c.id.toString(),
    sap_code: c.sap_code,
    customer_code: c.customer_code,
    business_name: c.business_name,

    owner_name: c.owner_name,
    owner_no: c.owner_no,

    whatsapp_no: c.whatsapp_no,
    email: c.email,
    language: c.language,
    district: c.district,
    balance: c.balance.toString(),
  payment_type: (String(c.payment_type) === '1') ? 'Cash' : (String(c.payment_type) === '2') ? 'Credit' : String(c.payment_type),
    creditlimit: c.creditlimit.toString(),
    totalcreditlimit: c.totalcreditlimit.toString(),
    status: c.status === 1 ? "Active" : "Inactive",
  }));
  // Delete handler
  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    // Optimistically remove row first
    setCustomers((prev) => prev.filter((c) => c.id !== selectedRow.id));
    setShowDeletePopup(false);

    setLoading(true);
    try {
      await deleteCompanyCustomer(selectedRow.id.toString());
      showSnackbar("Company Customer deleted successfully ✅", "success");
    } catch (error) {
      setCustomers((prev) => [...prev, selectedRow]);
      showSnackbar("Failed to delete Customer ❌", "error");
    } finally {
      setSelectedRow(null);
    }
    setLoading(false);
  };


  /* ---------- Column Configuration ---------- */
  const columns = [
    { key: "customer_code", label: "Customer Code",render: (row: TableDataType) => (
            <span className="font-semibold text-[#181D27] text-[14px]">
                {row.customer_code}
            </span>
        ), showByDefault: true },
    { key: "sap_code", label: "SAP Code", render: (row: TableDataType) => (
        <span className="font-semibold text-[#181D27] text-[14px]">
            {row.sap_code}
        </span>
    ),},
    { key: "owner_name", label: "Owner Name", showByDefault: true },
    { key: "owner_no", label: "Owner Number" },
    { key: "business_name", label: "Business Name" },
    { key: "whatsapp_no", label: "WhatsApp No" },
    { key: "email", label: "Email" },
    { key: "district", label: "District" },
    { key: "balance", label: "Balance" },
    { key: "creditlimit", label: "Credit Limit" },
    { key: "totalcreditlimit", label: "Total Credit Limit" },
    { key: "payment_type", label: "Payment Type" },
    { key: "language", label: "Language" },
    {
      key: "status",
      label: "Status",
      showByDefault: true,
      render: (row: TableDataType) => (
        <span
          className={`text-sm p-1 px-4 rounded-xl text-[12px] font-[500] ${
            row.status === "Active"
              ? "text-[#027A48] bg-[#ECFDF3]"
              : "text-red-700 bg-red-200"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const exportFile = async (ids: string[] | undefined) => {
    if(!ids) return;
    try {
      const response = await exportCompanyCustomerData({ids}); 
      let fileUrl = response;
      if (response && typeof response === 'object' && response.url) {
        fileUrl = response.url;
      }
      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
    } finally {
    }
  }

  const handleStatusChange = async (ids: (string | number)[] | undefined, status: number) => {
      if (!ids || ids.length === 0) return;
      const res = await companyCustomerStatusUpdate({
          ids: ids,
          status: Number(status)
      });

      if (res.error) {
          showSnackbar(res.data.message || "Failed to update status", "error");
          throw new Error(res.data.message);
      }
      setRefreshKey(refreshKey + 1);
      showSnackbar("Status updated successfully", "success");
      return res;
  }

  /* ---------- Render ---------- */
  return (
    <>


      {/* Table */}
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            header: {
              title: "Company Customer",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const ids = selectedRow?.map((id) => {
                        return data[id].id;
                    })
                    exportFile(ids || [])
                  },
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    const ids = selectedRow?.map((id) => {
                        return data[id].id;
                    })
                    exportFile(ids || [])
                  },
                },
                {
                  icon: "lucide:radio",
                  label: "Inactive",
                  // showOnSelect: true,
                  showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                      if(!selectedRow || selectedRow.length === 0) return false;
                      const status = selectedRow?.map((id) => data[id].status).map(String);
                      console.log(status, "status");
                      return status?.includes("1") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                      const status: string[] = [];
                      const ids = selectedRow?.map((id) => {
                          const currentStatus = data[id].status;
                          if(!status.includes(currentStatus)){
                              status.push(currentStatus);
                          }
                          return data[id].id;
                      })
                      handleStatusChange(ids, Number(0));
                  },
              },
              {
                  icon: "lucide:radio",
                  label: "Active",
                  // showOnSelect: true,
                  showWhen: (data: TableDataType[], selectedRow?: number[]) => {
                      if(!selectedRow || selectedRow.length === 0) return false;
                      const status = selectedRow?.map((id) => data[id].status).map(String);
                      console.log(status, "status");
                      return status?.includes("0") || false;
                  },
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                      const status: string[] = [];
                      const ids = selectedRow?.map((id) => {
                          const currentStatus = data[id].status;
                          if(!status.includes(currentStatus)){
                              status.push(currentStatus);
                          }
                          return data[id].id;
                      })
                      handleStatusChange(ids, Number(1));
                  },
              },
              ],
              searchBar: true,
              columnFilter: true,
              actions: [
                <SidebarBtn
                  key="add-company-customer"
                  href="/companyCustomer/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden sm:block"
                  isActive
                />,
              ],
            },
            localStorageKey: "company-customers-table",
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/companyCustomer/details/${data.id}`);
                },
              },
              {
                icon: "lucide:edit-2",
                onClick: (row: TableDataType) => {
                  console.log(row)
                  router.push(
                    `/companyCustomer/${row.id}`
                  )
                }
              },
              // {
              //   icon: "lucide:trash-2",
              //   onClick: (row: TableDataType) => {
              //     const fullRow = customers.find(
              //       (c) => c.id.toString() === row.id
              //     );
              //     if (fullRow) {
              //       setSelectedRow(fullRow);
              //       setShowDeletePopup(true);
              //     }
              //   },
              // },
            ],
            pageSize: 50,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Company Customer"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
