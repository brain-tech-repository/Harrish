import { useEffect, useState,useCallback } from "react";
import { useAllDropdownListData } from "./contexts/allDropdownListData";
import { FilterRendererProps } from "./customTable";
import {AssestRequestFilter,AssestMasterModel,AssestMasterfilter} from "@/app/services/allApi";



// Extend props to allow specifying which filters to show
type FilterComponentProps = FilterRendererProps & {
  onlyFilters?: string[]; // e.g. ['warehouse_id', 'company_id']
  currentDate?: boolean;
  api?: (payload: any) => Promise<any>; // Optional API function to call on filter submit
  disabled?: boolean;
};
import SidebarBtn from "./dashboardSidebarBtn";
import InputFields from "./inputFields";
import { regionList, subRegionList, warehouseList, routeList } from "@/app/services/allApi";
import { stat } from "fs";

type DropdownOption = {
  value: string;
  label: string;
};

type Region = {
  id: number;
  region_name?: string;
  name?: string;
};

type Area = {
  id: number;
  area_name?: string;
  name?: string;
};

type Warehouse = {
  id: number;
  warehouse_name?: string;
  warehouse_code?: string;
  name?: string;
  code?: string;
};

type Route = {
  id: number;
  route_name?: string;
  name?: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: boolean;
  message?: string;
};

export default function FilterComponent(filterProps: FilterComponentProps) {
    const { disabled = false } = filterProps;
  const {
    customerSubCategoryOptions,
    companyOptions,
    ensureCompanyLoaded,
    salesmanOptions,
    ensureSalesmanLoaded,
    channelOptions,
    assetsModelOptions,
    ensureAssetsModelLoaded,
  } = useAllDropdownListData();

  useEffect(() => {
    ensureCompanyLoaded();
    ensureSalesmanLoaded();
     ensureAssetsModelLoaded();
  }, [ensureCompanyLoaded,ensureAssetsModelLoaded, ensureSalesmanLoaded]);
  const { onlyFilters, currentDate, api } = filterProps;
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<any[]>([]);

  // $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
 

 








  // Set default date for from_date and to_date to today if currentDate is true
  useEffect(() => {
    if (currentDate) {
      const today = new Date().toISOString().slice(0, 10);
      if (!filterProps.payload.from_date) {
        filterProps.setPayload((prev) => ({ ...prev, from_date: today }));
      }
      if (!filterProps.payload.to_date) {
        filterProps.setPayload((prev) => ({ ...prev, to_date: today }));
      }
    } else {
      // If currentDate is false, clear the dates
      filterProps.setPayload((prev) => ({ ...prev, from_date: "", to_date: "" }));
    }
    // Only run on mount or when currentDate changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);
  const [skeleton, setSkeleton] = useState({
    company: false,
    region: false,
    area: false,
    warehouse: false,
    route: false, 
    // modelname: false,
    // statusname: false,
    
  });
  const [regionOptions, setRegionOptions] = useState<DropdownOption[]>([]);
  const [areaOptions, setAreaOptions] = useState<DropdownOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<DropdownOption[]>([]);
  const [routeOptions, setRouteOptions] = useState<DropdownOption[]>([]);
  const [tableFilters, setTableFilters] = useState<any>({});


  const {
    payload,
    setPayload,
    submit,
    clear,
    activeFilterCount,
    isApplying,
    isClearing,
  } = filterProps;

// useEffect(() => {
//   const fetchModelNumbers = async () => {
//     try {
//       setSkeleton((prev) => ({ ...prev, salesteam: true }));

//       const res = await AssestMasterModel({
//         dropdown: "true",
//       });

//       const list = res?.data || res || [];

//       setModelOptions(
//         list.map((m: any) => ({
//           value: String(m.id),
//           label: m.model_no || m.model_number || m.name,
//         }))
//       );
//     } catch (err) {
//       console.error("Model No list error:", err);
//       setModelOptions([]);
//     } finally {
//       setSkeleton((prev) => ({ ...prev, salesteam: false }));
//     }
//   };

//   fetchModelNumbers(); // 🔥 page load par call
// }, []); // ✅ empty dependency





// useEffect(() => {
//   const fetchStatusNumbers = async () => {
//     try {
//       setSkeleton((prev) => ({ ...prev, salesteam: true }));

//       const res = await AssestMasterfilter({
//         dropdown: "true",
//       });

//       const list = res?.data || res || [];

//       setStatusOptions(
//         list.map((m: any) => ({
//           value: String(m.id),
//           label: m.status_no || m.status_number || m.name,
//         }))
//       );
//     } catch (err) {
//       console.error("Status No list error:", err);
//       setStatusOptions([]);
//     } finally {
//       setSkeleton((prev) => ({ ...prev, statusname: false }));
//     }
//   };

//   fetchStatusNumbers(); // 🔥 page load par call
// }, []); // ✅ empty dependency







  const onChangeArray = (key: string, value: any) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const toArray = (v: any) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(",").filter(Boolean);
    if (typeof v === "number") return [String(v)];
    return [];
  };

  const companyVal = toArray(payload.company_id);
  const regionVal = toArray(payload.region_id);
  const areaVal = toArray(payload.area_id);
  const warehouseVal = toArray(payload.warehouse_id);
  const routeVal = toArray(payload.route_id);
  // const modelVal = toArray(payload.model_id);
  // const statusVal = toArray(payload.status);
// 🔴 Distributor mandatory condition
// const isDistributorRequired =
//   companyVal.length > 0 ||
//   regionVal.length > 0 ||
//   areaVal.length > 0;

// const isDistributorMissing =
//   isDistributorRequired && warehouseVal.length === 0;

 














const applyFilterApi = async () => {
  try {
    const finalPayload = {
      company_id: companyVal,
      region_id: regionVal,
      area_id: areaVal,
      warehouse_id: warehouseVal,
      route_id: routeVal,
      // model_id: modelVal,
      // status: statusVal,
      
    };

    console.log("Filter Payload 👉", finalPayload);

    // 🔥 API CALL
    //  const res = await AssestRequestFilter(finalPayload);

    //  console.log("Filter API Response 👉", res);

   
     await submit(finalPayload);

  } catch (error) {
    console.error("Filter API Error ❌", error);
  }
};
















  // ✅ When Company changes → Fetch Regions
  useEffect(() => {
    if (!companyVal.length) {
      setRegionOptions([]);
      return;
    }

    const fetchRegions = async () => {
        setSkeleton((prev) => ({ ...prev, region: true }));
      try {
        const regions: ApiResponse<Region[]> = await regionList({
          company_id: companyVal.join(","),
          dropdown: "true",
        });
        setRegionOptions(
          regions?.data?.map((r: Region) => ({
            value: String(r.id),
            label: r.region_name || r.name || "",
          })) || []
        );
      } catch (err) {
        console.error("Failed to fetch region list:", err);
        setRegionOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, region: false }));
    };

    fetchRegions();
  }, [companyVal.join(",")]);

  // ✅ When Region changes → Fetch Areas
  useEffect(() => {
    if (!regionVal.length) {
      setAreaOptions([]);
      return;
    }

    const fetchAreas = async () => {
        setSkeleton((prev) => ({ ...prev, area: true }));
    
      try {
        const res: ApiResponse<{ data: Area[] } | Area[]> = await subRegionList(
          { region_id: regionVal.join(","),dropdown:"true" }
        );
        const areaList =
          (res as { data: Area[] })?.data || (res as Area[]) || [];

        setAreaOptions(
          areaList.map((a: Area) => ({
            value: String(a.id),
            label: a.area_name || a.name || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch area list:", err);
        setAreaOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, area: false }));
    };

    fetchAreas();
  }, [regionVal.join(",")]);

  useEffect(() => {
    if (!areaVal.length) {
      setWarehouseOptions([]);
      return;
    }

    const fetchWarehouses = async () => {
        setSkeleton((prev) => ({ ...prev, warehouse: true }));

      try {
        const res: ApiResponse<{ data: Warehouse[] } | Warehouse[]> =
          await warehouseList({ area_id: areaVal.join(","),dropdown:"true" });
        const warehousesList =
          (res as { data: Warehouse[] })?.data || (res as Warehouse[]) || [];

        setWarehouseOptions(
          warehousesList.map((w: Warehouse) => ({
            value: String(w.id),
            label: `${w.warehouse_code || w.code || "-"} - ${w.warehouse_name || w.name || ""}`,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch warehouse list:", err);
        setWarehouseOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, warehouse: false }));

    };

    fetchWarehouses();
  }, [areaVal.join(",")]);

  // ✅ When Warehouse changes → Fetch Routes
  useEffect(() => {
    if (!warehouseVal.length) {
      setRouteOptions([]);
      return;
    }

    const fetchRoutes = async () => {
        setSkeleton((prev) => ({ ...prev, route: true }));
      try {
        const res: ApiResponse<{ data: Route[] } | Route[]> = await routeList({
          warehouse_id: warehouseVal.join(","),
          dropdown:"true",
        });
        const routeListData =
          (res as { data: Route[] })?.data || (res as Route[]) || [];

        setRouteOptions(
          routeListData.map((r: Route) => ({
            value: String(r.id),
            label: r.route_name || r.name || "",
          }))
        );
      } catch (err) {
        console.error("Failed to fetch route list:", err);
        setRouteOptions([]);
      }
        setSkeleton((prev) => ({ ...prev, route: false }));
    };

    fetchRoutes();
  }, [warehouseVal.join(",")]);


  // Helper to check if a filter should be shown
  const showFilter = (key: string) => {
    if (!onlyFilters) return true;
    return onlyFilters.includes(key);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Day Filter Dropdown */}
      
      {/* Start Date */}
     
      {/* End Date */}
     
      {/* Company */}
      {showFilter("company_id") && (
        <InputFields
          label="Company"
          name="company_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.company}
          options={Array.isArray(companyOptions) ? companyOptions : []}
          value={companyVal as any}
          disabled={disabled}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("company_id", val);
            // reset downstream when parent changes
            onChangeArray("region_id", []);
            onChangeArray("sub_region_id", []);
            onChangeArray("warehouse_id", []);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Region */}
      {showFilter("region_id") && (
        <InputFields
          label="Region"
          name="region_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.region}
          disabled={disabled || companyVal.length === 0}
          options={Array.isArray(regionOptions) ? regionOptions : []}
          value={regionVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("region_id", val);
            onChangeArray("sub_region_id", []);
            onChangeArray("warehouse_id", []);
            onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Area */}
      {showFilter("area_id") && (
        <InputFields
          label="Area"
          name="area_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.area}
          disabled={disabled || regionVal.length === 0}
          options={Array.isArray(areaOptions) ? areaOptions : []}
          value={areaVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("area_id", val);
            onChangeArray("warehouse_id", []);
            // onChangeArray("route_id", []);
          }}
        />
      )}
      {/* Distributor */}
      {showFilter("warehouse_id") && (
        <div>
        <InputFields
          label="Distributor"
          name="warehouse_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.warehouse}
          disabled={disabled || areaVal.length === 0 || areaOptions.length === 0}
          options={Array.isArray(warehouseOptions) ? warehouseOptions : []}
          value={warehouseVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("warehouse_id", val);
            onChangeArray("route_id", []);
          }}
          />
          {/* {isDistributorMissing && (
      <p className="text-red-500 text-xs mt-1">
        Distributor selection is mandatory
      </p>
    )} */}
          </div>
)}
      {/* Route */}
      {/* {showFilter("status") && (
        <InputFields
          label="Status"
          name="status"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.statusname}
          // disabled={disabled || warehouseVal.length === 0}
          options={Array.isArray(statusOptions) ? statusOptions : []}
          value={statusVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("status", val);
          }}
        />
      )} */}
      {/* Sales Team */}
      {/* {showFilter("model_id") && (
        <InputFields
          label="Model No"
          name="model_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.modelname}
          // disabled={disabled || routeVal.length === 0}
          options={Array.isArray(modelOptions) ? modelOptions : []}
          value={modelVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("model_id", val);
          }}
        />
      )} */}

 {showFilter("route_id") && (
        <InputFields
          label="Route"
          name="route_id"
          type="select"
          searchable={true}
          isSingle={false}
          multiSelectChips
          showSkeleton={skeleton.route}
          disabled={disabled || warehouseVal.length === 0}
          options={Array.isArray(routeOptions) ? routeOptions : []}
          value={routeVal as any}
          onChange={(e) => {
            const raw = (e as any)?.target?.value ?? e;
            const val = Array.isArray(raw)
              ? raw
              : typeof raw === "string"
              ? raw.split(",").filter(Boolean)
              : [];
            onChangeArray("route_id", val);
          }}
        />
      )}





      {/* Buttons */}
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <SidebarBtn
          isActive={false}
          type="button"
          onClick={() => clear()}
          label="Clear All"
          buttonTw="px-3 py-2 h-9"
          disabled={disabled || isClearing || activeFilterCount === 0}
        />
        <SidebarBtn
  isActive={true}
  type="button"
  onClick={async () => {
    await applyFilterApi();   
    // if (api) {
    //   await api(payload);    
    // }
    
  }}
  
  label="Apply Filter"
  buttonTw="px-4 py-2 h-9"
   disabled={disabled || isApplying || activeFilterCount === 0}
  
/>


      </div>
    </div>
  );
}
