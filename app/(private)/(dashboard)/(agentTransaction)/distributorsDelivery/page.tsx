"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
    listReturnType,
    TableDataType,
    searchReturnType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { agentDeliveryExport, agentOrderExport, deliveryList,deliveryExportCollapse } from "@/app/services/agentTransaction";
import StatusBtn from "@/app/components/statusBtn2";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile } from "@/app/services/allApi";
import { formatWithPattern } from "@/app/(private)/utils/date";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import FilterComponent from "@/app/components/filterComponent";
import ApprovalStatus from "@/app/components/approvalStatus";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { downloadPDFGlobal } from "@/app/services/allApi";
// const dropdownDataList = [
//     // { icon: "lucide:layout", label: "SAP", iconWidth: 20 },
//     // { icon: "lucide:download", label: "Download QR Code", iconWidth: 20 },
//     // { icon: "lucide:printer", label: "Print QR Code", iconWidth: 20 },
//     { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
//     { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
// ];

export default function CustomerInvoicePage() {
    const { can, permissions } = usePagePermissions();
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState<number>(0);

    // Refresh table when permissions load
    useEffect(() => {
        if (permissions.length > 0) {
            setRefreshKey((prev) => prev + 1);
        }
    }, [permissions]);

    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const { warehouseOptions, customerSubCategoryOptions, companyOptions, salesmanOptions, agentCustomerOptions, channelOptions, warehouseAllOptions, routeOptions, regionOptions, areaOptions, ensureAgentCustomerLoaded, ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded, ensureWarehouseLoaded } = useAllDropdownListData();

    // Load dropdown data
    useEffect(() => {
        ensureAgentCustomerLoaded();
        ensureAreaLoaded();
        ensureChannelLoaded();
        ensureCompanyLoaded();
        ensureCustomerSubCategoryLoaded();
        ensureRegionLoaded();
        ensureRouteLoaded();
        ensureSalesmanLoaded();
        ensureWarehouseAllLoaded();
        ensureWarehouseLoaded();
    }, [ensureAgentCustomerLoaded, ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded, ensureWarehouseAllLoaded, ensureWarehouseLoaded]);

     const [warehouseId, setWarehouseId] = useState<string>("");
  const [salesmanId, setSalesmanId] = useState<string>("");

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [warehouseId, salesmanId]);

    // Memoize delivery data to avoid multiple API calls
    const [deliveryDataCache, setDeliveryDataCache] = useState<{ [key: string]: any }>({});
    const [deliveryCacheKey, setDeliveryCacheKey] = useState(0);

    // Helper to build cache key from params
    const getCacheKey = (params: Record<string, string | number>) => {
        return Object.entries(params).sort().map(([k, v]) => `${k}:${v}`).join("|");
    };

    // Unified fetch function with useRef for cache to avoid dependency issues
    const deliveryDataCacheRef = useRef<{ [key: string]: any }>({});
    
    const fetchDeliveryData = useCallback(async (params: Record<string, string | number>) => {
        const cacheKey = getCacheKey(params);
        if (deliveryDataCacheRef.current[cacheKey]) {
            return deliveryDataCacheRef.current[cacheKey];
        }
        setLoading(true);
        try {
            // Ensure all values are strings for deliveryList
            const stringParams: Record<string, string> = {};
            Object.entries(params).forEach(([k, v]) => {
                stringParams[k] = String(v);
            });
            const result = await deliveryList(stringParams);
            deliveryDataCacheRef.current[cacheKey] = result;
            setDeliveryDataCache((prev) => ({ ...prev, [cacheKey]: result }));
            return result;
        } catch (error) {
            showSnackbar("Failed to fetch invoices", "error");
            return null;
        } finally {
            setLoading(false);
        }
    }, [setLoading, showSnackbar]);

    // Fetch for table (list)
    const fetchDelivery = useCallback(async (
        page: number = 1,
        pageSize: number = 50
    ): Promise<listReturnType> => {
        // Add warehouseId to params if set
        const params: Record<string, string> = { page: page.toString(), per_page: pageSize.toString() };
        if (warehouseId) {
            params.warehouse_id = warehouseId;
        }
        if (salesmanId) {
            params.salesman_id = salesmanId;
        }
        const result = await fetchDeliveryData(params);
        if (!result) {
            return {
                data: [],
                total: 1,
                currentPage: 1,
                pageSize: pageSize,
            };
        }
        return {
            data: Array.isArray(result.data) ? result.data : [],
            total: result?.pagination?.last_page || 1,
            currentPage: result?.pagination?.current_page || 1,
            pageSize: result?.pagination?.per_page || pageSize,
        };
    }, [fetchDeliveryData, warehouseId, salesmanId]);

    // Fetch for filter
    const filterBy = useCallback(
        async (
            payload: Record<string, string | number | null>,
            pageSize: number
        ): Promise<listReturnType> => {
            const params: Record<string, string> = { per_page: pageSize.toString() };
            Object.keys(payload || {}).forEach((k) => {
                const v = payload[k as keyof typeof payload];
                if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                    params[k] = String(v);
                }
            });
            const result = await fetchDeliveryData(params);
            if (!result) {
                return {
                    data: [],
                    total: 1,
                    currentPage: 1,
                    pageSize: pageSize,
                };
            }
            if (result?.error) throw new Error(result.data?.message || "Filter failed");
            const pagination = result.pagination || {};
            return {
                data: result.data || [],
                total: pagination?.last_page || 1,
                totalRecords: pagination?.total || 0,
                currentPage: pagination?.current_page || 1,
                pageSize: pagination?.per_page || pageSize,
            };
        },
        [fetchDeliveryData, warehouseId, salesmanId]
    );

    const exportFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
            setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
            const response = await agentDeliveryExport({ format });
            if (response && typeof response === 'object' && response.download_url) {
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
      const exportCollapseFile = async (format: "csv" | "xlsx" = "csv") => {
        try {
          setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
          const response = await deliveryExportCollapse({ format });
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

    const downloadPdf = async (uuid: string) => {
        try {
            setLoading(true);
            const response = await agentDeliveryExport({ uuid: uuid, format: "pdf" });
            if (response && typeof response === 'object' && response.download_url) {
                 const fileName = `delivery-${uuid}.pdf`;
                await downloadPDFGlobal(response.download_url, fileName);
                // await downloadFile(response.download_url);
                showSnackbar("File downloaded successfully ", "success");
            } else {
                showSnackbar("Failed to get download URL", "error");
            }
        } catch (error) {
            showSnackbar("Failed to download file", "error");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
    {
        key: "delivery_date",
        label: "Delivery Date",
        showByDefault: true,
        render: (row: TableDataType) => {
            if (!row.delivery_date) return "-";
            const date = new Date(row.delivery_date as string);
            return formatWithPattern(new Date(row.delivery_date), "DD MMM YYYY", "en-GB").toLowerCase() || "-";
        }
    },
    { key: "delivery_code", label: "Delivery Code", showByDefault: true },
    // { key: "order_code", label: "Order Code",showByDefault: true },
    {
        key: "customer",
        label: "Customer",
        showByDefault: true,
        render: (row: TableDataType) => {
            const customer = typeof row.customer === "string" ? { code: "", name: row.customer } : (row.customer ?? {});
            const code = customer.code ?? "";
            const name = customer.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "route",
        label: "Route",
        showByDefault: true,
        render: (row: TableDataType) => {
            const route = typeof row.route === "string" ? { code: "", name: row.route } : (row.route ?? {});
            const code = route.code ?? "";
            const name = route.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        }
    },
    {
        key: "warehouse",
        label: "Distributor",
        showByDefault: true,
        render: (row: TableDataType) => {
            const warehouse = typeof row.warehouse === "string" ? { code: "", name: row.warehouse } : (row.warehouse ?? {});
            const code = warehouse.code ?? "";
            const name = warehouse.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
        filter: {
            isFilterable: true,
            width: 320,
            filterkey: "warehouse_id",
            options: Array.isArray(warehouseOptions) ? warehouseOptions : [],
            onSelect: (selected: string | string[]) => {
                setWarehouseId((prev) => (prev === selected ? "" : (selected as string)));
            },
            isSingle: false,
            selectedValue: warehouseId,
        },
    },
    {
        key: "salesman",
        label: "Sales Team",
        showByDefault: true,
        render: (row: TableDataType) => {
            const salesman = typeof row.salesman === "string" ? { code: "", name: row.salesman } : (row.salesman ?? {});
            const code = salesman.code ?? "";
            const name = salesman.name ?? "";
            if (!code && !name) return "-";
            return `${code}${code && name ? " - " : ""}${name}`;
        },
        filter: {
            isFilterable: true,
            width: 320,
            filterkey: "salesman_id",
            options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
            onSelect: (selected: string | string[]) => {
                setSalesmanId((prev) => (prev === selected ? "" : (selected as string)));
            },
            isSingle: false,
            selectedValue: salesmanId,
        },
    },
    // { key: "Invoice_type", label: "Invoice Type" },
    // { key: "Invoice_no", label: "Invoice No" },
    // { key: "sap_id", label: "SAP ID" },
    // { key: "sap_status", label: "SAP Status" },
    { key: "total", label: "Amount", showByDefault: true, render: (row: TableDataType) => toInternationalNumber(Number(row.total) || 0) },
    {
        key: "approval_status",
        label: "Approval Status",
        showByDefault: true,
        render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    },
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
        showByDefault: true,
    },
];

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchDelivery, filterBy: filterBy },
                    header: {
                        title: "Distributor's Delivery",
                        columnFilter: true,
                        searchBar: false,
                        threeDot: [
                            {
                                icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export CSV",
                                labelTw: "text-[12px] hidden sm:block",
                                onClick: () => !threeDotLoading.csv && exportFile("csv"),
                            },
                            {
                                icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export Excel",
                                labelTw: "text-[12px] hidden sm:block",
                                onClick: () => !threeDotLoading.xlsx && exportCollapseFile("xlsx"),
                            },
                        ],
                        actions: can("create") ? [
                            <SidebarBtn
                                key={1}
                                href="/distributorsDelivery/add"
                                isActive
                                leadingIcon="mdi:plus"
                                label="Add"
                                labelTw="hidden lg:block"
                            />
                        ] : [],
                        filterRenderer: (props) => (
                                                                                                            <FilterComponent
                                                                                                            currentDate={true}
                                                                                                              {...props}
                                                                                                            />
                                                                                                          ),
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,
                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) =>
                                router.push(
                                    `/distributorsDelivery/details/${row.uuid}`
                                ),
                        },
                        {
                            icon: "lucide:download",
                            onClick: (row: TableDataType) =>
                                downloadPdf(row.uuid),
                        },
                        // {
                        //     icon: "lucide:edit-2",
                        //     onClick: (row: TableDataType) =>
                        //         router.push(
                        //             `/distributorsDelivery/${row.uuid}`
                        //         ),
                        // },
                    ],
                    pageSize: 50,
                }}
            />
        </div>
    );
}
