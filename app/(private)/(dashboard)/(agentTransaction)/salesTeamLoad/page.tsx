"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
  configType,
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import StatusBtn from "@/app/components/statusBtn2";
import { salesmanLoadHeaderList, exportSalesmanLoad, exportSalesmanLoadDownload,loadExportCollapse,salesmanLoadPdf,loadGlobalFilter } from "@/app/services/agentTransaction";
import { useRef } from "react";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { downloadFile } from "@/app/services/allApi";
import ApprovalStatus from "@/app/components/approvalStatus";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import FilterComponent from "@/app/components/filterComponent";
import { formatWithPattern } from "@/app/utils/formatDate";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";
import { downloadPDFGlobal } from "@/app/services/allApi";
import OrderStatus from "@/app/components/orderStatus";
// import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
interface SalesmanLoadRow {
  osa_code?: string;
  warehouse?: { code?: string; name?: string };
  route?: { code?: string; name?: string };
  salesman?: { code?: string; name?: string };
  salesman_type?: { id?: number; code?: string; name?: string };
  project_type?: { id?: number; code?: string; name?: string };
  status?: number | boolean;
  uuid?: string;
}

export default function SalemanLoad() {
  const { can, permissions } = usePagePermissions();
  const {  warehouseAllOptions,salesmanOptions,ensureSalesmanLoaded, routeOptions, ensureRouteLoaded,ensureWarehouseAllLoaded } = useAllDropdownListData();
  const [warehouseId, setWarehouseId] = useState<string>();
  const [routeId, setRouteId] = useState<string>();
  const [salesmanId, setSalesmanId] = useState<string>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [colFilter, setColFilter] = useState<boolean>(false);
  const [filterPayload,setFilterPayload] = useState<any>();
  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  // Load dropdown data
  useEffect(() => {
    ensureRouteLoaded();
    ensureWarehouseAllLoaded();
    ensureSalesmanLoaded();
  }, [ ensureRouteLoaded, ensureWarehouseAllLoaded,ensureSalesmanLoaded]);

  const columns: configType["columns"] = [
    {
      key:"osa_code",
      label:"Code",
    },
    {
      key:"created_at",
      label:"Load Date",
      render: (row: TableDataType) => formatDate(row?.created_at || "-")
    },
    {
      key: "warehouse",
      label: "Distributor",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        const nameParts = s.warehouse?.name?.split(" - ");
        const shortName =
          nameParts && nameParts.length > 1
            ? `${nameParts[0]} (${nameParts[1]})`
            : s.warehouse?.name || "-";
        return `${s.warehouse?.code ?? ""} - ${shortName}`;
      },
      filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(warehouseAllOptions) ? warehouseAllOptions : [],
                onSelect: (selected) => {
                    setWarehouseId((prev) => (prev === selected ? "" : (selected as string)));
                },
                isSingle: false,
                selectedValue: warehouseId,
            },
    },
    {
      key: "route",
      label: "Route",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return s.route?.code || "-";
      },
      filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(routeOptions) ? routeOptions : [],
                onSelect: (selected) => {
                    setRouteId((prev) => prev === selected ? "" : (selected as string));
                },
                isSingle: false,
                selectedValue: routeId,
            },
    },
    {
      key: "salesman",
      label: "Sales Team",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return `${s.salesman?.code ?? ""} - ${s.salesman?.name ?? ""}`;
      },
      filter: {
                isFilterable: true,
                width: 320,
                options: Array.isArray(salesmanOptions) ? salesmanOptions : [],
                onSelect: (selected) => {
                    setSalesmanId((prev) => (prev === selected ? "" : (selected as string)));
                },
                isSingle: false,
                selectedValue: salesmanId,
            },
    },
    {
      key: "salesman_type", label: "Sales Team Type",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return `${s.salesman_type?.name ?? ""}`;
      },
    },
    {
      key: "project_type",
      label: "Sales Team Role",
      render: (row: TableDataType) => {
       return `${(row as SalesmanLoadRow).project_type?.name ?? "-"}`;
      },
    },
    // {
    //     key: "approval_status",
    //     label: "Approval Status",
    //     render: (row: TableDataType) => <ApprovalStatus status={row.approval_status || "-"} />,
    // },
    {
      key: "is_confirmed",
      label: "Status",
      render: (row: TableDataType) => {
        const s = row as SalesmanLoadRow;
        return <OrderStatus order_flag={{ is_confirmed: row.is_confirmed }} />
        // return row.is_confirmed == 1 ? 'Sales Team Accepted' : 'Waiting For Accept'
      },
    },
  ];

  const { setLoading } = useLoading();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [threeDotLoading, setThreeDotLoading] = useState({
    pdf: false,
    csv: false,
    xlsx: false,
  });


  // In-memory cache for salesmanLoadHeaderList API calls
  const salesmanLoadHeaderCache = useRef<{ [key: string]: any }>({});
     useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [ warehouseId, routeId,salesmanId]);

  const fetchSalesmanLoadHeader = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50
    ): Promise<listReturnType> => {
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
      };
     
            if (warehouseId) {
                params.warehouse_id = String(warehouseId);
            }
            if (routeId) {
                params.route_id = String(routeId);
            }
            if (salesmanId) {
                params.salesman_id = String(salesmanId);
            }
      const cacheKey = JSON.stringify(params);
      if (salesmanLoadHeaderCache.current[cacheKey]) {
        const listRes = salesmanLoadHeaderCache.current[cacheKey];
        return {
          data: Array.isArray(listRes.data) ? listRes.data : [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1,
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      }
      try {
        setLoading(true);
        const listRes = await salesmanLoadHeaderList(params);
        salesmanLoadHeaderCache.current[cacheKey] = listRes;
        setLoading(false);
        return {
          data: Array.isArray(listRes.data) ? listRes.data : [],
          total: listRes?.pagination?.totalPages || 1,
          currentPage: listRes?.pagination?.page || 1,
          pageSize: listRes?.pagination?.limit || pageSize,
        };
      } catch (error) {
        setLoading(false);
        showSnackbar("Failed to load Salesman Load list", "error");
        return {
          data: [],
          total: 1,
          currentPage: 1,
          pageSize: pageSize,
        };
      }
    },
    [setLoading, showSnackbar, warehouseId, routeId,salesmanId]
  );

  // In-memory cache for filterBy API calls
  const salesmanLoadHeaderFilterCache = useRef<{ [key: string]: any }>({});

  const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number
    ): Promise<listReturnType> => {
      setColFilter(true);
      const params: Record<string, string> = {};
      Object.keys(payload || {}).forEach((k) => {
        const v = payload[k as keyof typeof payload];
        if (v !== null && typeof v !== "undefined" && String(v) !== "") {
          params[k] = String(v);
        }
      });
      const cacheKey = JSON.stringify(params);
      if (salesmanLoadHeaderFilterCache.current[cacheKey]) {
        const result = salesmanLoadHeaderFilterCache.current[cacheKey];
        const pagination = result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.last_page || result.pagination?.last_page || 0,
          totalRecords: pagination.total || result.pagination?.total || 0,
          currentPage: pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
      setLoading(true);
      let result;
      try {
        result = await salesmanLoadHeaderList(params);
        salesmanLoadHeaderFilterCache.current[cacheKey] = result;
      } finally {
        setLoading(false);
        setColFilter(false);
      }

      if (result?.error) throw new Error(result.data?.message || "Filter failed");
      else {
        const pagination = result.pagination?.pagination || result.pagination || {};
        return {
          data: result.data || [],
          total: pagination.last_page || result.pagination?.last_page || 0,
          totalRecords: pagination.total || result.pagination?.total || 0,
          currentPage: pagination.current_page || result.pagination?.currentPage || 0,
          pageSize: pagination.limit || pageSize,
        };
      }
    },
    [setLoading]
  );

        const fetchLoadAccordingToGlobalFilter = useCallback(
          async (
            payload: Record<string, any>,
            pageSize: number = 50,
            pageNo: number = 1
          ): Promise<listReturnType> => {
      
            try {
              setLoading(true);
              setFilterPayload(payload);
              const body = {
                 per_page: pageSize.toString(),
            current_page: pageNo.toString(),
                filter: payload
              }
              const listRes = await loadGlobalFilter(body);
             const pagination =
              listRes.pagination?.pagination || listRes.pagination || {};
            return {
             data: listRes.data || [],
          total: pagination.last_page || listRes.pagination?.last_page || 1,
          totalRecords:
            pagination.total || listRes.pagination?.total || 0,
          currentPage: pagination.current_page || listRes.pagination?.current_page || 1,
          pageSize: pagination.per_page || pageSize,
            };
              // fetchOrdersCache.current[cacheKey] = result;
              // return listRes;
            } catch (error: unknown) {
              console.error("API Error:", error);
              setLoading(false);
              throw error;
            }
            finally{
              setLoading(false);
            }
          },
          [loadGlobalFilter, warehouseId, salesmanId]
        );

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  // useEffect(() => {
  //   setRefreshKey(refreshKey + 1);
  // }, [regionOptions, warehouseOptions, routeOptions, channelOptions, itemCategoryOptions, customerSubCategoryOptions]);


  const downloadPdf = async (uuid: string) => {
    try {
      // setLoading(true);
      // setThreeDotLoading((prev) => ({ ...prev, pdf: true }));
      const response = await salesmanLoadPdf({ uuid: uuid, format: "pdf" });
      if (response && typeof response === 'object' && response.download_url) {
         const fileName = `load-${uuid}.pdf`;
        await downloadPDFGlobal(response.download_url, fileName);
        // await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
    } catch (error) {
      showSnackbar("Failed to download file", "error");
    } finally {
      // setThreeDotLoading((prev) => ({ ...prev, pdf: false }));
      // setLoading(false);
    }
  };



  const exportFile = async (format: "csv" | "xlsx" = "csv") => {
    try {
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await exportSalesmanLoad({ format, filter: filterPayload });
      if (response && typeof response === 'object' && response.download_url) {
        await downloadFile(response.download_url);
        showSnackbar("File downloaded successfully ", "success");
      } else {
        showSnackbar("Failed to get download URL", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      showSnackbar("Failed to download Salesman Load data", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
    }
  };

  const exportCollapseFile = async (format: "csv" | "xlsx" = "csv") => {
      try {
        setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
        const response = await loadExportCollapse({ format, filter: filterPayload });
        if (response && typeof response === "object" && response.download_url) {
          await downloadFile(response.download_url);
          showSnackbar("File downloaded successfully ", "success");
        } else {
          showSnackbar("Failed to get download URL", "error");
        }
        setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
      } catch (error) {
        showSnackbar("Failed to download Distributor data", "error");
        setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
      } finally {
      }
    };

  return (
    <div className="flex flex-col h-full">
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchSalesmanLoadHeader,
            filterBy: async (payload: Record<string, string | number | null>,pageSize: number) => {
                if (colFilter) {
                  return filterBy(payload, pageSize);
                } else {
                  let pageNo = 1;
                  if (payload && typeof payload.page === 'number') {
                    pageNo = payload.page;
                  } else if (payload && typeof payload.page === 'string' && !isNaN(Number(payload.page))) {
                    pageNo = Number(payload.page);
                  }
                  const { page, ...restPayload } = payload || {};
                  return fetchLoadAccordingToGlobalFilter(restPayload as Record<string, any>, pageSize, pageNo);
                }
          },
        },
          header: {
            title: "Sales Team Load",
            searchBar: false,
            columnFilter: true,
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
            filterRenderer: (props) => (
                                                                                    <FilterComponent
                                                                                    currentDate={true}
                                                                                      {...props}
                                                                                    />
                                                                                  ),
            actions: can("create") ? [
              <SidebarBtn
                key={0}
                href="/salesTeamLoad/add"
                isActive
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden sm:block"
              />,
            ] : [],
          },
          localStorageKey: "salesmanLoad-table",
          footer: { nextPrevBtn: true, pagination: true },
          columns,
          rowSelection: true,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: object) => {
                const row = data as { uuid?: string };
                if (row.uuid) router.push(`/salesTeamLoad/details/${row.uuid}`);
              },
            },
            {
              icon: "material-symbols:download",
              showLoading: true,
              onClick: (row: TableDataType) => downloadPdf(row.uuid),
            },
          ],
          pageSize: 50,
        }}
      />
    </div>
  );
}
