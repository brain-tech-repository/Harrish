"use client";

import { useState, useEffect } from "react";
import Table, { TableDataType } from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import StatusBtn from "@/app/components/statusBtn2";
import { downloadFile } from "@/app/services/allApi";
import { formatWithPattern } from "@/app/(private)/utils/date";
import { useLoading } from "@/app/services/loadingContext";
import { compensationReportExport, compensationReportList } from "@/app/services/companyTransaction";
import { toInternationalNumber } from "@/app/(private)/utils/formatNumber";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";


const columns = [
    { key: "sap_id", label: "SAP Code", showByDefault: true },
  {
    key: "invoice_date",
    label: "Date",
    showByDefault: true,
    render: (row: TableDataType) => {
      if (!row.invoice_date) return "-";
      return (
        formatWithPattern(
          new Date(row.invoice_date),
          "DD MMM YYYY",
          "en-GB",
        ).toLowerCase() || "-"
      );
    },
  },
  { key: "invoice_code", label: "Invoice Code", showByDefault: true },
   {
          key: "warehouse_code", label: "Distributor", showByDefault: true,
          render: (row: TableDataType) => {
              const code = row.warehouse_code || "-";
              const name = row.warehouse_name || "-";
              return `${code}${code && name ? " - " : "-"}${name}`;
          }
      },
  { key: "item_category_dll", label: "Compensation Code", showByDefault: true },
   {
      key: "erp_code", label: "Item", showByDefault: true,
      render: (row: TableDataType) => {
        const code = row.erp_code || "-";
        const name = row.item_name || "-";
        return `${code}${code && name ? " - " : "-"}${name}`;
      }
    },
  { key: "base_uom_vol_calc", label: "Facotry Price", showByDefault: true, render: (row: TableDataType) => (row.base_uom_vol_calc) ?? "-" },
  { key: "alter_base_uom_vol_calc", label: "Purchase Price", showByDefault: true, render: (row: TableDataType) => (row.alter_base_uom_vol_calc) ?? "-" },
  { key: "quantity", label: "Free Quantity", showByDefault: true, render: (row: TableDataType) => toInternationalNumber(row.quantity) ?? "-" },
  { key: "total_amount", label: "Amount", showByDefault: true, render: (row: TableDataType) => <>{toInternationalNumber(row.total_amount) || '0.00'}</> },
  {
    key: "status",
    label: "Status",
    render: (row: TableDataType) => {
      // Treat status 1 or 'active' (case-insensitive) as active
      const isActive =
        String(row.status) === "1" ||
        (typeof row.status === "string" &&
          row.status.toLowerCase() === "active");
      return <StatusBtn isActive={isActive} />;
    },
  },
];

export default function CustomerInvoicePage() {
  const { can, permissions } = usePagePermissions();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Pagination and data state
  const [loading, setLocalLoading] = useState(false);
  const [reportData, setReportData] = useState({
    data: [],
    pagination: {
      total: 0,
      currentPage: 1,
      pageSize: 50,
    },
  });
  const [threeDotLoading, setThreeDotLoading] = useState({ csv: false, xlsx: false });
  const [hasData, setHasData] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  // Paginated fetch function
  const fetchReportData = async (page = 1, pageSize = 50, filterParams: Record<string, string> = {}) => {
    setLocalLoading(true);
    try {
      const params: Record<string, string> = { ...filterParams, page: String(page), per_page: String(pageSize) };
      const res = await compensationReportList(params);
      const pagination = res?.pagination || {};
      setReportData({
        data: Array.isArray(res.data) ? res.data : [],
        pagination: {
          total: pagination.last_page || (res.data ? res.data.length : 0),
          currentPage: (pagination.current_page || page) - 1,
          pageSize: pagination.per_page || pageSize,
        },
      });
      setHasData(Array.isArray(res.data) && res.data.length > 0);
      setLocalLoading(false);
      return {
        data: res.data || [],
        total: pagination.last_page || 0,
        currentPage: pagination.current_page || page,
        pageSize: pagination.per_page || pageSize,
      };
    } catch (err) {
      setReportData({
        data: [],
        pagination: { total: 0, currentPage: 1, pageSize: 50 },
      });
      setHasData(false);
      setLocalLoading(false);
      return {
        data: [],
        total: 0,
        currentPage: 1,
        pageSize: 50,
      };
    }
    finally{
      setLoading(false);
    }
  };

  // Export logic (reuse filters)
  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const payload: Record<string, any> = { format, ...filters };
      const response = await compensationReportExport(payload);
      if (response && typeof response === "object" && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      showSnackbar("Failed to download warehouse data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  // Handle filter changes (for filterByFields)
  const handleFilter = async (payload: Record<string, string | number | null>, pageSize: number) => {
    const filterParams: Record<string, string> = {};
    Object.keys(payload || {}).forEach((k) => {
      const v = payload[k as keyof typeof payload];
      if (v !== null && typeof v !== "undefined" && String(v) !== "") {
        filterParams[k] = String(v);
      }
    });
    setFilters(filterParams);
    return await fetchReportData(1, pageSize, filterParams);
  };

  return (
    <div className="flex flex-col h-full">
      
        <Table
          refreshKey={refreshKey}
          data={{
            data: reportData.data,
            total: reportData.pagination.total,
            currentPage: reportData.pagination.currentPage,
            pageSize: reportData.pagination.pageSize,
          }}
          config={{
            showNestedLoading:false,
            api: {
              list: async (pageNo, pageSize) => {
                // Table expects 1-based pageNo
                return await fetchReportData(pageNo, pageSize, filters);
              },
              filterBy: handleFilter,
            },
            header: {
              title: "Compensation Report",
              columnFilter: true,
              searchBar: false,
              threeDot: hasData
                ? [
                    {
                      icon: threeDotLoading.csv
                        ? "eos-icons:three-dots-loading"
                        : "gala:file-document",
                      label: "Export CSV",
                      labelTw: "text-[12px] hidden sm:block",
                      onClick: () => !threeDotLoading.csv && exportFile("csv"),
                    },
                    {
                      icon: threeDotLoading.xlsx
                        ? "eos-icons:three-dots-loading"
                        : "gala:file-document",
                      label: "Export Excel",
                      labelTw: "text-[12px] hidden sm:block",
                      onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                    },
                  ]
                : undefined,
              filterByFields: [
                {
                  key: "from_date",
                  label: "Start Date",
                  type: "date",
                },
                {
                  key: "to_date",
                  label: "End Date",
                  type: "date",
                },
              ],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowSelection: true,
            localStorageKey: "invoice-table",
            pageSize: reportData.pagination.pageSize,
          }}
        />
      
    </div>
  );
}
