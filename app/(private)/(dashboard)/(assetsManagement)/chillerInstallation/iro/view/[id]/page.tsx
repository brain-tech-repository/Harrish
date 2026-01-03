"use client";

import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    TableDataType
} from "@/app/components/customTable";
import StatusBtn from "@/app/components/statusBtn2";
import { iroViewList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Type definitions for the ACF API response
interface ChillerRequest {
    id: number;
    uuid: string;
    osa_code: string | null;
    owner_name: string;
    contact_number: string;
    landmark: string;
    outlet_id: number;
    existing_coolers: string;
    outlet_weekly_sale_volume: string;
    display_location: string;
    chiller_safty_grill: string;
    customer_id: number;
    machine_number: string;
    brand: string;
    asset_number: string | null;
    model: string;
    salesman_id: number;
    warehouse_id: number;
    status: number;
    fridge_status: number;
    iro_id: number;
    model_number: number;
    [key: string]: any; // For other fields we don't explicitly need
}

interface WorkflowStep {
    id: number;
    workflow_request_id: number;
    step_order: number;
    title: string;
    approval_type: string;
    status: string;
    uuid: string;
    [key: string]: any;
}

interface ACFDataRow {
    chiller_request: ChillerRequest;
    workflow_request_id: number;
    approved_steps: WorkflowStep[];
    pending_steps: WorkflowStep[];
    customer?: { code?: string; name?: string };
    warehouse?: { code?: string; name?: string };
    outlet?: { code?: string; name?: string };
    salesman?: { code?: string; name?: string };
}

const hasChillerRequest = (data: TableDataType): data is TableDataType & { chiller_request: ChillerRequest } => {
    return data && typeof data === 'object' && 'chiller_request' in data &&
        data.chiller_request !== null && typeof data.chiller_request === 'object';
};

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

// 🔹 Table Columns
const columns = [
    {
        key: "osa_code",
        label: "OSA Code",
    },
    {
        key: "warehouse",
        label: "Distributors",
    },
    {
        key: "created_user",
        label: "Regional Manager",
    },
    {
        key: "created_date",
        label: "Date",
        render: (data: any) => (
            formatDate(data.created_at)
        )
    },
    {
        key: "status",
        label: "Status",
        render: (data: any) => (
            <StatusBtn isActive={data.status === 1} />
        )
    },

];


export default function CustomerInvoicePage() {
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const router = useRouter();
    const params = useParams();
    const id: string = Array.isArray(params?.id)
        ? params?.id[0]
        : (params?.id as string);
    const [threeDotLoading, setThreeDotLoading] = useState({
        csv: false,
        xlsx: false,
    });
    const [filters, setFilters] = useState({
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        region: "",
        routeCode: "",
    });
    const {
        warehouseAllOptions,
        routeOptions,
        regionOptions,
        areaOptions,
        assetsModelOptions
        , ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseAllLoaded } = useAllDropdownListData();

    // Load dropdown data
    useEffect(() => {
        ensureAreaLoaded();
        ensureAssetsModelLoaded();
        ensureRegionLoaded();
        ensureRouteLoaded();
        ensureWarehouseAllLoaded();
    }, [ensureAreaLoaded, ensureAssetsModelLoaded, ensureRegionLoaded, ensureRouteLoaded, ensureWarehouseAllLoaded]);

    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // 🔹 Fetch Invoices
    const fetchIRO = useCallback(
        async (
            page: number = 1,
            pageSize: number = 50,
            appliedFilters: Record<string, any> = {}
        ): Promise<listReturnType> => {
            try {
                setLoading(true);

                const result = await iroViewList(id, params);
                console.log("result1", result);

                const mapped =
                    result?.data?.map((h: any) => {
                        const details = Array.isArray(h.details) ? h.details : [];
                        const firstDetail = details[0] || {};

                        return {
                            uuid: h.uuid,
                            osa_code: h.osa_code,
                            warehouse: firstDetail.warehouse_name || "-",
                            created_user:
                                firstDetail.created_user
                                || "-",
                            created_date: firstDetail.created_date ?? "-",
                            status: h.status,
                            chiller_request: firstDetail.chillerRequest
                                ? {
                                    uuid: firstDetail.chillerRequest.uuid,
                                }
                                : null,
                        };
                    }) || [];

                return {
                    data: mapped,
                    total: mapped.length,
                    currentPage: 1,
                    pageSize: mapped.length,
                };
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to fetch IRO list", "error");

                return {
                    data: [],
                    total: 0,
                    currentPage: 1,
                    pageSize: 0,
                };
            } finally {
                setLoading(false);
            }
        },
        [setLoading, showSnackbar]
    );



    useEffect(() => {
        setRefreshKey((k) => k + 1);
    }, [
        routeOptions,
        warehouseAllOptions,
        areaOptions,
        regionOptions,
        assetsModelOptions
    ]);

    return (
        <div className="flex flex-col h-full">
            {/* 🔹 Table Section */}
            <Table
                refreshKey={refreshKey}
                config={{
                    api: { list: fetchIRO },
                    header: {
                        title: "Installation Request Order",
                        columnFilter: true,
                        searchBar: false,
                    },
                    footer: { nextPrevBtn: true, pagination: true },
                    columns,
                    rowSelection: true,

                    localStorageKey: "invoice-table",
                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) => {
                                if (hasChillerRequest(row)) {
                                    router.push(`/assetsRequest/view/${row.chiller_request.uuid}`);
                                } else {
                                    showSnackbar("Invalid row data", "error");
                                }
                            },
                        },
                    ],
                    pageSize: 10,
                }}
            />
        </div>
    );
}
