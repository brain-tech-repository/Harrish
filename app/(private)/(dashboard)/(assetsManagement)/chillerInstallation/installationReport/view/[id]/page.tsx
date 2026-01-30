"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import Table, { listReturnType, TableDataType } from "@/app/components/customTable";
import ContainerCard from "@/app/components/containerCard";
import KeyValueData from "@/app/components/keyValueData";
import Link from "@/app/components/smartLink";

import { irReportByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";

/* ---------------------------------- Types --------------------------------- */

interface IRHeaderData {
    osa_code?: string;
    salesman?: string;
    status?: string;
}

const Status = [
    { label: "Waiting For Creating IR", value: "0" },
    { label: "IR Created", value: "1" },
    { label: "Technician Accepted", value: "2" },
    { label: "Technician Rejected", value: "3" },
    { label: "Reschedule By Technician", value: "4" },
    { label: "Request For Close", value: "5" },
    { label: "Closed", value: "6" },
];

/* -------------------------------- Component -------------------------------- */

export default function CustomerInvoicePage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();

    const id = Array.isArray(params?.id)
        ? params.id[0]
        : (params?.id as string);

    const [refreshKey, setRefreshKey] = useState(0);
    const [headerData, setHeaderData] = useState<IRHeaderData | null>(null);

    /* ------------------------------ Fetch Table ------------------------------ */

    const fetchIRO = useCallback(async (): Promise<listReturnType> => {
        try {
            setLoading(true);

            const res = await irReportByUUID(id);
            const data = res?.data;

            if (!data) {
                return { data: [], total: 0, currentPage: 1, pageSize: 0 };
            }

            // Header info (top card)
            setHeaderData({
                osa_code: data?.osa_code ?? "-",
                salesman: data?.salesman?.name ?? "-",
                status:
                    Status.find((s) => s.value === String(data?.status))?.label ?? "-",
            });

            const rows = data.details.map((detail: any) => ({
                id: detail.id,
                chiller_code: detail.chiller_code ?? "-",
                serial_number: detail.serial_number ?? "-",
                asset_number: detail.asset_number ?? "-",
                model: detail.model ?? "-",
                model_type: detail.model_type ?? "-",
                crf_code: detail.crf_code ?? "-",
                status: detail.status,
            }));

            return {
                data: rows,
                total: rows.length,
                currentPage: 1,
                pageSize: rows.length,
            };
        } catch (error) {
            showSnackbar("Failed to fetch IR details", "error");
            return { data: [], total: 0, currentPage: 1, pageSize: 0 };
        } finally {
            setLoading(false);
        }
    }, [id, setLoading, showSnackbar]);

    /* ------------------------------- Table Cols ------------------------------ */

    const columns = [
        { key: "chiller_code", label: "Chiller Code" },
        { key: "serial_number", label: "Serial Number" },
        { key: "asset_number", label: "Asset Number" },
        { key: "model", label: "Model Number" },
        { key: "model_type", label: "Model Type" },
        {
            key: "crf_code",
            label: "CRF Code",
            render: (row: any) => (
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-md text-sm">
                    {row.crf_code}
                </span>
            ),
        },
        {
            key: "status",
            label: "Installation Status",
            render: (row: any) => {
                const statusObj = Status.find(
                    (s) => String(s.value) === String(row.status)
                );
                return statusObj?.label ?? "-";
            },
        },
    ];

    /* ---------------------------------- JSX ---------------------------------- */

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/chillerInstallation/iro" back>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold">
                    Installation Request Order Details
                </h1>
            </div>

            <div className="flex flex-col h-full gap-4">
                {/* IR Basic Info */}
                <ContainerCard className="w-full">
                    <KeyValueData
                        title="Assets Basic Information"
                        data={[
                            { key: "IR Code", value: headerData?.osa_code ?? "-" },
                            { key: "Salesman", value: headerData?.salesman ?? "-" },
                            { key: "Status", value: headerData?.status ?? "-" },
                        ]}
                    />
                </ContainerCard>

                {/* Table */}
                <Table
                    refreshKey={refreshKey}
                    config={{
                        api: { list: fetchIRO },
                        header: {
                            columnFilter: true,
                            searchBar: false,
                        },
                        columns,
                        rowSelection: true,
                        localStorageKey: "invoice-table",
                        pageSize: 10,
                    }}
                />
            </div>
        </>
    );
}
