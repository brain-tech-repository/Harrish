"use client";

import Table, {
  listReturnType,
  searchReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import {
  getRouteVisitListBasedOnHeader,
  downloadFile,
  exportRouteVisit,
  routeVisitGlobalSearch,
  assestsTansferget 
} from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatWithPattern } from "@/app/(private)/utils/date";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { filter } from "framer-motion/client";
//import { assestsTansferget } from "@/app/services/allApi";

/* =======================
   TABLE COLUMNS
======================= */
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
    render: (row: TableDataType) =>
      row.transfer_date
        ? formatWithPattern(
            new Date(row.transfer_date),
            "DD MMM YYYY",
            "en-GB"
          )
        : "",
  },
];

export default function AssetsTransfer() {
  const { can, permissions } = usePagePermissions();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);

  /* =======================
      PAYLOAD
  ======================= */
  const filters = {
    warehouse_id: 72,
    from_date: "2026-01-06",
    to_date: "2026-01-06",
  };
  console.log("Filters:", filters);

  type TableRow = TableDataType & { uuid?: string };

  /* =======================
     FETCH LIST API
  ======================= */
  
  // const assestsTansferget = useCallback(
   
    
  //   async (page: number = 1, pageSize: number = 50): Promise<listReturnType> => {
  //     try {
  //       const listRes = await getRouteVisitListBasedOnHeader({
          
  //          ...filters,
  //         page,
  //         limit: pageSize,
  //       });
  //       console.log("API Response:", listRes);
        

  //       const transformedData = (listRes.data || []).map((item: any) => ({
  //         uuid: item.uuid,
  //         from_warehouse: item.from_warehouse?.name || "",
  //         to_warehouse: item.to_warehouse?.name || "",
  //         transfer_date: item.transfer_date,
  //       }));
  //       console.log("Transformed Data:", transformedData);

  //       return {
  //         data: transformedData,
  //         total: listRes.pagination?.totalPages || 1,
  //         currentPage: listRes.pagination?.page || 1,
  //         pageSize: listRes.pagination?.limit || pageSize,
  //       };
  //     } catch (error) {
  //       showSnackbar("Failed to fetch assets transfer list", "error");
  //       throw error;
  //     }
  //   },
  //   [showSnackbar]
  // );

  const fetchAssetsTransferList = useCallback(
  async (page: number = 1, pageSize: number = 50): Promise<listReturnType> => {
    try {
      const response = await assestsTansferget({
        warehouse_id: "72",
        from_date: "2026-01-06",
        to_date: "2026-01-06",
        // page,
        // limit: pageSize,
      });

      console.log("ASSETS TRANSFER API RESPONSE 👉", response);

      // ✅ REAL DATA LOCATION
      const rows = response?.data || [];

      const transformedData = rows.map((item: any) => ({
        uuid: item.uuid,
        from_warehouse: item.from_warehouse?.warehouse_name || "-",
        to_warehouse: item.to_warehouse?.warehouse_name || "-",
        transfer_date: item.transfer_date,
      }));

      return {
        data: transformedData,
        total: response?.data?.pagination?.total || 0,
        currentPage: response?.data?.pagination?.page || 1,
        pageSize: response?.data?.pagination?.limit || pageSize,
      };
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to fetch assets transfer list", "error");
      throw error;
    }
  },
  [showSnackbar]
);








  /* =======================
     GLOBAL SEARCH
  ======================= */
  const searchTransfers = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      column?: string,
      page: number = 1
    ): Promise<listReturnType> => {
      const res = await routeVisitGlobalSearch({
        query,
        per_page: pageSize.toString(),
        page: page.toString(),
      });

      return {
        data: res.data || [],
        total: res.pagination.totalPages,
        currentPage: res.pagination.page,
        pageSize: res.pagination.limit,
      };
    },
    []
  );

  /* =======================
     EXPORT
  ======================= */
  const exportFile = async () => {
    try {
      const res = await exportRouteVisit({
        format: "xlsx",
        ...filters,
      });

      if (res?.file_url) {
        await downloadFile(res.file_url);
        showSnackbar("File downloaded successfully", "success");
      }
    } catch {
      showSnackbar("Failed to export data", "error");
    }
  };

  /* =======================
     PERMISSION REFRESH
  ======================= */
  useEffect(() => {
    if (permissions.length) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  return (
    <div className="h-[calc(100%-60px)] flex flex-col gap-3">

      {/* ===== ASSET TRANSFER BUTTON ABOVE TABLE ===== */}
      {/* {can("create") && ( */}
        <div className="flex justify-end">
          <SidebarBtn
            href="/assetsTransfer/transfer"
            isActive
            leadingIcon="lucide:plus"
            label="Asset Transfer"
          />
        </div>
    

      <Table
        refreshKey={refreshKey}
        config={{
          api: {
            list: fetchAssetsTransferList,
            search: searchTransfers,
          },
          header: {
            title: "Assets Transfer",
            searchBar: true,
            exportButton: {
              show: true,
              onClick: exportFile,
            },
          },
          columns,
          pageSize: 50,
          table: {
            height: 500,
          },
          footer: {
            pagination: true,
            nextPrevBtn: true,
          },
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
    </div>
  );
}   