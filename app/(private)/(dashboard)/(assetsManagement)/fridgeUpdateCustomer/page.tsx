"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { fridgeUpdateCustomerList,   exportFridgeCustomer, FridgeCustomerGlobalSearch } from "@/app/services/assetsApi";
import { FridgeUpdate } from "@/app/services/allApi";
import { downloadFile } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";
import filterFridge from "@/app/components/filterFridge";
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function FridgeUpdateCustomer() {
    const { can, permissions } = usePagePermissions();
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [payload, setPayload] = useState({});
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const Status: Record<string, string> = {
        "1": "Sales Team Requested",
        "2": "Area Sales Manager Accepted",
        "3": "Area Sales Manager Rejected",
        "4": "Chiller officer Accepted",
        "5": "Chiller officer Rejected",
        "6": "Completed",
        "7": "Chiller Manager Rejected",
    };

    const router = useRouter();
    const { showSnackbar } = useSnackbar();

const filterBy = useCallback(
  async (
    payload: Record<string, string | number | string[] | null>,
    pageSize: number
  ): Promise<listReturnType> => {
    let result;

    try {
      const params: Record<string, string> = {
        per_page: pageSize.toString(),
      };

      Object.keys(payload || {}).forEach((key) => {
        const value = payload[key];
        if (
          value !== null &&
          value !== undefined &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          params[key] = Array.isArray(value)
            ? value.join(",")
            : String(value);
        }
      });

      result = await FridgeUpdate(params);
    } catch (err) {
      throw new Error(String(err));
    }

    if (result?.error) {
      throw new Error(result?.data?.message || "Filter failed");
    }

    const rows = Array.isArray(result?.data)
      ? result.data
      : result?.data
      ? [result.data]
      : [];

    return {
      data: rows,
      total: result?.pagination?.totalPages || rows.length,
      currentPage: result?.pagination?.page || 1,
      pageSize: result?.pagination?.limit || pageSize,
    };
  },
  []
);







    const fetchServiceTypes = useCallback(
        async (pageNo: number = 1, pageSize: number = 10, filters: Record<string, any> = {})
         
        : Promise<listReturnType> => {
            setLoading(true);
            const res = await fridgeUpdateCustomerList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
                 ...filters,
            });
            setLoading(false);
            if (res.error) {
                showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
                throw new Error("Unable to fetch the Chillers");
            } else {


           
  const tableData = Array.isArray(res.data)
    ? res.data
    : res.data
      ? [res.data]
      : [];



                return {
                    data: tableData || [],
                    currentPage: res?.pagination?.page || 0,
                    pageSize: res?.pagination?.limit || 10,
                    // total: res?.pagination?.totalPages || 0,
                    total: res?.pagination?.totalPages || tableData.length,
                };
            }
        }, []
    )
    const searchChiller = useCallback(
        async (
            query: string,
            pageSize: number = 10,
            columnName?: string
        ): Promise<listReturnType> => {
            try {
                setSearchQuery(query);
                setLoading(true);
                const res = await FridgeCustomerGlobalSearch({
                    search: query,
                    per_page: pageSize.toString(),
                });

                if (res?.error) {
                    showSnackbar(
                        res?.data?.message || "Failed to search the Chillers",
                        "error"
                    );
                    throw new Error("Unable to search the Chillers");
                }

                return {
                    data: res?.data || [],
                    currentPage: res?.pagination?.page || 0,
                    pageSize: res?.pagination?.limit || pageSize,
                    total: res?.pagination?.totalPages || 0,
                };
            } finally {
                // ✅ always runs (success or error)
                setLoading(false);
            }
        },
        []
    );

    // const handleExport = async (fileType: "csv" | "xlsx") => {
    //     try {
    //         setLoading(true);

    //         const res = await assetsMasterExport({ format: fileType });

    //         let downloadUrl = "";

    //         if (res?.url && res.url.startsWith("blob:")) {
    //             downloadUrl = res.url;
    //         } else if (res?.url && res.url.startsWith("http")) {
    //             downloadUrl = res.url;
    //         } else if (typeof res === "string" && res.includes(",")) {
    //             const blob = new Blob([res], {
    //                 type:
    //                     fileType === "csv"
    //                         ? "text/csv;charset=utf-8;"
    //                         : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //             });
    //             downloadUrl = URL.createObjectURL(blob);
    //         } else {
    //             showSnackbar("No valid file or URL returned from server", "error");
    //             return;
    //         }

    //         // ⬇️ Trigger browser download
    //         const link = document.createElement("a");
    //         link.href = downloadUrl;
    //         link.download = `assets_export.${fileType}`;
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);

    //         showSnackbar(
    //             `Download started for ${fileType.toUpperCase()} file`,
    //             "success"
    //         );
    //     } catch (error) {
    //         console.error("Export error:", error);
    //         showSnackbar("Failed to export Assets Master data", "error");
    //     } finally {
    //         setLoading(false);
    //         setShowExportDropdown(false);
    //     }
    // };


    useEffect(() => {
        setLoading(true);
    }, [])

    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportFridgeCustomer({ format, search: searchQuery });
            if (response && typeof response === "object" && response.download_url) {
                await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } catch (error) {
            showSnackbar("Failed to download fridge customer data", "error");
            setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
        } finally {
        }
    };

    return (
        <>
            {/* Table */}
            <div className="flex flex-col h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchServiceTypes,
                            filterBy: filterBy,
                             
                            search: searchChiller
                        },
                        header: {
                            title: "Fridge Update Customer",
                            threeDot: [
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
                            ],
                            searchBar: false,
                            columnFilter: true,
                            filterRenderer:filterFridge,
                        },
                        localStorageKey: "fridgeUpdateCustomerTable",
                        table: {
                            height: 400
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns: [
                            {
                                key: "osa_code", label: "Code",
                                render: (row: TableDataType) => (
                                    <span className="font-semibold text-[#181D27] text-[14px]">
                                        {row.osa_code}
                                    </span>
                                ),
                            },
                            { key: "created_at", label: "Date", render: (row: TableDataType) =>
                                 formatDate(row.created_at) },

//                              {
//   key: "warehouse",
//   label: "Distributor",
//   render: (row: TableDataType) => {
//     return row?.warehouse?.name || "-";
//   },
// }  ,  

{
  key: "warehouse",
  label: "Distributor",
  render: (row: TableDataType) => {
    const { name, code } = row?.warehouse || {};
    if (!name) return "-";
    return code ? `${name} (${code})` : name;
  },
}
,








                                 
                            { key: "agent", label: "Agent" },
                            { key: "area_manager", label: "Area Manager" },
                            { key: "outlet_name", label: "Outlet Name" },
                            { key: "location", label: "Location" },
                            { key: "contact_number", label: "Contact Number" },
                            { key: "outlet_type", label: "Outlet Type" },
                            { key: "serial_no", label: "Captured Serial No." },
                            { key: "asset_number", label: "Asset Number" },
                            { key: "model", label: "Model Number" },
                            { key: "brand", label: "Branding" },
                            { key: "remark", label: "Remarks" },
                            { key: "approval_status", label: "Approval Status" },
                            
                             
                            {
                                key: "status",
                                label: "Status",
                                render: (data: TableDataType) => {
                                    const statusKey = String(data.status);
                                    return Status[statusKey] ?? "-";
                                },
                            },
                        ],
                        // rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: TableDataType) => {
                                    router.push(`/fridgeUpdateCustomer/view/${data.uuid}`);
                                },
                            },
                            ...(can("edit") ? [{
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(`/fridgeUpdateCustomer/${data.uuid}`);
                                },
                            }] : []),
                        ],
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}