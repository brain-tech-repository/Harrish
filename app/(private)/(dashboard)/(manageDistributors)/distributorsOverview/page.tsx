"use client";
import ContainerCard from "@/app/components/containerCard";
import InputFields from "@/app/components/inputFields";
import TabBtn from "@/app/components/tabBtn";
import Container from "@mui/material/Container";
import React, { useEffect, useState } from "react";
// import {warehouseOptions} from "@/app/data/warehouseOptions";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";
import Table from "@/app/components/customTable";
import { TableDataType } from "@/app/components/customTable";
import OrderStatus from "@/app/components/orderStatus";
import { Icon } from "@iconify-icon/react";
import { warehouseLowStocksKpi, warehouseStocksKpi, warehouseStockTopOrders,warhouseStocksByFilter } from "@/app/services/allApi";
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
  // { key: "address", label: "Location Info" },
  // { key: "financial", label: "Financial Info" },
  // { key: "guarantee", label: "Guarantee Info" },
  // { key: "additional", label: "Additional Info" },
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
  async function callAllKpisData(id: string) {
    try {
      setLoading(true)

      const res = await warehouseStocksKpi(id)
      const lowCostRes = await warehouseLowStocksKpi(id)
      const topOrderRes = await warehouseStockTopOrders(id)
      //  const top5Orders = await warehouseStockTopOrders(id)


      setStockData(res)
      setStockLowQty(lowCostRes)
      setTopOrders(topOrderRes)
      setLoading(false)


    }
    catch (err) {

    }

  }
  return (
    <>

      {/* <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabList.map((tab, index) => (
          <div key={index}>
            <TabBtn
              label={tab.label}
              isActive={activeTab === tab.key}
              onClick={() => onTabClick(index)}
            />
          </div>
        ))}
      </ContainerCard> */}
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
              setSelectedWarehouse(e.target.value)

              callAllKpisData(e.target.value)
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
              !loading ? <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2" >
                <div style={{ background: card.color }} className="p-2 rounded-lg"> <Icon icon={card.icon} width="48" height="48" /> </div>

                <div
                  key={index}
                  className="relative flex flex-col w-[100%]"
                >

                  <div className="p-4">

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-600 font-medium">{card.title}</p>

                      {/* Arrow + Percentage */}


                    </div>


                    {/* Value */}
                    <p className="mt-1 text-blue-gray-900 font-bold text-2xl">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div> : <div key={index} className="flex items-center rounded-lg bg-white text-gray-700 shadow-md border border-gray-200 p-2 gap-[5px]" ><Skeleton width={20} /><Skeleton width={20} /><Skeleton width={20} /><Skeleton width={20} /></div>
            )

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
                },
                columns: itemColumns,
                pageSize: 1000000,
              }}
              directFilterRenderer={
                selectedWarehouse ? (
                  <InputFields
                    name="filter"
                    placeholder="Select Filter"
                    value={selectedFilter}
                    options={[
                      { value: "yesterday", label: "Yesterday" },
                      { value: "today", label: "Today" },
                      { value: "last_3_days", label: "Last 3 Days" },
                      { value: "last_7_days", label: "Last 7 Days" },
                      { value: "last_month", label: "Last Month" },
                    ]}
                    onChange={async (e) => {
                      const filterValue = e.target.value;
                      setSelectedFilter(filterValue);
                      if (filterValue && selectedWarehouse) {
                        try {
                          setLoading(true);
                          const res = await warhouseStocksByFilter({
                            warehouse_id: selectedWarehouse,
                            filter: filterValue,
                          });
                          if (res?.data) {
                            // Transform API response to match table columns
                            const transformedData = res.data.map((item: any) => ({
                              item_code: item.item?.erp_code ?? "",
                              item_name: item.item?.name ?? "",
                              stock_qty: item.stock_qty ?? "-",
                              total_sold_qty: item?.total_sold_qty,
                              purchase: item?.purchase,
                            }));
                            setTopOrders({ stocks: transformedData });
                          }
                        } catch (err) {
                          console.error("Filter API error", err);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                  />
                ) : undefined
              }
            />}
        </div>

      </ContainerCard>
    </>
  );
};

export default OverallPerformance;
