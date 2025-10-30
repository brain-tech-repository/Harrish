"use client";

import KeyValueData from "@/app/(private)/(dashboard)/(master)/customer/[customerId]/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBtn from "@/app/components/statusBtn2";
import TabBtn from "@/app/components/tabBtn";
import Map from "@/app/components/map";
import Table, { TableDataType } from "@/app/components/customTable";

interface Item {
  id: string;
  warehouse_code: string;
  warehouse_name: string;
  owner_name: string;
  owner_number: string;
  owner_email: string;
  warehouse_manager: string;
  warehouse_manager_contact: string;
  warehouse_type: string;
  city: string;
  location: string;
  region: { region_code: string; region_name: string };
  area: { area_code: string; area_name: string };
  get_company: { company_code: string; company_name: string };
  tin_no: string;
  registation_no: string;
  town_village: string;
  street: string;
  landmark: string;
  is_efris: string;
  is_branch: string;
  latitude: string;
  longitude: string;
  status: number | string;
}

const title = "Warehouse Details";
const backBtnUrl = "/warehouse";

// Dummy table data per tab
const warehouseCustomerColumns = [
  { key: "customer_code", label: "Customer Code", showByDefault: true, render: (row: any) => row.customer_code || "-" },
  { key: "customer_name", label: "Customer Name", showByDefault: true, render: (row: any) => row.customer_name || "-" },
  { key: "contact", label: "Contact", showByDefault: true, render: (row: any) => row.contact || "-" },
];
const dummyWarehouseCustomers = [
  { id: "C001", customer_code: "CUS001", customer_name: "ABC Traders", contact: "+91 9988776655" },
  { id: "C002", customer_code: "CUS002", customer_name: "XYZ Retail", contact: "+91 9123456789" },
];

const warehouseStockColumns = [
  { key: "item_code", label: "Item Code", showByDefault: true, render: (row: any) => row.item_code || "-" },
  { key: "item_name", label: "Item Name", showByDefault: true, render: (row: any) => row.item_name || "-" },
  { key: "quantity", label: "Quantity", showByDefault: true, render: (row: any) => row.quantity || "-" },
];
const dummyWarehouseStock = [
  { id: "S001", item_code: "ITEM001", item_name: "Product A", quantity: "120" },
  { id: "S002", item_code: "ITEM002", item_name: "Product B", quantity: "60" },
];

const routeVehicleColumns = [
  { key: "route_code", label: "Route Code", showByDefault: true, render: (row: any) => row.route_code || "-" },
  { key: "vehicle_number", label: "Vehicle Number", showByDefault: true, render: (row: any) => row.vehicle_number || "-" },
  { key: "driver_name", label: "Driver Name", showByDefault: true, render: (row: any) => row.driver_name || "-" },
];
const dummyRoutesVehicles = [
  { id: "RV001", route_code: "RT001", vehicle_number: "MH12AB1234", driver_name: "Suresh Kumar" },
  { id: "RV002", route_code: "RT002", vehicle_number: "DL01XY9876", driver_name: "Mahesh Singh" },
];

const salesmanColumns = [
  { key: "salesman_code", label: "Salesman Code", showByDefault: true, render: (row: any) => row.salesman_code || "-" },
  { key: "salesman_name", label: "Salesman Name", showByDefault: true, render: (row: any) => row.salesman_name || "-" },
  { key: "contact_number", label: "Contact Number", showByDefault: true, render: (row: any) => row.contact_number || "-" },
];
const dummySalesmen = [
  { id: "SM001", salesman_code: "SM001", salesman_name: "Rahul Sharma", contact_number: "+91 9988776655" },
  { id: "SM002", salesman_code: "SM002", salesman_name: "Amit Verma", contact_number: "+91 9876543210" },
];

const salesColumns = [
  { key: "invoice_no", label: "Invoice No", showByDefault: true, render: (row: any) => row.invoice_no || "-" },
  { key: "customer_name", label: "Customer", showByDefault: true, render: (row: any) => row.customer_name || "-" },
  { key: "total_amount", label: "Total Amount", showByDefault: true, render: (row: any) => `₹${row.total_amount}` },
];
const dummySales = [
  { id: "SA001", invoice_no: "INV001", customer_name: "ABC Traders", total_amount: "15000" },
  { id: "SA002", invoice_no: "INV002", customer_name: "XYZ Retail", total_amount: "23000" },
];

const returnColumns = [
  { key: "return_no", label: "Return No", showByDefault: true, render: (row: any) => row.return_no || "-" },
  { key: "customer_name", label: "Customer", showByDefault: true, render: (row: any) => row.customer_name || "-" },
  { key: "reason", label: "Reason", showByDefault: true, render: (row: any) => row.reason || "-" },
];
const dummyReturns = [
  { id: "R001", return_no: "RET001", customer_name: "ABC Traders", reason: "Damaged item" },
  { id: "R002", return_no: "RET002", customer_name: "XYZ Retail", reason: "Wrong delivery" },
];

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();
  const [item, setItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const tabList = [
    { key: "overview", label: "Overview" },
    { key: "warehouseCustomer", label: "Warehouse Customer" },
    { key: "warehouseStock", label: "Warehouse Stock" },
    { key: "routeVehicle", label: "Route & Vehicle" },
    { key: "salesman", label: "Salesman" },
    { key: "sales", label: "Sales" },
    { key: "return", label: "Return" },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItem({
        id: "1",
        warehouse_code: "WH001",
        warehouse_name: "Central Warehouse",
        owner_name: "John Doe",
        owner_number: "+91 9876543210",
        owner_email: "john@example.com",
        warehouse_manager: "Alice Smith",
        warehouse_manager_contact: "+91 9123456789",
        warehouse_type: "Hariss",
        city: "New Delhi",
        location: "Delhi NCR",
        region: { region_code: "R001", region_name: "North" },
        area: { area_code: "A001", area_name: "Delhi" },
        get_company: { company_code: "CMP001", company_name: "TechCorp Pvt Ltd" },
        tin_no: "TIN001",
        registation_no: "REG123",
        town_village: "Rohini",
        street: "Sector 9",
        landmark: "Metro Station",
        is_efris: "1",
        is_branch: "0",
        latitude: "28.6139",
        longitude: "77.2090",
        status: 1,
      });
      setLoading(false);
    }, 500);
  }, []);

  const onTabClick = (key: string) => setActiveTab(key);

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Link href={backBtnUrl}>
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold mb-1">{title}</h1>
      </div>

      <ContainerCard className="w-full flex flex-col sm:flex-row items-center justify-between gap-[10px] md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-[20px]">
          <div className="w-[80px] h-[80px] flex justify-center items-center rounded-full bg-[#E9EAEB]">
            <Icon icon="tabler:building-warehouse" width={40} className="text-[#535862] scale-[1.5]" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[#181D27] mb-[10px]">
              {item?.warehouse_code || "-"} - {item?.warehouse_name}
            </h2>
          </div>
        </div>
        <StatusBtn isActive={item?.status === 1 || item?.status === "1"} />
      </ContainerCard>

      {/* Tabs */}
      <ContainerCard className="w-full flex gap-[4px] overflow-x-auto" padding="5px">
        {tabList.map((tab) => (
          <TabBtn key={tab.key} label={tab.label} isActive={activeTab === tab.key} onClick={() => onTabClick(tab.key)} />
        ))}
      </ContainerCard>

      {/* Overview */}
      {activeTab === "overview" && item && (
        <div className="flex flex-wrap gap-6 mt-4">
          <ContainerCard className="flex-1 min-w-[300px]">
            <KeyValueData
              title="Warehouse Info"
              data={[
                { key: "Warehouse Type", value: item.warehouse_type || "-" },
                { key: "TIN No", value: item.registation_no || "-" },
                { key: "Owner Name", value: item.owner_name || "-" },
                { key: "Company Code", value: item.get_company?.company_code || "-" },
                { key: "Company Name", value: item.get_company?.company_name || "-" },
                { key: "Warehouse Manager", value: item.warehouse_manager || "-" },
              ]}
            />
          </ContainerCard>

          <ContainerCard className="flex-1 min-w-[300px]">
            <KeyValueData
              title="Location Information"
              data={[
                { key: "Region Name", value: item.region?.region_name || "-" },
                { key: "Area Name", value: item.area?.area_name || "-" },
                { key: "City", value: item.city || "-" },
                { key: "Location", value: item.location || "-" },
                { key: "Town/Village", value: item.town_village || "-" },
                { key: "Street", value: item.street || "-" },
                { key: "Landmark", value: item.landmark || "-" },
              ]}
            />
            {item.latitude && item.longitude && (
              <Map latitude={item.latitude} longitude={item.longitude} title="Warehouse Location" />
            )}
          </ContainerCard>

          <ContainerCard className="flex-1 min-w-[300px]">
            <KeyValueData
              title="Additional Information"
              data={[
                { key: "Is EFRIS", value: item.is_efris === "1" ? "Enabled" : "Disabled" },
                { key: "Is Branch", value: item.is_branch === "1" ? "Yes" : "No" },
              ]}
            />
          </ContainerCard>
        </div>
      )}

      {/* Warehouse Customer Tab */}
      {activeTab === "warehouseCustomer" && (
        <ContainerCard>
          <Table
            config={{
              api: { list: async () => ({ data: dummyWarehouseCustomers, total: 2, currentPage: 1, pageSize: 50 }) },
              header: { title: "Warehouse Customers", columnFilter: true },
              columns: warehouseCustomerColumns,
              localStorageKey: "warehouse-customer-table",
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
        </ContainerCard>
      )}

      {/* Warehouse Stock */}
      {activeTab === "warehouseStock" && (
        <ContainerCard>
          <Table
            config={{
              api: { list: async () => ({ data: dummyWarehouseStock, total: 2, currentPage: 1, pageSize: 50 }) },
              header: { title: "Warehouse Stock", columnFilter: true },
              columns: warehouseStockColumns,
              localStorageKey: "warehouse-stock-table",
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
        </ContainerCard>
      )}

      {/* Route & Vehicle */}
      {/* Route & Vehicle */}
{activeTab === "routeVehicle" && (
  <div className="flex flex-col gap-6">
    {/* Route Table */}
    <ContainerCard>
      <Table
        config={{
          api: {
            list: async () => ({
              data: [
                { id: "R001", route_code: "RT001", source: "Delhi", destination: "Mumbai", distance: "1450 km" },
                { id: "R002", route_code: "RT002", source: "Bangalore", destination: "Chennai", distance: "350 km" },
              ],
              total: 2,
              currentPage: 1,
              pageSize: 50,
            }),
          },
          header: { title: "Route Details", columnFilter: true },
          columns: [
            { key: "route_code", label: "Route Code", showByDefault: true, render: (row: any) => row.route_code || "-" },
            { key: "source", label: "Source", showByDefault: true, render: (row: any) => row.source || "-" },
            { key: "destination", label: "Destination", showByDefault: true, render: (row: any) => row.destination || "-" },
            { key: "distance", label: "Distance", showByDefault: true, render: (row: any) => row.distance || "-" },
          ],
          localStorageKey: "warehouse-route-table",
          footer: { nextPrevBtn: false, pagination: false },
        }}
      />
    </ContainerCard>

    {/* Vehicle Table */}
    <ContainerCard>
      <Table
        config={{
          api: {
            list: async () => ({
              data: [
                { id: "V001", vehicle_number: "MH12AB1234", vehicle_type: "Truck", driver_name: "Ravi Kumar" },
                { id: "V002", vehicle_number: "DL01XY5678", vehicle_type: "Mini Van", driver_name: "Amit Singh" },
              ],
              total: 2,
              currentPage: 1,
              pageSize: 50,
            }),
          },
          header: { title: "Vehicle Details", columnFilter: true },
          columns: [
            { key: "vehicle_number", label: "Vehicle Number", showByDefault: true, render: (row: any) => row.vehicle_number || "-" },
            { key: "vehicle_type", label: "Vehicle Type", showByDefault: true, render: (row: any) => row.vehicle_type || "-" },
            { key: "driver_name", label: "Driver Name", showByDefault: true, render: (row: any) => row.driver_name || "-" },
          ],
          localStorageKey: "warehouse-vehicle-table",
          footer: { nextPrevBtn: false, pagination: false },
        }}
      />
    </ContainerCard>
  </div>
)}


      {/* Salesman */}
      {activeTab === "salesman" && (
        <ContainerCard>
          <Table
            config={{
              api: { list: async () => ({ data: dummySalesmen, total: 2, currentPage: 1, pageSize: 50 }) },
              header: { title: "Salesmen", columnFilter: true },
              columns: salesmanColumns,
              localStorageKey: "salesman-table",
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
        </ContainerCard>
      )}

      {/* Sales */}
      {activeTab === "sales" && (
        <ContainerCard>
          <Table
            config={{
              api: { list: async () => ({ data: dummySales, total: 2, currentPage: 1, pageSize: 50 }) },
              header: { title: "Sales", columnFilter: true },
              columns: salesColumns,
              localStorageKey: "sales-table",
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
        </ContainerCard>
      )}

      {/* Return */}
      {activeTab === "return" && (
        <ContainerCard>
          <Table
            config={{
              api: { list: async () => ({ data: dummyReturns, total: 2, currentPage: 1, pageSize: 50 }) },
              header: { title: "Return Records", columnFilter: true },
              columns: returnColumns,
              localStorageKey: "return-table",
              footer: { nextPrevBtn: false, pagination: false },
            }}
          />
        </ContainerCard>
      )}
    </>
  );
}
