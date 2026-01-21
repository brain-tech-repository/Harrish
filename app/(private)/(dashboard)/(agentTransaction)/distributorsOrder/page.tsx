"use client";

import { useState, useCallback, useEffect ,useRef} from "react";
import { useRouter } from "next/navigation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import {
  agentOrderExport,
  // agentOrderExport,
  agentOrderList,
  changeStatusAgentOrder,
  // agentOrderExport ,
  orderExportCollapse
} from "@/app/services/agentTransaction";
import OrderStatus from "@/app/components/orderStatus";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import { downloadFile, downloadPDFGlobal, workFlowRequest, regionList, subRegionList, warehouseList, routeList } from "@/app/services/allApi";
import { formatWithPattern } from "@/app/utils/formatDate";
import ApprovalStatus from "@/app/components/approvalStatus";
import InputFields from "@/app/components/inputFields";
import FilterComponent from "@/app/components/filterComponent";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
// import { useLoading } from "@/app/services/loadingContext";

export default function CustomerInvoicePage() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();

  // const { setLoading } = useLoading();

  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { warehouseOptions, ensureWarehouseLoaded, salesmanOptions, ensureSalesmanLoaded } = useAllDropdownListData();
  useEffect(() => {
    ensureWarehouseLoaded();
    ensureSalesmanLoaded();
  }, [ensureWarehouseLoaded, ensureSalesmanLoaded]);
  
  const [refreshKey, setRefreshKey] = useState(0);

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

  const [warehouseId, setWarehouseId] = useState<string>();
  const [salesmanId, setSalesmanId] = useState<string>();
  const columns = [
  {
    key: "created_at",
    label: "Order Date",
    // showByDefault: true,
    render: (row: TableDataType) => (
      <span
        className="
          font-bold
          cursor-pointer
        "
      >
        {formatWithPattern(
          new Date(row.created_at),
          "DD MMM YYYY",
          "en-GB",
        ).toLowerCase()}
      </span>
    ),
  },
  {
    key: "order_code",
    label: "Order Number",
    // showByDefault: true,
    render: (row: TableDataType) => (
      <span
        className="
          font-bold
          cursor-pointer
        "
      >
        {row.order_code}
      </span>
    ),
  },
  {
    key: "warehouse_name",
    label: "Distributor",
    // showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.warehouse_code ?? "";
      const name = row.warehouse_name ?? "";
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
    key: "customer_name",
    label: "Customer",
    // showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.customer_code ?? "";
      const name = row.customer_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "salesman_name",
    label: "Sales Team",
    // showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.salesman_code ?? "";
      const name = row.salesman_name ?? "";
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
  {
    key: "route_name",
    label: "Route",
    // showByDefault: true,
    render: (row: TableDataType) => {
      const code = row.route_code ?? "";
      const name = row.route_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  // {
  //   key: "payment_method",
  //   label: "Payment Method",
  //   render: (row: TableDataType) => row.payment_method || "-",
  // },
  {
    key: "order_source",
    label: "Order Source",
    render: (row: TableDataType) => row.order_source || "-",
  },
  {
    key: "delivery_date",
    label: "Delivery Date",
    // showByDefault: true,
    render: (row: TableDataType) =>
      formatWithPattern(
        new Date(row.delivery_date),
        "DD MMM YYYY",
        "en-GB",
      ).toLowerCase() || "-",
  },
  {
    key: "comment",
    label: "Comment",
    render: (row: TableDataType) => row.comment || "-",
  },
  {
    key: "approval_status",
    label: "Approval Status",
    // showByDefault: true,
    render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
  },
  {
    key: "order_flag",
    label: "Status",
    // showByDefault: true,
    render: (row: TableDataType) => <OrderStatus order_flag={row.order_flag} />,
  },
];

  // Memoize the fetchOrders API call so it only fetches once per session
  const fetchOrdersCache = useRef<{ [key: string]: listReturnType }>({});
  const fetchOrders = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
     
      try {
        // setLoading(true);
        let params: any = {
          limit: pageSize.toString(),
          page: page.toString(),
        };
        if (warehouseId) {
            params.warehouse_id = warehouseId;
        }
        if (salesmanId) {
            params.salesman_id = salesmanId;
        }
        const listRes = await agentOrderList(params);
        const result = {
          data: listRes.data || [],
          total: listRes.pagination.totalPages,
          currentPage: listRes.pagination.page,
          pageSize: listRes.pagination.limit,
        };
        // fetchOrdersCache.current[cacheKey] = result;
        return result;
      } catch (error: unknown) {
        console.error("API Error:", error);
        setLoading(false);
        throw error;
      }
    },
    [agentOrderList, warehouseId, salesmanId]
  );

  // In-memory cache for filterBy API calls
  const agentOrderFilterCache = useRef<{ [key: string]: any }>({});

  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number,
    ): Promise<listReturnType> => {
      const params: Record<string, string> = {
        per_page: pageSize.toString(),
      };
      Object.keys(payload || {}).forEach((k) => {
        const v = payload[k as keyof typeof payload];
        if (v !== null && typeof v !== "undefined" && String(v) !== "") {
          params[k] = String(v);
        }
      });
      const cacheKey = JSON.stringify(params);
      if (agentOrderFilterCache.current[cacheKey]) {
        const result = agentOrderFilterCache.current[cacheKey];
        const pagination =
          result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.totalPages || result.pagination?.totalPages || 1,
          totalRecords:
            pagination.totalRecords || result.pagination?.totalRecords || 0,
          currentPage: pagination.page || result.pagination?.page || 1,
          pageSize: pagination.limit || pageSize,
        };
      }
       if (warehouseId) {
            params.warehouse_id = warehouseId;
        }
        if (salesmanId) {
            params.salesman_id = salesmanId;
        }
      // const result = await agentOrderList({ filter: Object.values(params) });
      const result = await agentOrderList(params);
      agentOrderFilterCache.current[cacheKey] = result;
      const pagination =
        result.pagination?.pagination || result.pagination || {};
      return {
        data: result.data || [],
        total: pagination.totalPages || result.pagination?.totalPages || 1,
        totalRecords:
          pagination.totalRecords || result.pagination?.totalRecords || 0,
        currentPage: pagination.page || result.pagination?.page || 1,
        pageSize: pagination.limit || pageSize,
      };
    },
    [agentOrderList, warehouseId, salesmanId],
  );

  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await agentOrderExport({ format });
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
  const exportCollapseFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await orderExportCollapse({ format });
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
      // setLoading(true);
      const response = await agentOrderExport({ uuid: uuid, format: "pdf" });
      if (response && typeof response === 'object' && response.download_url) {
        const fileName = `order-${uuid}.pdf`;
        await downloadPDFGlobal(response.download_url, fileName);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download file", "error");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    const res = async () => {
      const res = await workFlowRequest({ model: "order" });
      localStorage.setItem("workflow.order", JSON.stringify(res.data[0]))
    };
    res();
  }, []);

    useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [warehouseId, salesmanId]);

  return (
    <>
      <div className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: { list: fetchOrders, filterBy: filterBy },
            header: {
              title: "Distributor's Orders",
              searchBar: false,
              columnFilter: true,
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
                  onClick: () => !threeDotLoading.xlsx && exportCollapseFile("xlsx"),
                },
              ],
              filterRenderer: (props) => (
                                                                                                  <FilterComponent
                                                                                                  currentDate={true}
                                                                                                    {...props}
                                                                                                  />
                                                                                                ),
              actions: can("create") ? [
                <SidebarBtn
                  key={1}
                  href="/distributorsOrder/add"
                  isActive
                  leadingIcon="mdi:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                />,
              ] : [],
            },
            rowSelection: true,
            footer: { nextPrevBtn: true, pagination: true },
            columns,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (row: TableDataType) =>
                  router.push(`/distributorsOrder/details/${row.uuid}`),
              },
              {
                icon: "lucide:download",
                onClick: (row: TableDataType) => downloadPdf(row.uuid),
              },
              {
                icon: "uil:process",
                onClick: (row: TableDataType) => {
                  router.push(`/settings/processFlow?order_code=${row.order_code}`);
                }
              }
            ],
            pageSize: 50,
          }}
        />
      </div>
    </>
  );
}
