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
import { assestMasterQR, downloadQR } from "@/app/services/allApi";
import { ref, string } from "yup";
import { format } from "date-fns/format";
import { Params } from "next/dist/server/request/params";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AssetLabel from "./details/page";
//  import { generateAssetLabelPdfDirect } from "@/app/utils";
// import { generateAssetLabelPdfDirect } from "@/app/utils/generateAssetQrPdfDirect";
import { generateAssetLabelPdfDirect } from "./utils/util";








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
  
  const [pdfData, setPdfData] = useState<any | null>(null);
  // const pdfRef = useRef<HTMLDivElement | null>(null);
  
const labelRef = useRef<HTMLDivElement>(null);


  

const uuid = paramsRoute?.uuid as string;


  const fetchServiceTypes = useCallback(
    async (pageNo: number = 1, pageSize: number = 10): Promise<listReturnType> => {
      setLoading(true);
      const res = await chillerList({
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
    async (
      query: string,
      pageSize: number = 10,
      columnName?: string
    ): Promise<listReturnType> => {
      try {
        setLoading(true);

        // 🔒 Guard clause
        if (!columnName) {
          return {
            data: [],
            currentPage: 0,
            pageSize,
            total: 0,
          };
        }

        const res = await chillerList({
          query,
          per_page: pageSize.toString(),
          [columnName]: query,
        });

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
        // ✅ always runs (success or error)
        setLoading(false);
      }
    },
    []
  );

  const handleExport = async (fileType: "csv" | "xlsx") => {
    try {
      setLoading(true);

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
      setLoading(false);
      setShowExportDropdown(false);
    }
  };


  useEffect(() => {
    setLoading(true);
  }, [])
  // ########################################################
    const filterBy = useCallback(
    async (
      payload: Record<string, string | number | null>,
      pageSize: number,
    ): Promise<listReturnType> => {
      let result;
      // setLoading(true);
      try {
        const params: Record<string, string> = {
          per_page: pageSize.toString(),
        };
        Object.keys(payload || {}).forEach((k) => {
          const v = payload[k as keyof typeof payload];
          if (v !== null && typeof v !== "undefined" && String(v) !== "") {
            params[k] = String(v);
          }
        });
        result = await assestMasterQR( uuid, params);
      } finally {
        // setLoading(false);
      }

      if (result?.error)
        throw new Error(result.data?.message || "Filter failed");
      else {
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
    },
    [],
  );


















  // ################################################################################

// useEffect(() => {
//   if (!pdfData || !labelRef.current) return;

//   const generatePdf = async () => {
//     await new Promise((r) => setTimeout(r, 300));

//     const canvas = await html2canvas(labelRef.current!, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF("landscape", "px", [
//       canvas.width,
//       canvas.height,
//     ]);

//     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
//     pdf.save(`asset-${pdfData.uuid}.pdf`);

//     setPdfData(null); // cleanup
//   };

//   generatePdf();
// }, [pdfData]);
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
            
              search: searchChiller,
              filterBy,
            },
            header: {
              title: "Assets Master",
              threeDot: [
                {
                  icon: "gala:file-document",
                  label: "Export CSV",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("csv");
                  },
                },
                {
                  icon: "gala:file-document",
                  label: "Export Excel",
                  onClick: (data: TableDataType[], selectedRow?: number[]) => {
                    handleExport("xlsx");
                  },
                },
              ],
              searchBar: true,
              columnFilter: true,
              actions: can("create") ? [
                <SidebarBtn
                  key="name"
                  href="/assetsMaster/add"
                  leadingIcon="lucide:plus"
                  label="Add"
                  labelTw="hidden lg:block"
                  isActive
                />,
                 <SidebarBtn
                  key="name"
                  href="/assetsMaster/details"
                  leadingIcon="lucide:plus"
                  label="barcode"
                  labelTw="hidden lg:block"
                  isActive
                />,
              ] : [],
               



            },
            localStorageKey: "assetsMasterTable",
            table: {
              height: 400
            },
            footer: { nextPrevBtn: true, pagination: true },
            columns: [
              {
                key: "osa_code", label: "OSA Code",
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.osa_code}
                  </span>
                ),
              },
              {
                key: "sap_code", label: "SAP Code",
                render: (row: TableDataType) => (
                  <span className="font-semibold text-[#181D27] text-[14px]">
                    {row.sap_code}
                  </span>
                ),
              },
              { key: "serial_number", label: "Serial Number" },
              {
                key: "assets_category", label: "Assests Category Name", render: (data: TableDataType) =>
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
              { key: "acquisition", label: "Acquisition" },
              {
                key: "vendor", label: "Vendor", render: (data: TableDataType) =>
                  typeof data.vendor === "object" && data.vendor !== null
                    ? `${(data.vendor as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "manufacturer", label: "Manufacturer", render: (data: TableDataType) =>
                  typeof data.manufacturer === "object" && data.manufacturer !== null
                    ? `${(data.manufacturer as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "country", label: "Country", render: (data: TableDataType) =>
                  typeof data.country === "object" && data.country !== null
                    ? `${(data.country as { name?: string }).name || ""}`
                    : "-",
              },
              {
                key: "branding", label: "Branding", render: (data: TableDataType) =>
                  typeof data.branding === "object" && data.branding !== null
                    ? `${(data.branding as { name?: string }).name || ""}`
                    : "-",
              },
              { key: "assets_type", label: "Assets Type" },
              { key: "trading_partner_number", label: "Trading Partner No." },
              { key: "capacity", label: "Capacity" },
              { key: "manufacturing_year", label: "Manufacturing Year" },
              { key: "remarks", label: "Remarks" },
              {
                key: "status", label: "Status", render: (data: TableDataType) =>
                  typeof data.status === "object" && data.status !== null
                    ? `${(data.status as { name?: string }).name || ""}`
                    : "-",
              },
            ],
            rowSelection: true,
            rowActions: [
              {
                icon: "lucide:eye",
                onClick: (data: TableDataType) => {
                  router.push(`/assetsMaster/view/${data.uuid}`);
                },
              },
              {
                icon: "lucide:download",
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
{/* 
      {pdfData && (
  <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
    <AssetLabel ref={pdfRef} data={pdfData} />
  </div>
)}  */}







    </>
  );
} 
