"use client";

import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table, {
    listReturnType,
    TableDataType
} from "@/app/components/customTable";
import StatusBtn from "@/app/components/statusBtn2";
import { iroList } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "../../../(master)/salesTeam/details/[uuid]/page";

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
    [key: string]: any;
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

const columns = [
    {
        key: "osa_code",
        label: "OSA Code",
    },
    {
        key: "warehouse",
        label: "Distributors",
        render: (data: TableDataType) => {
            // Try to get warehouse from first details entry if available
            if (Array.isArray(data.details) && data.details.length > 0 && data.details[0].warehouse) {
                const wh = data.details[0].warehouse;
                return `${wh.warehouse_code || ''} - ${wh.warehouse_name || ''}`;
            }
            return "-";
        },
    },
    {
        key: "created_user",
        label: "Regional Manager",
    },
    {
        key: "created_at",
        label: "Created Date",
        render: (data: any) => formatDate(data.created_at)
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
   
    const [refreshKey, setRefreshKey] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (name: string, value: string) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

        const fetchIRO = useCallback(
            async (
                page: number = 1,
                pageSize: number = 20,
                appliedFilters: Record<string, any> = {}
            ): Promise<listReturnType> => {
                try {
                    setLoading(true);
    
                    const result = await iroList({
                        current_page: page.toString(),
                        per_page: pageSize.toString(),
                        ...appliedFilters,
                    });
    
                    if (result?.data && result?.pagination) {
                        const totalPages = Math.ceil(result.pagination.total / result.pagination.per_page);
                        return {
                            data: Array.isArray(result.data) ? result.data : [],
                            total: totalPages, // total number of PAGES, not records
                            currentPage: result.pagination.current_page,
                            pageSize: result.pagination.per_page,
                        };
                    }
    
                    if (Array.isArray(result)) {
                        return {
                            data: result,
                            total: result.length,
                            currentPage: page,
                            pageSize: pageSize,
                        };
                    }
    
                    // Handle object response without pagination
                    if (result?.data) {
                        return {
                            data: Array.isArray(result.data) ? result.data : [],
                            total: result?.pagination?.total || (Array.isArray(result.data) ? result.data.length : 0),
                            currentPage: result?.pagination?.current_page || page,
                            pageSize: result?.pagination?.per_page || pageSize,
                        };
                    }
    
                    // Fallback
                    console.warn("⚠️ Unexpected response structure");
                    return {
                        data: [],
                        total: 0,
                        currentPage: 1,
                        pageSize: pageSize,
                    };
                } catch (error) {
                    // console.error("❌ Error fetching installation reports:", error);
                    showSnackbar("Failed to fetch installation report list", "error");
    
                    return {
                        data: [],
                        total: 1,
                        currentPage: 1,
                        pageSize: pageSize,
                    };
                } finally {
                    setLoading(false);
                }
            },
            [setLoading, showSnackbar]
        );


    return (
        <div className="flex flex-col h-full">
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
                    // rowSelection: true,

                    rowActions: [
                        {
                            icon: "lucide:eye",
                            onClick: (row: TableDataType) => {
                                console.log(row);
                                router.push(`/chillerInstallation/iro/view/${row.id}`);
                            },
                        },
                    ],
                    pageSize: 50,
                }}
            />
        </div>
    );
}
