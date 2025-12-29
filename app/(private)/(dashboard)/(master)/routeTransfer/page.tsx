"use client";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useState, useEffect, useMemo } from "react";
import { 
    addRouteTransfer, 
    companyList, 
    regionList, 
    subRegionList, 
    warehouseList, 
    routeList 
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";

export default function StockTransfer() {
    const { can } = usePagePermissions();
    const { setLoading } = useLoading();
    const { showSnackbar } = useSnackbar();

    // Source State
    const [source, setSource] = useState({
        company: "",
        region: "",
        area: "",
        warehouse: "",
        route: ""
    });

    const [sourceOptions, setSourceOptions] = useState({
        companies: [] as any[],
        regions: [] as any[],
        areas: [] as any[],
        warehouses: [] as any[],
        routes: [] as any[]
    });

    // Destination State
    const [dest, setDest] = useState({
        company: "",
        region: "",
        area: "",
        warehouse: "",
        route: ""
    });

    const [destOptions, setDestOptions] = useState({
        companies: [] as any[],
        regions: [] as any[],
        areas: [] as any[],
        warehouses: [] as any[],
        routes: [] as any[]
    });

    // Initial Load - Companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await companyList({ dropdown: "true" });
                const options = (res?.data || []).map((c: any) => ({
                    value: String(c.id),
                    label: c.company_name || c.name
                }));
                setSourceOptions(prev => ({ ...prev, companies: options }));
                setDestOptions(prev => ({ ...prev, companies: options }));
            } catch (err) {
                console.error("Failed to fetch companies", err);
            }
        };
        fetchCompanies();
    }, []);

    // --- Source Cascading Logic ---

    // Fetch Source Regions when Source Company changes
    useEffect(() => {
        if (!source.company) {
            setSourceOptions(prev => ({ ...prev, regions: [], areas: [], warehouses: [], routes: [] }));
            setSource(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            return;
        }
        const fetchRegions = async () => {
            try {
                const res = await regionList({ company_id: source.company, dropdown: "true" });
                setSourceOptions(prev => ({ 
                    ...prev, 
                    regions: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.region_name || r.name })),
                    areas: [], warehouses: [], routes: []
                }));
                setSource(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchRegions();
    }, [source.company]);

    // Fetch Source Areas when Source Region changes
    useEffect(() => {
        if (!source.region) {
            setSourceOptions(prev => ({ ...prev, areas: [], warehouses: [], routes: [] }));
            setSource(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            return;
        }
        const fetchAreas = async () => {
            try {
                const res = await subRegionList({ region_id: source.region, dropdown: "true" });
                setSourceOptions(prev => ({ 
                    ...prev, 
                    areas: (res?.data || []).map((a: any) => ({ value: String(a.id), label: a.area_name || a.name })),
                    warehouses: [], routes: []
                }));
                setSource(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchAreas();
    }, [source.region]);

    // Fetch Source Warehouses when Source Area changes
    useEffect(() => {
        if (!source.area) {
            setSourceOptions(prev => ({ ...prev, warehouses: [], routes: [] }));
            setSource(prev => ({ ...prev, warehouse: "", route: "" }));
            return;
        }
        const fetchWarehouses = async () => {
            try {
                const res = await warehouseList({ area_id: source.area, dropdown: "true" });
                setSourceOptions(prev => ({ 
                    ...prev, 
                    warehouses: (res?.data || []).map((w: any) => ({ value: String(w.id), label: w.warehouse_name || w.name })),
                    routes: []
                }));
                setSource(prev => ({ ...prev, warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchWarehouses();
    }, [source.area]);

    // Fetch Source Routes when Source Warehouse changes
    useEffect(() => {
        if (!source.warehouse) {
            setSourceOptions(prev => ({ ...prev, routes: [] }));
            setSource(prev => ({ ...prev, route: "" }));
            return;
        }
        const fetchRoutes = async () => {
            try {
                const res = await routeList({ warehouse_id: source.warehouse, dropdown: "true" });
                setSourceOptions(prev => ({ 
                    ...prev, 
                    routes: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.route_name || r.name }))
                }));
            } catch (err) { console.error(err); }
        };
        fetchRoutes();
    }, [source.warehouse]);


    // --- Destination Cascading Logic ---

    // Fetch Dest Regions when Dest Company changes
    useEffect(() => {
        if (!dest.company) {
            setDestOptions(prev => ({ ...prev, regions: [], areas: [], warehouses: [], routes: [] }));
            setDest(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            return;
        }
        const fetchRegions = async () => {
            try {
                const res = await regionList({ company_id: dest.company, dropdown: "true" });
                setDestOptions(prev => ({ 
                    ...prev, 
                    regions: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.region_name || r.name })),
                    areas: [], warehouses: [], routes: []
                }));
                setDest(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchRegions();
    }, [dest.company]);

    // Fetch Dest Areas when Dest Region changes
    useEffect(() => {
        if (!dest.region) {
            setDestOptions(prev => ({ ...prev, areas: [], warehouses: [], routes: [] }));
            setDest(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            return;
        }
        const fetchAreas = async () => {
            try {
                const res = await subRegionList({ region_id: dest.region, dropdown: "true" });
                setDestOptions(prev => ({ 
                    ...prev, 
                    areas: (res?.data || []).map((a: any) => ({ value: String(a.id), label: a.area_name || a.name })),
                    warehouses: [], routes: []
                }));
                setDest(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchAreas();
    }, [dest.region]);

    // Fetch Dest Warehouses when Dest Area changes
    useEffect(() => {
        if (!dest.area) {
            setDestOptions(prev => ({ ...prev, warehouses: [], routes: [] }));
            setDest(prev => ({ ...prev, warehouse: "", route: "" }));
            return;
        }
        const fetchWarehouses = async () => {
            try {
                const res = await warehouseList({ area_id: dest.area, dropdown: "true" });
                setDestOptions(prev => ({ 
                    ...prev, 
                    warehouses: (res?.data || []).map((w: any) => ({ value: String(w.id), label: w.warehouse_name || w.name })),
                    routes: []
                }));
                setDest(prev => ({ ...prev, warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
        };
        fetchWarehouses();
    }, [dest.area]);

    // Fetch Dest Routes when Dest Warehouse changes
    useEffect(() => {
        if (!dest.warehouse) {
            setDestOptions(prev => ({ ...prev, routes: [] }));
            setDest(prev => ({ ...prev, route: "" }));
            return;
        }
        const fetchRoutes = async () => {
            try {
                const res = await routeList({ warehouse_id: dest.warehouse, dropdown: "true" });
                setDestOptions(prev => ({ 
                    ...prev, 
                    routes: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.route_name || r.name }))
                }));
            } catch (err) { console.error(err); }
        };
        fetchRoutes();
    }, [dest.warehouse]);

    // Filter Destination Routes (exclude source route if same hierarchy selected)
    const filteredDestRoutes = useMemo(() => {
        if (source.route && source.route === dest.route) {
             // In case user selected same route, maybe warn?
             // But primarily we filter options
        }
        return destOptions.routes.filter(r => r.value !== source.route);
    }, [destOptions.routes, source.route]);


    const handleSubmit = async () => {
        if (!source.route || !dest.route) {
            showSnackbar("Please select both origin and destination routes", "warning");
            return;
        }

        const payload = {
            old_route_id: Number(source.route),
            new_route_id: Number(dest.route),
        };

        try {
            setLoading(true);
            const res = await addRouteTransfer(payload);
            if (res?.error) {
                if (res?.errors) {
                    const errorMsg = Object.values(res.errors).flat().join(", ");
                    showSnackbar(errorMsg || "Validation failed", "error");
                } else {
                    showSnackbar(res?.message || "Route Transfer Failed", "error");
                }
            } else {
                showSnackbar("Route Transfer Successful ✅", "success");
                // Reset Forms
                setSource({ company: "", region: "", area: "", warehouse: "", route: "" });
                setDest({ company: "", region: "", area: "", warehouse: "", route: "" });
            }
        } catch (error) {
            console.error("Route transfer error:", error);
            showSnackbar("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContainerCard>
            <h1 className="text-[20px] font-semibold text-[#181D27] uppercase mb-6">
                Route Transfer
            </h1>

            {/* TRANSFER FROM SECTION */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Transfer From</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputFields
                        label="Company"
                        value={source.company}
                        options={sourceOptions.companies}
                        onChange={(e) => setSource({ ...source, company: e.target.value })}
                        searchable
                        placeholder="Select Company"
                    />
                    <InputFields
                        label="Region"
                        value={source.region}
                        options={sourceOptions.regions}
                        onChange={(e) => setSource({ ...source, region: e.target.value })}
                        disabled={!source.company}
                        searchable
                        placeholder="Select Region"
                    />
                    <InputFields
                        label="Area"
                        value={source.area}
                        options={sourceOptions.areas}
                        onChange={(e) => setSource({ ...source, area: e.target.value })}
                        disabled={!source.region}
                        searchable
                        placeholder="Select Area"
                    />
                    <InputFields
                        label="Warehouse"
                        value={source.warehouse}
                        options={sourceOptions.warehouses}
                        onChange={(e) => setSource({ ...source, warehouse: e.target.value })}
                        disabled={!source.area}
                        searchable
                        placeholder="Select Warehouse"
                    />
                    <InputFields
                        label="Route (Origin)"
                        value={source.route}
                        options={sourceOptions.routes}
                        onChange={(e) => setSource({ ...source, route: e.target.value })}
                        disabled={!source.warehouse}
                        searchable
                        placeholder="Select Origin Route"
                    />
                </div>
            </div>

            {/* TRANSFER TO SECTION */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Transfer To</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InputFields
                        label="Company"
                        value={dest.company}
                        options={destOptions.companies}
                        onChange={(e) => setDest({ ...dest, company: e.target.value })}
                        searchable
                        placeholder="Select Company"
                    />
                    <InputFields
                        label="Region"
                        value={dest.region}
                        options={destOptions.regions}
                        onChange={(e) => setDest({ ...dest, region: e.target.value })}
                        disabled={!dest.company}
                        searchable
                        placeholder="Select Region"
                    />
                    <InputFields
                        label="Area"
                        value={dest.area}
                        options={destOptions.areas}
                        onChange={(e) => setDest({ ...dest, area: e.target.value })}
                        disabled={!dest.region}
                        searchable
                        placeholder="Select Area"
                    />
                    <InputFields
                        label="Warehouse"
                        value={dest.warehouse}
                        options={destOptions.warehouses}
                        onChange={(e) => setDest({ ...dest, warehouse: e.target.value })}
                        disabled={!dest.area}
                        searchable
                        placeholder="Select Warehouse"
                    />
                    <InputFields
                        label="Route (Destination)"
                        value={dest.route}
                        options={filteredDestRoutes}
                        onChange={(e) => setDest({ ...dest, route: e.target.value })}
                        disabled={!dest.warehouse}
                        searchable
                        placeholder="Select Destination Route"
                    />
                </div>
            </div>


            {/* ACTION */}
            {can("create") && (
                <div className="flex justify-end mt-6 gap-4">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Submit Transfer
                    </button>
                </div>

            )}
        </ContainerCard>
    );
}
