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
import filterRequest from "@/app/components/filterRequest";

import {
  assetsRequestExport,

  chillerRequestGlobalSearch,
  chillerRequestList,
  crfExport,
  deleteChillerRequest,
} from "@/app/services/assetsApi";
import { AssestRequestFilter } from "@/app/services/allApi";
import StatusBtn from "@/app/components/statusBtn2";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import { downloadFile } from "@/app/services/allApi";

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
  outlet?: string;
  salesman?: string;
  machine_number?: string;
  asset_number?: string;
  model?: string;
  brand?: string;
  status?: number | string;
}

export default function Page() {
  const { can, permissions } = usePagePermissions();
  const { setLoading } = useLoading();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [payload, setPayload] = useState<Record<string, any>>({});
  const [deleteSelectedRow, setDeleteSelectedRow] = useState<string | null>(
    null
  );
  const [threeDotLoading, setThreeDotLoading] = useState({
    csv: false,
    xlsx: false,
  });
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh table when permissions load
  useEffect(() => {
    if (permissions.length > 0) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [permissions]);

  const router = useRouter();
  const { showSnackbar } = useSnackbar();
   const [tableFilters, setTableFilters] = useState<any>({});


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


const filterBy = useCallback(
    async (payload: Record<string, string | number | null>, pageSize = 10) => {
       const finalPayload = { ...tableFilters, ...payload }; // parent state + table payload
      setTableFilters(payload);

      const res = await AssestRequestFilter(finalPayload);

      return {
        data: res?.data || [],
        total: res?.pagination?.totalPages || 0,
        currentPage: res?.pagination?.page || 0,
        pageSize: res?.pagination?.limit || pageSize,
      };
    },
    [tableFilters]  // dependency array
  );




  const fetchTableData = useCallback(

    async (
      pageNo: number = 1,
      pageSize: number = 10,
      filters?: any
    ): Promise<listReturnType> => {
      setLoading(true);
      const res = await chillerRequestList({
        page: pageNo.toString(),
        per_page: pageSize.toString(),
        ...filters
      });
      // console.log("Fetched data:", res.data);
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
          total: res?.pagination?.lastpage || 0,
        };
      }
    },
    [setLoading, showSnackbar]
  );
// console.log("Render Page Component",fetchTableData);
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
      const response = await crfExport({ format });
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
              // search: searchChillerRequest,
              // filterBy: filterBy,
               
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
              searchBar: false,
              columnFilter: true,
              filterRenderer:filterRequest,
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
                key: "osa_code",
                label: "OSA Code",
              },
              {
                key: "owner_name",
                label: "Owner Name",
              },
              {
                key: "contact_number",
                label: "Contact Number",
              },

              // Combined Relationship Fields
              {
                key: "customer",
                label: "Customer",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "customer"),
              },
              {
                key: "warehouse",
                label: "Distributor",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "warehouse"),
              },
              {
                key: "outlet",
                label: "Outlet",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "outlet"),
              },
              {
                key: "salesman",
                label: "Sales Team",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "salesman"),
              },

              // Key Chiller Detailss
              {
                key: "machine_number",
                label: "Machine No",
              },
              {
                key: "asset_number",
                label: "Asset No",
              },
 {
                key: "model",
                label: "Model",
                render: (data: TableDataType) =>
                  renderCombinedField(data, "model"),
              },



              // {
              //   key: "model",
              //   label: "Model",
              // },
              {
                key: "brand",
                label: "Brand",
              },

              // Status
              {
                key: "status",
                label: "Status",
                render: (data: TableDataType) => (
                  <StatusBtn
                    isActive={
                      data.status && data.status.toString() === "1"
                        ? true
                        : false
                    }
                  />
                ),
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
