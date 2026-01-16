"use client";

import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { callRegisterList, callRegisterGlobalSearch, exportCallRegister } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { downloadFile } from "@/app/services/allApi";
const dropdownDataList = [
    { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
    { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function CallRegister() {
    const { can, permissions } = usePagePermissions();
    const { setLoading } = useLoading();
    const [showDropdown, setShowDropdown] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [serarchQuery, setSearchQuery] = useState("");
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

    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const fetchServiceTypes = useCallback(
        async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
            setLoading(true);
            const res = await callRegisterList({
                page: pageNo.toString(),
                per_page: pageSize.toString(),
            });
            setLoading(false);
            if (res.error) {
                showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
                throw new Error("Unable to fetch the Chillers");
            } else {
                return {
                    data: res.data || [],
                    currentPage: res?.pagination?.page || 0,
                    pageSize: res?.pagination?.limit || 10,
                    total: res?.pagination?.totalPages || 0,
                };
            }
        }, []
    )
    const searchChiller = useCallback(
        async (query: string, pageSize: number = 10): Promise<listReturnType> => {
            setLoading(true);
            let res;
            setSearchQuery(query);
            res = await callRegisterGlobalSearch({
                search: query,
                per_page: pageSize.toString(),
            });

            setLoading(false);
            if (res.error) {
                showSnackbar(res.data.message || "failed to search the Chillers", "error");
                throw new Error("Unable to search the Chillers");
            } else {
                return {
                    data: res.data || [],
                    currentPage: res?.pagination?.page || 0,
                    pageSize: res?.pagination?.limit || 10,
                    total: res?.pagination?.totalPages || 0,
                };
            }
        }, []
    )

    useEffect(() => {
        setLoading(true);
    }, [])

    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await exportCallRegister({ format, search: serarchQuery });
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
        } finally {
        }
    };

    return (
        <>
            {/* Table */}
            <div className="h-full">
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: {
                            list: fetchServiceTypes,
                            search: searchChiller
                        },
                        header: {
                            title: "Call Register",
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
                            searchBar: true,
                            columnFilter: true,
                            actions: can("create") ? [
                                <SidebarBtn
                                    key="name"
                                    href="/callRegister/add"
                                    leadingIcon="lucide:plus"
                                    label="Add"
                                    labelTw="hidden lg:block"
                                    isActive
                                />,
                            ] : [],
                        },
                        localStorageKey: "call-register-table",
                        table: {
                            height: 400
                        },
                        footer: { nextPrevBtn: true, pagination: true },
                        columns: [
                            { key: "osa_code", label: "Ticket Number" },
                            { key: "technician_name", label: "Technician Name" },
                            // { key: "chiller_code", label: "Chiller Code", showByDefault: true },
                            { key: "asset_number", label: "Asset Number" },
                            { key: "model_number", label: "Model Number", render: (row: TableDataType) => row.model_number?.name },
                            { key: "branding", label: "Branding", render: (row: TableDataType) => row.branding?.name },
                            { key: "nature_of_call", label: "Nature of Call" },

                            // Assigned Outlet
                            {
                                key: "assigned_outlet",
                                label: "Assigned Outlet Details",
                                render: (row: TableDataType) => (
                                    <span>
                                        {row.assigned_customer?.code} - {row.assigned_customer?.name}
                                    </span>
                                )
                            },

                            // Current Outlet
                            {
                                key: "current_outlet",
                                label: "Current Outlet Details",
                                render: (row: TableDataType) => (
                                    <span>
                                        {row.current_customer?.code} - {row.current_customer?.name}
                                    </span>
                                )
                            },

                            {
                                key: "approval_status",
                                label: "Approval Status"
                            },

                            {
                                key: "status",
                                label: "Status",
                                render: (data: TableDataType) => (
                                    <StatusBtn isActive={data.status && data.status.toString() === "1" ? true : false} />
                                )
                            },
                        ],
                        // rowSelection: true,
                        rowActions: [
                            {
                                icon: "lucide:eye",
                                onClick: (data: TableDataType) => {
                                    router.push(`/callRegister/details/${data.uuid}`);
                                },
                            },
                            ...(can("edit") ? [{
                                icon: "lucide:edit-2",
                                onClick: (data: TableDataType) => {
                                    router.push(`/callRegister/${data.uuid}`);
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