"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useParams, useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { assetsMasterExport, chillerList, deleteChiller, deleteServiceTypes, serviceTypesList } from "@/app/services/assetsApi";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { AssestMasterfilter, AssetMasterStatus, AssestMasterModel, assestMasterQR, downloadQR } from "@/app/services/allApi";

import { generateAssetLabelPdfDirect } from "./utils/util";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import filterAssest from "@/app/components/filterAssest";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";

const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

export default function ShelfDisplay() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [warehouses, setWarehouses] = useState([0].map(() => ({ label: "", value: "" })));
  const [modelNumberOptions, setModelNumberOptions] = useState<any[]>([]);
const {
    customerSubCategoryOptions,
    companyOptions,
    salesmanOptions,
    channelOptions,
    warehouseAllOptions,
    routeOptions,
    regionOptions,
    areaOptions,
    ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded, 
    ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, 
    ensureSalesmanLoaded, ensureWarehouseAllLoaded } = useAllDropdownListData();

  // Load dropdown data
  useEffect(() => {
    ensureAreaLoaded();
    ensureChannelLoaded();
    ensureCompanyLoaded();
    ensureCustomerSubCategoryLoaded();
    ensureRegionLoaded();
    ensureRouteLoaded();
    ensureSalesmanLoaded();
    ensureWarehouseAllLoaded();
  }, [ensureAreaLoaded, ensureChannelLoaded, ensureCompanyLoaded,
     ensureCustomerSubCategoryLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureSalesmanLoaded,
      ensureWarehouseAllLoaded]);

  const [filters, setFilters] = useState({
   id: "",
   code:"",
   name:"",
    
   
  });
 const [isFiltered, setIsFiltered] = useState(false);
  const [tableFilters, setTableFilters] = useState<any>({});
  const fetchWarehouses = async () => {
  const res = await AssestMasterfilter();

setWarehouses(
  Array.isArray(res?.data)
    ? res.data.map((w: any) => ({
        label: w.warehouse_name,
        value: w.id,
      }))
    : []
);}
const validateFilters = () => {
    if (!filters.id && !filters.code && !filters.name) {
      showSnackbar("Please select at least one filter", "warning");
      return false;
    }
    return true;
  };
 const handleFilter = () => {
    if (!validateFilters()) return;
    setIsFiltered(true);
    setRefreshKey((prev) => prev + 1);
  };

  // ✅ Reset Filter
  const handleReset = () => {
    setFilters({ id: "", code: "", name: "" });
    setIsFiltered(false);
    setRefreshKey((prev) => prev + 1);
  };

  // const [threeDotLoading, setThreeDotLoading] = useState<{ pdf: boolean; xlsx: boolean; csv: boolean }>({ pdf: false, xlsx: false, csv: false });


  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const PATH = `/assetsMaster/details/`;
  const { showSnackbar } = useSnackbar();
   const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  const paramsRoute = useParams();
  
  
  
  
const labelRef = useRef<HTMLDivElement>(null);
const [filterState, setFilterState] = useState<{
  company?: any;
  region?: any;
  area?: any;
  distributor?: any;
}>({});
const uuid = paramsRoute?.uuid as string;
const searchChiller = useCallback(
    async (
      query: string,
      pageSize: number = 10,
      columnName?: string
    ): Promise<listReturnType> => {
      try {
        setLoading(true);

        const payload: any = {
          query,
          per_page: pageSize.toString(),
        };

        // 👇 only add column filter if it exists
        if (columnName) {
          payload[columnName] = query;
        }

        const res = await chillerList(payload);

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
        setLoading(false);
      }
    },
    []
  );

 const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      // setLoading(true);
      setThreeDotLoading((prev) => ({ ...prev, [fileType]: true }));

      const res = await assetsMasterExport({ format: fileType });

      let downloadUrl = "";

      if (res?.download_url && res.download_url.startsWith("blob:")) {
        downloadUrl = res.download_url;
      } else if (res?.download_url && res.download_url.startsWith("http")) {
        downloadUrl = res.download_url;
      } else if (typeof res === "string" && res.includes(",")) {
        const blob = new Blob([res], {
          type:
            fileType === "csv"
              ? "text/csv;charset=utf-8;"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        downloadUrl = URL.createObjectURL(blob);
      } else {
        showSnackbar("No valid file or URL returned from server", "error");
        return;
      }

      // ⬇️ Trigger browser download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `assets_export.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSnackbar(
        `Download started for ${fileType.toUpperCase()} file`,
        "success"
      );
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export Assets Master data", "error");
    } finally {
      // setLoading(false);
      setThreeDotLoading((prev) => ({ ...prev, [fileType]: false }));
      setShowExportDropdown(false);
    }
  };


  // useEffect(() => {
  //   setLoading(true);
  // }, [])
  // ########################################################
  //  const fetchServiceTypes = useCallback(
  //   async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
  //     setLoading(true);
  //     const res = await chillerList({
  //       page: pageNo.toString(),
  //       per_page: pageSize.toString(),
  //     });
  //     setLoading(false);
  //     if (res.error) {
  //       showSnackbar(res.data.message || "failed to fetch the Chillers", "error");
  //       throw new Error("Unable to fetch the Chillers");
  //     } else {
  //       return {
  //         data: res.data || [],
  //         currentPage: res?.pagination?.page || 0,
  //         pageSize: res?.pagination?.limit || 10,
  //         total: res?.pagination?.totalPages || 0,
  //       };
  //     }
  //   }, []
  // )

const fetchServiceTypes = useCallback(
  async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
    setLoading(true);

    const res = await chillerList({
      page: pageNo.toString(),
      per_page: pageSize.toString(),
      ...tableFilters,   // ✅ filters yahin se aayenge
    });

    setLoading(false);

    if (res.error) {
      showSnackbar(res.data.message || "failed to fetch", "error");
      throw new Error("fetch failed");
    }

    return {
      data: res.data || [],
      //  list: res?.data ?? [],
      currentPage: res?.pagination?.page || 0,
      pageSize: res?.pagination?.limit || 10,
      total: res?.pagination?.totalPages || 0,
    };
  },
  [tableFilters]   // 🔥 important
);











//  const filterBy = useCallback(
//     async (payload: Record<string, string | number | null>, pageSize = 10) => {
//       const finalPayload = { ...tableFilters, ...payload }; // parent state + table payload

//       const res = await chillerList(finalPayload);

//       return {
//         data: res?.data || [],
//         total: res?.pagination?.totalPages || 0,
//         currentPage: res?.pagination?.page || 0,
//         pageSize: res?.pagination?.limit || pageSize,
//       };
//     },
//     [tableFilters]  // dependency array
//   );

// const filterBy = useCallback(
//   async (payload: Record<string, any>, pageSize = 10) => {
//     setTableFilters(payload);  // ✅ bas state set

//     return {
//       data: [],
//       total: 0,
//       currentPage: 0,
//       pageSize,
//     };
//   },
//   []
// );


const filterBy = useCallback(
    async (payload: Record<string, string | number | null>, pageSize = 10) => {
       const finalPayload = { ...tableFilters, ...payload }; // parent state + table payload
      setTableFilters(payload);

      const res = await   AssetMasterStatus(finalPayload);

      return {
        data: res?.data || [],
        total: res?.pagination?.totalPages || 0,
        currentPage: res?.pagination?.page || 0,
        pageSize: res?.pagination?.limit || pageSize,
      };
    },
    [tableFilters]  // dependency array
  );








// const filterBy = useCallback(
//           async (
//               payload: Record<string, string | number | null>,
//               pageSize: number
//           ): Promise<listReturnType> => {
//               console.log("payload", payload);
//               let result;
//               try {
//                   const params: Record<string, string> = { per_page: pageSize.toString() };
//                   Object.keys(payload || {}).forEach((k) => {
//                       const v = payload[k as keyof typeof payload];
//                       if (v !== null && typeof v !== "undefined" && String(v) !== "") {
//                           params[k] = String(v);
//                       }
//                   });

//                   result = await chillerList(params);
                   

//               } catch (error) {
//                   throw new Error(String(error));
//               }
  
//               if (result?.error) throw new Error(result.data?.message || "Filter failed");
//               else {
//                   const pagination = result.pagination?.pagination || result.pagination || {};
//                   const rows = result?.data || [];
//                   return {
//                       data: rows.map((item: any) => ({
//         uuid: item.uuid,
//         from_warehouse: item.from_warehouse?.warehouse_name || "-",
//         to_warehouse: item.to_warehouse?.warehouse_name || "-",
//         transfer_date: item.transfer_date || item.created_at || null,
//       })),
//                       total: pagination.totalPages || result.pagination?.totalPages || 0,
//                       totalRecords: pagination.totalRecords || result.pagination?.totalRecords || 0,
//                       currentPage: pagination.current_page || result.pagination?.currentPage || 0,
//                       pageSize: pagination.limit || pageSize,
//                   };
//               }
//           }, []);
  
 const fetchAssetsTransferList = useCallback(
  async (page = 1, pageSize = 50): Promise<listReturnType> => {
    const response = await chillerList({
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
    
// ################################################################################


const handleDownloadQR = async (row: TableDataType) => {
    console.log("Downloading QR for row:", row);
    try {
      setLoading(true);
      await generateAssetLabelPdfDirect(row, row.osa_code || row.uuid);
      showSnackbar("Asset QR PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Download QR error:", error);
      showSnackbar("Failed to download QR code", "error");
    } finally {
      setLoading(false);
    }
  };





  return (
    <>
      {/* Table */}
      <div  className="flex flex-col h-full">
        <Table
          refreshKey={refreshKey}
          config={{
            api: {
              
              list: fetchServiceTypes,
              // search: searchChiller,
              filterBy: filterBy,
            },
            header: {
              title: "Assets Master",
              threeDot: [
                {
                  icon: threeDotLoading.csv || threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("csv");
                  },
                },
                {
                  icon: threeDotLoading.xlsx || threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("xlsx");
                  },
                },
              ],
              searchBar: false,
              // searchBar: false,
              columnFilter: true,
                filterRenderer:filterAssest,
              actions: can("create") ? [
                <SidebarBtn
                  key="name"
                  href="/assetsMaster/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
                
              ] : [],
               


            },
            localStorageKey: "assetsMasterTable",
            
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              {
                key: "osa_code", label: "Asset Code",
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code}
                  </span>
                ),
              },
              {
                key: "sap_code", label: "SAP Code",
                showByDefault: false,
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.sap_code}
                  </span>
                ),
              },
              
  //                 {
  //   key: "warehouse_name",
  //   label: "Distributor Name",
  //   // showByDefault: true,
  //   render: (row: TableDataType) => {
  //     const code = row.warehouse_code ?? "";
  //     const name = row.warehouse_name ?? "";
  //     if (!code && !name) return "-";
  //     return `${code}${code && name ? " - " : ""}${name}`;
      
  //   },
  // },

               
                             {
  key: "warehouse",
  label: "Distributor",
  render: (row: TableDataType) => {
    return `${row?.warehouse?.code || ""} - ${row?.warehouse?.warehouse_name || ""}`;
  },
}  ,  
                             {
  key: "customer",
  label: "Customer",
  render: (row: TableDataType) => {
    return `${row?.customer?.code || ""} - ${row?.customer?.name || ""}`;
  },
}  ,  

// {
//   key: "vendor",
//   label: "Distributor",
//   render: (row) => row?.vendor?.name || "-",
// }
// ,





              { key: "serial_number", label: "Serial Number" },
              {
                key: "assets_category", label: "Asset number", render: (data: TableDataType) =>
                  typeof data.assets_category === "object" && data.assets_category !== null
                    ? `${(data.assets_category as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "model_number", label: "Model Number", render: (data: TableDataType) =>
                  typeof data.model_number === "object" && data.model_number !== null
                    ? `${(data.model_number as { name?: string }).name || ""}`
                    : "-",
              },
              { key: "acquisition", label: "Acquisition", render: (data: TableDataType) => formatDate(data.acquisition) },
              // {
              //   key: "vendor", label: "Vendor", render: (data: TableDataType) =>
              //     typeof data.vendor === "object" && data.vendor !== null
              //       ? `${(data.vendor as { name?: string }).name || ""}`
              //       : "-",
              // },
              // {
              //   key: "manufacturer", label: "Manufacturer", render: (data: TableDataType) =>
              //     typeof data.manufacturer === "object" && data.manufacturer !== null
              //       ? `${(data.manufacturer as { name?: string }).name || ""}`
              //       : "-",
              // },
              {
                key: "country", label: "Country", render: (data: TableDataType) =>
                  typeof data.country === "object" && data.country !== null
                    ? `${(data.country as { name?: string }).name || ""}`
                    : "-",
              },
              // {
              //   key: "branding", label: "Branding", render: (data: TableDataType) =>
              //     typeof data.branding === "object" && data.branding !== null
              //       ? `${(data.branding as { name?: string }).name || ""}`
              //       : "-",
              // },
              { key: "assets_type", label: "Assets Type" },
              // { key: "trading_partner_number", label: "Trading Partner No." },
              { key: "capacity", label: "Capacity" },
              { key: "manufacturing_year", label: "Year" },
              // { key: "remarks", label: "Remarks" },
              {
                key: "status", label: "Status",showByDefault:true, render: (data: TableDataType) =>
                  typeof data.status === "object" && data.status !== null
                    ? `${(data.status as { name?: string }).name || ""}`
                    : "-",
              },
            ],
            // rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsMaster/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:download",
                showLoading:true,
                onClick: (row: TableDataType) => handleDownloadQR(row),
                
              },
              
  

              ...(can("edit") ? [{
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsMaster/${data.uuid}`);
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
