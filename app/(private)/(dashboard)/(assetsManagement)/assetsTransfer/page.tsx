"use client";

import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  assestsTansferget,
  downloadFile,
  exportRouteVisit,
  warehouseFilter
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatWithPattern } from "@/app/(private)/utils/date";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { Icon } from "@iconify/react";
// import { useAllDropdownListData } from "@/app/(private)/utils/useAllDropdownListData";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
/* ======================= COLUMNS ======================= */
const columns = [
  {
    key: "from_warehouse",
    label: "From Warehouse",
    render: (row: TableDataType) => row.from_warehouse || "-",
  },
  {
    key: "to_warehouse",
    label: "To Warehouse",
    render: (row: TableDataType) => row.to_warehouse || "-",
  },
  {
    key: "transfer_date",
    label: "Transfer Date",
   
    render: (row: TableDataType) => {
    if (!row.transfer_date) return "-";
    return formatWithPattern(
    new Date(row.transfer_date),
    "DD MMM YYYY",
    "en-GB"
  );
},

  },
];

type TableRow = TableDataType & { uuid?: string };

export default function AssetsTransfer() {
  const { permissions } = usePagePermissions();
  const { showSnackbar } = useSnackbar();
  const [warehouses, setWarehouses] = useState([0].map(() => ({ label: "", value: "" })));
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
   const {
          warehouseAllOptions,
         ensureWarehouseAllLoaded} = useAllDropdownListData();


    useEffect(() => {
    
    ensureWarehouseAllLoaded();
  }, [ ensureWarehouseAllLoaded]);
      

  const [filters, setFilters] = useState({
   
    from_date: "",
   to_date: "",
   from_warehouse_id: "",
   to_warehouse_id: "",
   
   
  });
  console.log("filters", filters);

 
  

const fetchWarehouses = async () => {
  const res = await warehouseFilter();

setWarehouses(
  Array.isArray(res?.data)
    ? res.data.map((w: any) => ({
        label: w.warehouse_name,
        value: w.id,
      }))
    : []
);}

    useEffect(() => {
  fetchWarehouses();
}, []);

   const fetchassest = useCallback(
           async (
               page: number = 1,
               pageSize: number = 5
           ): Promise<listReturnType> => {
               const params: Record<string, string> = {
                   page: page.toString(),
                   pageSize: pageSize.toString()
               };
               const listRes = await assestsTansferget(params);
               const rows = listRes?.data || [];
               return {
                                data: rows.map((item: any) => ({
        uuid: item.uuid,
        from_warehouse: item.from_warehouse?.warehouse_name || "-",
        to_warehouse: item.to_warehouse?.warehouse_name || "-",
        transfer_date: item.transfer_date || item.created_at || null,
      })),
                   total: listRes?.pagination?.totalPages || 1,
                   currentPage: listRes?.pagination?.page || 1,
                   pageSize: listRes?.pagination?.limit || pageSize,
               };
           }, []);
   

  
   

  /* ======================= FETCH ======================= */

  const filterBy = useCallback(
          async (
              payload: Record<string, string | number | null>,
              pageSize: number
          ): Promise<listReturnType> => {
              console.log("payload", payload);
              let result;
              try {
                  const params: Record<string, string> = { per_page: pageSize.toString() };
                  Object.keys(payload || {}).forEach((k) => {
                      const v = payload[k as keyof typeof payload];
                      if (v !== null && typeof v !== "undefined" && String(v) !== "") {
                          params[k] = String(v);
                      }
                  });

                  result = await assestsTansferget(params);
                   

              } catch (error) {
                  throw new Error(String(error));
              }
  
              if (result?.error) throw new Error(result.data?.message || "Filter failed");
              else {
                  const pagination = result.pagination?.pagination || result.pagination || {};
                  const rows = result?.data || [];
                  return {
                      data: rows.map((item: any) => ({
        uuid: item.uuid,
        from_warehouse: item.from_warehouse?.warehouse_name || "-",
        to_warehouse: item.to_warehouse?.warehouse_name || "-",
        transfer_date: item.transfer_date || item.created_at || null,
      })),
                      total: pagination.totalPages || result.pagination?.totalPages || 0,
                      totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
                      currentPage: pagination.current_page || result.pagination?.currentPage || 0,
                      pageSize: pagination.limit || pageSize,
                  };
              }
          }, []);
  
 const fetchAssetsTransferList = useCallback(
  async (page = 1, pageSize = 50): Promise<listReturnType> => {
    const response = await assestsTansferget({
      ...filters,
      // page,
      // limit: pageSize,
    });

    const rows = response?.data || [];

    return {
      data: rows.map((item: any) => ({
        uuid: item.uuid,
        from_warehouse: item.from_warehouse?.warehouse_name || "-",
        to_warehouse: item.to_warehouse?.warehouse_name || "-",
        transfer_date: item.transfer_date || item.created_at || null,
      })),
      total: response?.pagination?.total || 0,
      currentPage: response?.pagination?.page || page,
      pageSize: response?.pagination?.limit || pageSize,
    };
  },
  [filters]
);

  /* ======================= EXPORT ======================= */
  const exportFile = async () => {
    const res = await exportRouteVisit({ format: "xlsx", ...filters });
    if (res?.file_url) {
      await downloadFile(res.file_url);
      showSnackbar("File downloaded successfully", "success");
    }
  };

  useEffect(() => {
    if (permissions.length) setRefreshKey((p) => p + 1);
  }, [permissions]);

  return (
    <div className="h-[calc(100%-60px)] flex flex-col gap-3">

     


      {/* ===== TABLE ===== */}
      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchassest,filterBy
          },
          header: {
                        title: "Assets Transfer",
                        
                        searchBar: false,
                        columnFilter: true,
                        actions: true ? [
                          <SidebarBtn
                            key={0}
                            href="/assetsTransfer/transfer"
                            isActive
                            leadingIcon="lucide:plus"
                            label="Assest Transfer"
                            labelTw="hidden sm:block"
                          />,
                        ] : [],

                        filterByFields: [
                             {
                                    key: "from_date",
                                    label: "From Date",
                                    type: "date"
                                },
                                {
                                    key: "to_date",
                                    label: "To Date",
                                    type: "date"
                                },
                            
                            {
                             key: "from_warehouse_id",
                             label: "From Distributor",
                             isSingle: true,
                            options: Array.isArray(warehouseAllOptions)
                                    ? warehouseAllOptions
                                    : [],
                           },
                           {
                        key: "to_warehouse_id",
                        label: "To Distributor",
                       isSingle: true,
                     options: Array.isArray(warehouseAllOptions)
                                    ? warehouseAllOptions
                                    : [],
                       },
                            
                        ],
          },
          columns,
          pageSize: 50,
          table: { height: 500 },
          footer: { pagination: true, nextPrevBtn: true },
          rowSelection: false,
          rowActions: [
            {
              icon: "lucide:eye",
              onClick: (data: object) => {
                const row = data as TableRow;
                router.push(`/assets-transfer/details/${row.uuid}`);
              },
            },
          ],
          localStorageKey: "assets-transfer-table",
        }}
      />
      
      {isFilterOpen && (
  <div className="grid grid-cols-2 gap-3 mt-2 w-96">
    <input
      type="date"
      value={filters.from_date}
      onChange={(e) =>
        setFilters((p) => ({ ...p, from_date: e.target.value }))
      }
      className="border rounded px-3 py-2 text-sm"
    />
    <input
      type="date"
      value={filters.to_date}
      onChange={(e) =>
        setFilters((p) => ({ ...p, to_date: e.target.value }))
      }
      className="border rounded px-3 py-2 text-sm"
    />
  </div>
)}

    </div>
    
  
)}

