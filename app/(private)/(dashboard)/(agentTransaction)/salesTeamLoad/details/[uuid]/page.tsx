"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import Table, { configType } from "@/app/components/customTable";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import Logo from "@/app/components/logo";
import {
  salesmanLoadByUuid,
  exportSalesmanLoadDownload,
} from "@/app/services/agentTransaction";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, RefObject, useRef } from "react";
import PrintButton from "@/app/components/printButton";
import { downloadFile } from "@/app/services/allApi";
import WorkflowApprovalActions from "@/app/components/workflowApprovalActions";
import TabBtn from "@/app/components/tabBtn";
interface CustomerItem {
  id: number;
  uuid: string;
  osa_code: string;
  request_step_id: number;
  salesman_type: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  route: { id: number; code: string; name: string };
  salesman: { id: number; code: string; name: string };
  project_type: { id: number; code: string; name: string };
  details: Array<{
    id: number;
    uuid: string;
    osa_code: string;
    item: { id: number;erp_code:string; code: string; name: string };
    uom_name: string;
    qty: number;
    price: string;
    status: number;
  }>;
}

const backBtnUrl = "/salesTeamLoad";

export default function ViewPage() {
  const params = useParams();
  const uuid = Array.isArray(params?.uuid)
    ? params?.uuid[0] || ""
    : (params?.uuid as string) || "";

  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [loading, setLoadingState] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("overview");
  const title = `Load #${customer?.osa_code || "-"}`;

  const tabList = [
        { key: "overview", label: "Overview" },
        { key: "items", label: "Load Items" },
    ];
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await salesmanLoadByUuid(uuid);
        if (res.error) {
          showSnackbar(
            res.data?.message || "Unable to fetch Salesman Load Details",
            "error"
          );
          return;
        }
        setCustomer(res.data);
      } catch {
        showSnackbar("Unable to fetch Salesman Load Details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, setLoading, showSnackbar]);

  // ✅ Table config
  const columns: configType["columns"] = [
    { key: "item", label: "Item" },
    { key: "uom", label: "UOM" },
    { key: "qty", label: "Quantity" },
  ];

  // ✅ Prepare table data
  const tableData =
    customer?.details?.map((detail) => ({
      item: detail.item ? `${detail.item.erp_code} - ${detail.item.name}` : "-",
      uom: detail.uom_name || "-",
      qty: detail.qty?.toString() ?? "-",
      price: detail.price ?? "-",
    })) || [];

  const targetRef = useRef<HTMLDivElement | null>(null);

  const onTabClick = async (idx: number) => {
        // ensure index is within range and set the corresponding tab key
        if (typeof idx !== "number") return;
        if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
        setActiveTab(tabList[idx].key);
    };
  return (
    <>
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon
            icon="lucide:arrow-left"
            width={24}
            className="cursor-pointer"
          />
        </Link>
        <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px]">
          {title}
        </h1>
      </div>

      <WorkflowApprovalActions
        requestStepId={customer?.request_step_id}
        redirectPath={backBtnUrl}
        model="Load_Header"
      />

      {/* ---------- Main Card ---------- */}
      <div ref={targetRef}>
        <ContainerCard>
          {/* Add print-area wrapper */}
          <div id="print-area">
            {/* Top Section */}
            <div className="flex justify-between flex-wrap gap-6 items-start">
              <Logo type="full" />
              <div className="text-right">
                <div className="flex flex-col items-end">
                  <span className="text-[42px] uppercase text-[#A4A7AE] mb-[10px]">
                    Load
                  </span>
                  <span className="text-primary text-[14px] tracking-[8px]">
                    #{customer?.osa_code || "-"}
                  </span>
                </div>
              </div>
            </div>



            <hr className="border-gray-200 my-5" />

             <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
                            {tabList.map((tab, index) => (
                                <div key={index}>
                                    <TabBtn
                                        label={tab.label}
                                        isActive={activeTab === tab.key}
                                        onClick={() => onTabClick(index)}
                                    />
                                </div>
                            ))}
                        </ContainerCard>
{activeTab === "overview" && (
                <div className="m-auto">
                    <div className="flex flex-wrap gap-x-[20px]">
                        <div className="mb-4">
                        </div>
                        <div className="flex flex-col gap-6 w-full md:flex-row md:gap-6">
                            <div className="flex-1 w-full">
                                <ContainerCard className="w-full h-full">
                                    <KeyValueData
                                        title="Overview"
                                         data={[
                    {
                      key: "Distributor",
                      value:
                        customer?.warehouse?.code && customer?.warehouse?.name
                          ? `${customer.warehouse.code} - ${customer.warehouse.name}`
                          : "-",
                    },
                    {
                      key: "Route",
                      value: customer?.route
                        ? `${customer.route.code} - ${customer.route.name}`
                        : "-",
                    },
                    {
                      key: "Sales Team Type",
                      value: customer?.salesman_type?.name || "-",
                    },
                    {
                      key: "Project Type",
                      value: customer?.project_type?.name || "-",
                    },
                    {
                      key: "Sales Team",
                      value: customer?.salesman
                        ? `${customer.salesman.code} - ${customer.salesman.name}`
                        : "-",
                    },
                  ]}
                                    />
                                  
                                </ContainerCard>
                            </div>
                          
                        </div>
                    </div>
                </div>
            )}


            {activeTab === "items" && (
                // <ContainerCard >

                <div className="flex flex-col h-full">
                    <Table data={tableData} config={{ columns }} />
                 
                </div>

                // </ContainerCard>
            )}
          </div>


          {/* <div  className="flex flex-wrap justify-end gap-4 pt-4 print:hidden">
            <PrintButton
              targetRef={targetRef as unknown as RefObject<HTMLElement>}
            />
          </div> */}
        </ContainerCard>
      </div>
    </>
  );
}
