"use client";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import React, { useEffect, useState } from "react";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import { Icon } from "@iconify-icon/react";
import {  warehouseStocksKpi, warehouseStockTopOrders,warhouseStocksByFilter } from "@/app/services/allApi";
import { CustomTableSkelton } from "@/app/components/customSkeleton";
import Skeleton from "@mui/material/Skeleton";
import toInternationalNumber from "@/app/(private)/utils/formatNumber";
import { usePagePermissions } from "@/app/(private)/utils/usePagePermissions";
import FilterComponent from "@/app/components/filterComponent";
type CardItem = {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  percentage: number;
  isUp: boolean;
};
const tabList = [
  { key: "overview", label: "Overview" },
  { key: "detailedView", label: "Detailed View" },
];
const itemColumns = [
  {
    key: "item_code",
    label: "Item",
    showByDefault: true,
    render: (row: any) => {
      const code = row.item_code ?? "";
      const name = row.item_name ?? "";
      if (!code && !name) return "-";
      return `${code}${code && name ? " - " : ""}${name}`;
    },
  },
  {
    key: "stock_qty",
    label: "Stock Qty",
    showByDefault: true,
    render: (row: any) => row.stock_qty ?? "-",
    isSortable: true,
  },
  {
    key: "total_sold_qty",
    label: "Sold Qty",
    showByDefault: true,
    render: (row: any) => row.total_sold_qty ?? "-",
     isSortable: true,
  },
  {
    key: "purchase",
    label: "Purchase Qty",
    showByDefault: true,
    render: (row: any) => row.purchase ?? "-",
     isSortable: true,
  },
];


const OverallPerformance: React.FC = () => {
  const { can, permissions } = usePagePermissions();
  const [openMenu, setOpenMenu] = useState(false);
  const [selected, setSelected] = useState("Last 24h");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState<boolean>(false);
  const [lowStock,setLowStock]=useState<any>(null);
  const [stockData, setStockData] = useState<any>({
    "total_warehouse_valuation": "0.00",
    "today_loaded_qty": "0.00",
    "sales_total_valuation": "0.00",
  });
  const [stockLowQty, setStockLowQty] = useState({
    "count": 0.00,
    "items": []
  })
  const [topOrders, setTopOrders] = useState({
    "stocks": []
  })

  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("")
  const { warehouseOptions,ensureWarehouseLoaded } = useAllDropdownListData();

  const options = ["Last 12h", "Last 24h", "Last 20h"];

  const onTabClick = (idx: number) => {
    // ensure index is within range and set the corresponding tab key
    if (typeof idx !== "number") return;
    if (typeof tabList === "undefined" || idx < 0 || idx >= tabList.length) return;
    setActiveTab(tabList[idx].key);
  };

  // ⭐ Array of card objects
  const cards: CardItem[] = [
    {
      title: "Total Valuation",
      value: stockData?.total_warehouse_valuation?.total_valuation ? toInternationalNumber(stockData?.total_warehouse_valuation?.total_valuation) : 0.00,
      percentage: -12,
      icon: "carbon:currency",
      color: "#fceaef",
      isUp: false,
    },
    {
      title: "Distributor Stock",
      value: stockData?.total_warehouse_valuation?.total_qty ? toInternationalNumber(stockData?.total_warehouse_valuation?.total_qty, { maximumFractionDigits: 0 }) : 0.00,
      percentage: -10,
      icon: "maki:warehouse",
      color: "#fff0f2",
      isUp: false,
    }, {
      title: "Low Stock",
      value: stockLowQty.count,
      percentage: +16,
      icon: "fluent-emoji-high-contrast:money-bag",
      color: "#e0edeb",
      isUp: true,
    },
    {
      title: "Awaiting Delivery",
      value: stockData?.today_loaded_qty,
      percentage: +10,
      icon: "tabler:truck-loading",
      color: "#d8e6ff",
      isUp: true,
    },
  ];
  useEffect(()=>{
    ensureWarehouseLoaded();
  },[ensureWarehouseLoaded])
  async function callAllKpisData(id: string, filter?: string) {
    try {
      setLoading(true);

      const res = await warehouseStocksKpi(id);
      let topOrderRes;
      if (filter) {
        topOrderRes = await warehouseStockTopOrders(id, { date_filter: filter });
      } else {
        topOrderRes = await warehouseStockTopOrders(id);
      }

      setStockData(res);
      
      // Extract low_count from the response and ensure it's a number
      let lowCount = 0;
      if (topOrderRes && typeof topOrderRes.low_count !== 'undefined') {
        if (typeof topOrderRes.low_count === 'number') {
          lowCount = topOrderRes.low_count;
        } else if (!isNaN(Number(topOrderRes.low_count))) {
          lowCount = Number(topOrderRes.low_count);
        }
      }
      setStockLowQty({
        count: lowCount,
        items: []
      });
      // Normalize top orders response into { stocks: [] } so the Table `data` prop receives a consistent shape
      const stocksRaw = Array.isArray(topOrderRes?.stocks)
        ? topOrderRes.stocks
        : Array.isArray(topOrderRes?.data?.items)
        ? topOrderRes.data.items
        : Array.isArray(topOrderRes?.data)
        ? topOrderRes.data
        : [];

      // Map API fields to the table's expected keys:
      // - `available_stock_qty` -> `stock_qty`
      // - `total_sales` -> `total_sold_qty`
      // - `purchase_qty` -> `purchase`
      const stocksFromTopOrders = stocksRaw.map((it: any) => ({
        id: it.item_id ?? it.id ?? undefined,
        item_code: it.item_code ?? it.item?.item_code ?? it.erp_code ?? "",
        item_name: it.item_name ?? it.item?.name ?? it.item?.item_name ?? "",
        stock_qty:
          typeof it.available_stock_qty === "number"
            ? it.available_stock_qty
            : it.available_stock_qty
            ? Number(it.available_stock_qty)
            : 0,
        total_sold_qty:
          typeof it.total_sales === "number"
            ? it.total_sales
            : it.total_sales
            ? Number(it.total_sales)
            : 0,
        purchase:
          typeof it.purchase_qty === "number"
            ? it.purchase_qty
            : it.purchase_qty
            ? Number(it.purchase_qty)
            : 0,
        uoms: it.uoms ?? it.item?.uoms ?? [],
        health_flag: typeof it.health_flag === "number" ? it.health_flag : it.health_flag ? Number(it.health_flag) : 1,
        _raw: it,
      }));

      setTopOrders({ stocks: stocksFromTopOrders });
      setLoading(false);
    } catch (err) {
      // Optionally handle error
    }
  }
  return (
    <>

      <ContainerCard className="flex flex-col h-full w-full">

        <div className="flex justify-between md:items-center">
          <div>
            <p className="text-base font-bold">Distributors Overview</p>
          </div>

          {/* Dropdown */}
          {/* <div className=""> */}

          <InputFields
            searchable={true}
            //   required
            // label="Distributers"
            placeholder="Select Distributers"
            name="Distributers"
            value={selectedWarehouse}
            options={warehouseOptions}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              // Pass selectedFilter if present
              callAllKpisData(e.target.value, selectedFilter);
              // const newWarehouse = e.target.value;
              // handleChange("warehouse", newWarehouse);
              // handleChange("vehicleType", ""); // clear vehicle when warehouse changes
              // fetchRoutes(newWarehouse);
            }}
          />

        </div>

        {/* CARDS (dynamic from array) */}
        <div className="mt-6 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center md:gap-2.5 gap-4">

          {cards.map((card, index) => {
            return (
              !loading ? (
                <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2 min-w-0" >
                  <div style={{ background: card.color }} className="p-2 rounded-lg min-w-[56px] flex-shrink-0"> <Icon icon={card.icon} width="48" height="48" /> </div>
                  <div key={index} className="relative flex flex-col w-full min-w-0">
                    <div className="p-4 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-600 font-medium">{card.title}</p>
                        {/* Arrow + Percentage */}
                      </div>
                      {/* Value */}
                      <p className="mt-1 text-blue-gray-900 font-bold text-2xl break-words truncate max-w-full" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2 gap-[5px]" >
                  <Skeleton width={20} /><Skeleton width={20} /><Skeleton width={20} /><Skeleton width={20} />
                </div>
              )
            );
          })}

        </div>
        <br />
        <div className="flex flex-col h-full">
         
          {loading ? <CustomTableSkelton /> :
            <Table
              data={topOrders?.stocks ? topOrders?.stocks : []}
              config={{
                header: {
                  searchBar: false,
                  columnFilter: false,
                   filterRenderer: (props) => (
                                    <FilterComponent
                                        {...props}
                                        onlyFilters={['from_date', 'to_date','day_filter']}
                                        api={async (payload: any) => {
                                          if (!selectedWarehouse) return;
                                          try {
                                            setLoading(true);
                                            let topOrderRes;
                                            
                                            if (payload.day_filter) {
                                              topOrderRes = await warhouseStocksByFilter({
                                                warehouse_id: selectedWarehouse,
                                                date_filter: payload.day_filter
                                              });
                                            } else if (payload.from_date || payload.to_date) {
                                              const params: any = {};
                                              if (payload.from_date) {
                                                params.from_date = payload.from_date;
                                              }
                                              if (payload.to_date) {
                                                params.to_date = payload.to_date;
                                              }
                                              topOrderRes = await warehouseStockTopOrders(selectedWarehouse, params);
                                            } else {
                                              // No filter selected, use default
                                              topOrderRes = await warehouseStockTopOrders(selectedWarehouse);
                                            }
                                            
                                            // Extract low_count from the response and ensure it's a number
                                            let lowCount = 0;
                                            if (topOrderRes && typeof topOrderRes.data.low_count !== 'undefined') {
                                              if (typeof topOrderRes.data.low_count === 'number') {
                                                lowCount = topOrderRes.data.low_count;
                                              } else if (!isNaN(Number(topOrderRes.data.low_count))) {
                                                lowCount = Number(topOrderRes.data.low_count);
                                              }
                                            }
                                            setStockLowQty({
                                              count: lowCount,
                                              items: []
                                            });
                                            
                                            // Normalize response
                                            const stocksRaw = Array.isArray(topOrderRes?.stocks)
                                              ? topOrderRes.stocks
                                              : Array.isArray(topOrderRes?.data?.items)
                                              ? topOrderRes.data.items
                                              : Array.isArray(topOrderRes?.data)
                                              ? topOrderRes.data
                                              : topOrderRes?.items
                                              ? topOrderRes.items
                                              : [];

                                            // Transform data
                                            const stocksFromTopOrders = stocksRaw.map((it: any) => ({
                                              id: it.item_id ?? it.id ?? undefined,
                                              item_code: it.item_code ?? it.item?.item_code ?? it.erp_code ?? "",
                                              item_name: it.item_name ?? it.item?.name ?? it.item?.item_name ?? "",
                                              stock_qty:
                                                typeof it.available_stock_qty === "number"
                                                  ? it.available_stock_qty
                                                  : it.available_stock_qty
                                                  ? Number(it.available_stock_qty)
                                                  : 0,
                                              total_sold_qty:
                                                typeof it.total_sales === "number"
                                                  ? it.total_sales
                                                  : it.total_sales
                                                  ? Number(it.total_sales)
                                                  : 0,
                                              purchase:
                                                typeof it.purchase_qty === "number"
                                                  ? it.purchase_qty
                                                  : it.purchase_qty
                                                  ? Number(it.purchase_qty)
                                                  : 0,
                                              uoms: it.uoms ?? it.item?.uoms ?? [],
                                              health_flag: typeof it.health_flag === "number" ? it.health_flag : it.health_flag ? Number(it.health_flag) : 1,
                                              _raw: it,
                                            }));

                                            setTopOrders({ stocks: stocksFromTopOrders });
                                          } catch (err) {
                                            console.error("Filter API error", err);
                                          } finally {
                                            setLoading(false);
                                          }
                                        }}
                                    />
                                ),
                },
                columns: itemColumns,
                pageSize: 1000000,
                rowColor: (row: any) => {
                  const healthFlag = row.health_flag ?? 1;
                  if (healthFlag === 2) return "#FEF9C3"; // yellow-100
                  if (healthFlag === 3) return "#FECACA"; // red-200
                  return undefined; // default (white)
                },
              }}
              // directFilterRenderer={
              //   selectedWarehouse ? (
              //     <InputFields
              //       name="filter"
              //       placeholder="Select Filter"
              //       value={selectedFilter}
              //       options={[
              //         { value: "yesterday", label: "Yesterday" },
              //         { value: "today", label: "Today" },
              //         { value: "last_3_days", label: "Last 3 Days" },
              //         { value: "last_7_days", label: "Last 7 Days" },
              //         { value: "last_month", label: "Last Month" },
              //       ]}
              //       onChange={async (e) => {
              //         const filterValue = e.target.value;
              //         setSelectedFilter(filterValue);
              //         if (filterValue && selectedWarehouse) {
              //           try {
              //             setLoading(true);
              //             const res = await warhouseStocksByFilter({
              //               warehouse_id: selectedWarehouse,
              //               date_filter: filterValue,
              //             });
              //             // Support APIs that return the list either in `stocks` or `data`.
              //             const apiStocks = Array.isArray(res?.stocks)
              //               ? res!.stocks
              //               : Array.isArray(res?.data)
              //               ? res!.data
              //               : [];

              //             // Transform API response to match table columns (support top-level and nested `item`)
              //             const transformedData = apiStocks.map((it: any) => ({
              //               id: it.id ?? it.item_id ?? undefined,
              //               item_code:
              //                 it.item_code ?? it.erp_code ?? it.item?.erp_code ?? "",
              //               item_name: it.item_name ?? it.item?.name ?? "",
              //               stock_qty:
              //                 typeof it.stock_qty === "number"
              //                   ? it.stock_qty
              //                   : it.stock_qty
              //                   ? Number(it.stock_qty)
              //                   : 0,
              //               total_sold_qty: it.total_sold_qty ?? 0,
              //               purchase: it.purchase ?? 0,
              //               uoms: it.uoms ?? it.item?.uoms ?? [],
              //               health_flag: it.health_flag ?? 1,
              //               _raw: it,
              //             }));

              //             // Ensure table is cleared when API returns no items
              //             setTopOrders({ stocks: transformedData });
              //           } catch (err) {
              //             console.error("Filter API error", err);
              //           } finally {
              //             setLoading(false);
              //           }
              //         }
              //       }}
              //     />
              //   ) : undefined
              // }
            />}
        </div>

      </ContainerCard>
    </>
  );
};

export default OverallPerformance;
