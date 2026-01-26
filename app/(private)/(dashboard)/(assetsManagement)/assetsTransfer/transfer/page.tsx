"use client";

import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import { useState, useEffect, useMemo } from "react";
import {
    assetsTransfer,
    
    addRouteTransfer,
    companyList,
    regionList,
    subRegionList,
    warehouseList,
    routeList,
    getRouteTransferList
} from "@/app/services/allApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import Popup from "@/app/components/popUp";
import { Icon } from "@iconify-icon/react";

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
        route: "",
         from_warehouse_id: "",
          

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
        route: "",
         to_warehouse_id: "",

    });

    const [destOptions, setDestOptions] = useState({
        companies: [] as any[],
        regions: [] as any[],
        areas: [] as any[],
        warehouses: [] as any[],
        routes: [] as any[]
    });

    const [skeletons, setSkeletons] = useState({
        sourceCompany: false,
        sourceRegion: false,
        sourceArea: false,
        sourceWarehouse: false,
        sourceRoute: false,
        destCompany: false,
        destRegion: false,
        destArea: false,
        destWarehouse: false,
        destRoute: false,
    });

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Initial Load - Companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setSkeletons(prev => ({ ...prev, sourceCompany: true, destCompany: true }));
                const res = await companyList({ dropdown: "true" });
                const options = (res?.data || []).map((c: any) => ({
                    value: String(c.id),
                    label: c.company_name || c.name
                }));
                setSourceOptions(prev => ({ ...prev, companies: options }));
                setDestOptions(prev => ({ ...prev, companies: options }));
            } catch (err) {
                console.error("Failed to fetch companies", err);
            } finally {
                setSkeletons(prev => ({ ...prev, sourceCompany: false, destCompany: false }));
            }
        };
        fetchCompanies();
    }, []);

    // Fetch History
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await getRouteTransferList();
            setHistoryData(Array.isArray(res?.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch history", err);
            // showSnackbar("Failed to load history", "error");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (isHistoryOpen) {
            fetchHistory();
        }
    }, [isHistoryOpen]);

    // --- Source Cascading Logic ---

    // Fetch Source Regions when Source Company changes
    console.log("source",source);
    console.log("dest",dest);
    useEffect(() => {
        if (!source.company) {
            setSourceOptions(prev => ({ ...prev, regions: [], areas: [], warehouses: [], routes: [] }));
            setSource(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            return;
        }
        const fetchRegions = async () => {
            try {
                setSkeletons(prev => ({ ...prev, sourceRegion: true }));
                const res = await regionList({ company_id: source.company, dropdown: "true" });
                setSourceOptions(prev => ({
                    ...prev,
                    regions: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.region_name || r.name })),
                    areas: [], warehouses: [], routes: []
                }));
                setSource(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, sourceRegion: false })); }
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
                setSkeletons(prev => ({ ...prev, sourceArea: true }));
                const res = await subRegionList({ region_id: source.region, dropdown: "true" });
                setSourceOptions(prev => ({
                    ...prev,
                    areas: (res?.data || []).map((a: any) => ({ value: String(a.id), label: a.area_name || a.name })),
                    warehouses: [], routes: []
                }));
                setSource(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, sourceArea: false })); }
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
                setSkeletons(prev => ({ ...prev, sourceWarehouse: true }));
                const res = await warehouseList({ area_id: source.area, dropdown: "true" });
                setSourceOptions(prev => ({
                    ...prev,
                    warehouses: (res?.data || []).map((w: any) => ({ value: String(w.id), label: w.warehouse_name || w.name })),
                    routes: []
                }));
                setSource(prev => ({ ...prev, warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, sourceWarehouse: false })); }
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
                setSkeletons(prev => ({ ...prev, sourceRoute: true }));
                const res = await routeList({ warehouse_id: source.warehouse, dropdown: "true" });
                setSourceOptions(prev => ({
                    ...prev,
                    routes: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.route_name || r.name }))
                }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, sourceRoute: false })); }
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
                setSkeletons(prev => ({ ...prev, destRegion: true }));
                const res = await regionList({ company_id: dest.company, dropdown: "true" });
                setDestOptions(prev => ({
                    ...prev,
                    regions: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.region_name || r.name })),
                    areas: [], warehouses: [], routes: []
                }));
                setDest(prev => ({ ...prev, region: "", area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, destRegion: false })); }
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
                setSkeletons(prev => ({ ...prev, destArea: true }));
                const res = await subRegionList({ region_id: dest.region, dropdown: "true" });
                setDestOptions(prev => ({
                    ...prev,
                    areas: (res?.data || []).map((a: any) => ({ value: String(a.id), label: a.area_name || a.name })),
                    warehouses: [], routes: []
                }));
                setDest(prev => ({ ...prev, area: "", warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, destArea: false })); }
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
                setSkeletons(prev => ({ ...prev, destWarehouse: true }));
                const res = await warehouseList({ area_id: dest.area, dropdown: "true" });
                setDestOptions(prev => ({
                    ...prev,
                    warehouses: (res?.data || []).map((w: any) => ({ value: String(w.id), label: w.warehouse_name || w.name })),
                    routes: []
                }));
                setDest(prev => ({ ...prev, warehouse: "", route: "" }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, destWarehouse: false })); }
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
                setSkeletons(prev => ({ ...prev, destRoute: true }));
                const res = await routeList({ warehouse_id: dest.warehouse, dropdown: "true" });
                setDestOptions(prev => ({
                    ...prev,
                    routes: (res?.data || []).map((r: any) => ({ value: String(r.id), label: r.route_name || r.name }))
                }));
            } catch (err) { console.error(err); }
            finally { setSkeletons(prev => ({ ...prev, destRoute: false })); }
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
        if (!source.warehouse || !dest.warehouse) {
            showSnackbar("Please select both origin and destination warehouses", "warning");
            return;
        }

    // const payload = {
    //         old_route_id: Number(source.route),
    //         new_route_id: Number(dest.route),
    //     };
    const payload = {
    from_warehouse_id:source.warehouse,
    to_warehouse_id:dest.warehouse,
  };



       

        try {
            setLoading(true);
            const res = await assetsTransfer(payload);
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
                setSource({ company: "", region: "", area: "", warehouse: "", route: "", from_warehouse_id: "",
                 });
                setDest({ company: "", region: "", area: "", warehouse: "", route: "", to_warehouse_id: "",});
                if (isHistoryOpen) fetchHistory(); // Refresh history if open
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-[20px] font-semibold text-[#181D27] uppercase">
                    Assets Transfer
                </h1>
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    title="View Transfer History"
                >
                    <Icon icon="lucide:clock" width="24" height="24" />
                </button>
            </div>

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
                        showSkeleton={skeletons.sourceCompany}
                    />
                    <InputFields
                        label="Region"
                        value={source.region}
                        options={sourceOptions.regions}
                        onChange={(e) => setSource({ ...source, region: e.target.value })}
                        disabled={!source.company}
                        searchable
                        placeholder="Select Region"
                        showSkeleton={skeletons.sourceRegion}
                    />
                    <InputFields
                        label="Area"
                        value={source.area}
                        options={sourceOptions.areas}
                        onChange={(e) => setSource({ ...source, area: e.target.value })}
                        disabled={!source.region}
                        searchable
                        placeholder="Select Area"
                        showSkeleton={skeletons.sourceArea}
                    />
                    <InputFields
                        label="Distributor"
                        value={source.warehouse}
                        options={sourceOptions.warehouses}
                        onChange={(e) => setSource({ ...source, warehouse: e.target.value })}
                        disabled={!source.area}
                        searchable
                        placeholder="Select Distributor"
                        showSkeleton={skeletons.sourceWarehouse}
                    />
                    {/* <InputFields
                        label="Route (Origin)"
                        value={source.route}
                        options={sourceOptions.routes}
                        onChange={(e) => setSource({ ...source, route: e.target.value })}
                        disabled={!source.warehouse}
                        searchable
                        placeholder="Select Origin Route"
                        showSkeleton={skeletons.sourceRoute}
                    /> */}
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
                        showSkeleton={skeletons.destCompany}
                    />
                    <InputFields
                        label="Region"
                        value={dest.region}
                        options={destOptions.regions}
                        onChange={(e) => setDest({ ...dest, region: e.target.value })}
                        disabled={!dest.company}
                        searchable
                        placeholder="Select Region"
                        showSkeleton={skeletons.destRegion}
                    />
                    <InputFields
                        label="Area"
                        value={dest.area}
                        options={destOptions.areas}
                        onChange={(e) => setDest({ ...dest, area: e.target.value })}
                        disabled={!dest.region}
                        searchable
                        placeholder="Select Area"
                        showSkeleton={skeletons.destArea}
                    />
                    <InputFields
                        label="Distributor"
                        value={dest.warehouse}
                        options={destOptions.warehouses}
                        onChange={(e) => setDest({ ...dest, warehouse: e.target.value })}
                        disabled={!dest.area}
                        searchable
                        placeholder="Select Distributor"
                        showSkeleton={skeletons.destWarehouse}
                    />
                    {/* <InputFields
                        label="Route (Destination)"
                        value={dest.route}
                        options={filteredDestRoutes}
                        onChange={(e) => setDest({ ...dest, route: e.target.value })}
                        disabled={!dest.warehouse}
                        searchable
                        placeholder="Select Destination Route"
                        showSkeleton={skeletons.destRoute}
                    /> */}
                </div>
            </div>


            {/* ACTION */}
            {/* {can("create") && ( */}
                <div className="flex justify-end mt-6 gap-4">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Submit Transfer
                    </button>
                </div>

            {/* )} */}

            {/* HISTORY POPUP */}
            <Popup isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)}>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-800">Transfer History</h3>
                    <button onClick={() => setIsHistoryOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <Icon icon="lucide:x" width="20" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[400px]">
                    {historyLoading ? (
                        <div className="text-center py-4 text-gray-500">Loading history...</div>
                    ) : historyData.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No transfer history found.</div>
                    ) : (
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Route From</th>
                                    <th className="px-4 py-2">Route To</th>
                                    {/* <th className="px-4 py-2">Warehouse From</th>
                                    <th className="px-4 py-2">Warehouse To</th> */}

                                    {/* <th className="px-4 py-2">Status</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((item: any, idx: number) => (
                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">
                                            {item.transferred_at ? new Date(item.transferred_at).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-gray-900">
                                            {item.old_route?.name || item.old_route_id || "-"}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-gray-900">
                                            {item.new_route?.name || item.new_route_id || "-"}
                                        </td>
                                        {/* <td className="px-4 py-2 font-medium text-gray-900">
                                            {item.warehouse.old_warehouses?.name || item.warehouse.old_warehouses.id || "-"}
                                        </td>
                                        <td className="px-4 py-2 font-medium text-gray-900">
                                            {item.warehouse.new_warehouse?.name || item.warehouse?.new_warehouse?.id || "-"}

                                        </td> */}
                                        {/* <td className="px-4 py-2">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Popup>
        </ContainerCard>
    );
}
