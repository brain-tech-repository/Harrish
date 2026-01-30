"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useRouter } from "next/navigation";
import DismissibleDropdown from "@/app/components/dismissibleDropdown";
import CustomDropdown from "@/app/components/customDropdown";
import BorderIconButton from "@/app/components/borderIconButton";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import DeleteConfirmPopup from "@/app/components/deletePopUp";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import {
  assetsRequestExport,
  chillerRequestGlobalSearch,
  chillerRequestList,
  crfExport,
  deleteChillerRequest,
  // assetrequestGlobalFilter
} from "@/app/services/assetsApi";
import FilterComponent from "@/app/components/filterComponent";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { downloadFile } from "@/app/services/allApi";
import { formatDate } from "../../(master)/salesTeam/details/[uuid]/page";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
const dropdownDataList = [
  { icon: "lucide:radio", label: "Inactive", iconWidth: 20 },
  { icon: "lucide:delete", label: "Delete", iconWidth: 20 },
];

interface LocalTableDataType {
  id?: number | string;
  uuid?: string;
  osa_code?: string;
  owner_name?: string;
  contact_number?: string;
  customer?: string;
  warehouse?: string;
  outlet?: { code: string; name: string };
  salesman?: string;
  machine_number?: string;
  asset_number?: string;
  model?: { code: string; name: string };
  brand?: string;
  approval_status?: string;
  status?: number | string;
}

const CHILLER_REQUEST_STATUS_MAP: Record<string | number, string> = {
  1: "Sales Team Requested",
  2: "Area Sales Manager Accepted",
  3: "Area Sales Manager Rejected",
  4: "Chiller Officer Accepted",
  5: "Chiller Officer Rejected",
  6: "Completed",
  7: "Chiller Manager Rejected",
  8: "Sales/Key Manager Rejected",
  9: "Refused by Customer",
  10: "Fridge Manager Accepted",
  11: "Fridge Manager Rejected",
};


export default function Page() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(
    null
  );
  const { warehouseAllOptions, ensureWarehouseAllLoaded,salesmanOptions,ensureSalesmanLoaded } =
    useAllDropdownListData();
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [salesmanId, setSalesmanId] = useState<string>("");
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  const [colFilter, setColFilter] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    ensureWarehouseAllLoaded();
    ensureSalesmanLoaded();
  }, [ensureWarehouseAllLoaded, ensureSalesmanLoaded]);
  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  const handleConfirmDelete = async () => {
    if (deleteSelectedRow) {
      const res = await deleteChillerRequest(deleteSelectedRow.toString());
      if (res.error) {
        showSnackbar(
          res.data.message || "failed to delete the Chiller Request",
          "error"
        );
        throw new Error("Unable to delete the Chiller Request");
      } else {
        showSnackbar(
          res.message ||
          `Deleted Chiller Request with ID: ${deleteSelectedRow}`,
          "success"
        );
        setShowDeletePopup(false);
        setRefreshKey((prev) => prev + 1);
      }
    }
  };
  useEffect(() => {
  setRefreshKey((prev) => prev + 1);
  }, [warehouseId, salesmanId]);

  const fetchTableData = useCallback(
    async (
      pageNo: number = 1,
      pageSize: number = 10
    ): Promise<listReturnType> => {
      setLoading(true);
      const params : any ={page: pageNo.toString(),
        limit: pageSize.toString(),}
        if(warehouseId){
          params.warehouse_id=warehouseId;
        }
        if(salesmanId){
          params.salesman_id=salesmanId;
        }
      const res = await chillerRequestList(params);
      setLoading(false);
      if (res.error) {
        showSnackbar(
          res.data.message || "failed to fetch the Chiller Requests",
          "error"
        );
        throw new Error("Unable to fetch the Chiller Requests");
      } else {
        return {
          data: res.data || [],
          currentPage: res?.pagination?.page || 0,
          pageSize: res?.pagination?.limit || 10,
          total: res?.pagination?.totalPages || 0,
        };
      }
    },
    [setLoading, showSnackbar, warehouseId, salesmanId]
  );

  // Helper function to render nested object data
  const renderNestedField = (
    data: TableDataType,
    field: string,
    subField: string
  ) => {
    if (
      data[field] &&
      typeof data[field] === "object" &&
      data[field] !== null &&
      subField in (data[field] as object)
    ) {
      return (data[field] as Record<string, string>)[subField] || "-";
    }
    return "-";
  };

  // Helper to combine code and name
  const renderCombinedField = (data: TableDataType, field: string) => {
    const code = renderNestedField(data, field, "code");
    const name = renderNestedField(data, field, "name");
    if (code !== "-" && name !== "-") {
      return `${code} - ${name}`;
    } else if (name !== "-") {
      return name;
    } else if (code !== "-") {
      return code;
    }
    return "-";
  };

  const searchChillerRequest = useCallback(
    async (
      query: string,
      pageSize: number = 50,
      columnName?: string,
      page: number = 1,
    ): Promise<listReturnType> => {
      try {
        // setLoading(true);
        const res = await chillerRequestGlobalSearch({ search: query, page: page.toString(), per_page: pageSize.toString() });
        // setLoading(false);
        const data = res.data.map((item: LocalTableDataType) => ({
          ...item,
        }));

        return {
          data: data || [],
          total: res.pagination.last_page || 1,
          currentPage: res.pagination.current_page || page,
          pageSize: res.pagination.per_page || pageSize,
        };
      } catch (error) {
        setLoading(false);
        console.error(error);
        throw error;
      }
    },
    []
  );

  const exportFile = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      // setLoading(true);
      // Pass selected format to the export API
      setThreeDotLoading((prev) => ({ ...prev, [format]: true }));
      const response = await crfExport({ format,warehouse_id:warehouseId,salesman_id:salesmanId });
      // const url = response?.url || response?.data?.url;
      const url = response?.download_url || response?.url || response?.data?.url;
      if (url) {
        await downloadFile(url);
        showSnackbar("File downloaded successfully", "success");
      } else {
        showSnackbar("Failed to get download file", "error");
      }
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } catch (error) {
      console.error("Export failed:", error);
      showSnackbar("Failed to download invoices", "error");
      setThreeDotLoading((prev) => ({ ...prev, [format]: false }));
    } finally {
      // setLoading(false);
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
              list: fetchTableData,
              search: searchChillerRequest,
            },
            header: {
              title: "Assets Requests",
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
                  onClick: () => !threeDotLoading.xlsx && exportFile("xlsx"),
                },],
              searchBar: true,
              columnFilter: true,
              // filterRenderer: (props) => (
              //                 <FilterComponent
              //                   currentDate={true}
              //                   {...props}
              //                   api={fetchAssetAccordingToGlobalFilter}
              //                 />
              //               ),
              // actions: can("create") ? [
              //   <SidebarBtn
              //     key="name"
              //     href="/assetsRequest/add"
              //     leadingIcon="lucide:plus"
              //     label="Add"
              //     labelTw="hidden lg:block"
              //     isActive
              //   />,
              // ] : [],
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              // Essential Information
              {
                key: "date",
                label: "Date",
                render: (data: TableDataType) => formatDate(data.created_at),
              },
              {
                key: "osa_code",
                label: "OSA Code",
              },
              {
                key: "warehouse",
                label: "Distributor",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "warehouse"),
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
                key: "customer",
                label: "Customer",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "customer"),
              },

              {
                key: "contact_number",
                label: "Contact Number",
              },

              // Combined Relationship Fields
              {
                key: "salesman",
                label: "Sales Team",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "salesman"),
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
                key: "outlet",
                label: "Outlet",
                render: (data: TableDataType) =>
                  data.outlet.name,
              },


              {
                key: "asset_number",
                label: "Asset Number",
              },
              {
                key: "model",
                label: "Model Number",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "model"),
              },



              // Status
              {
                key: "status",
                label: "Status",
                render: (data: TableDataType) =>
                  CHILLER_REQUEST_STATUS_MAP[data.status ?? ""] || "-",
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsRequest/view/${data.uuid}`);
                },
              },
              ...(can("edit") ? [{
                icon: "lucide:edit-2",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsRequest/${data.uuid}`);
                },
              }] : []),

            ],
            pageSize: 50,
          }}
        />
      </div>

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <DeleteConfirmPopup
            title="Chiller Request"
            onClose={() => setShowDeletePopup(false)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </>
  );
}
