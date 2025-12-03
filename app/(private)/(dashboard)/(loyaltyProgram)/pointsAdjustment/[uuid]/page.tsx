"use client";
import AutoSuggestion, { Option } from "@/app/components/autoSuggestion";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import Loading from "@/app/components/Loading";
import {createBonus,getTierDetails,updateTier} from "@/app/services/settingsAPI";
import {createAdjustment,getCustomerClosingPoints} from "@/app/services/loyaltyProgramApis";
import { itemGlobalSearch, warehouseListGlobalSearch, routeList, getRouteInWarehouse, getAgentCusByRoute, agentCustomerGlobalSearch } from "@/app/services/allApi";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as yup from "yup";

export default function AddEditTier() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const routeId = params?.uuid as string | undefined;
  const isEditMode = routeId !== undefined && routeId !== "add";
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    warehouse: "",
    route: "",
    customer: "",
    current_points: "",
    adjustment_type: "",
    adjustment_points: "",
    description: "",
  });

  const [selectedWarehouseOption, setSelectedWarehouseOption] = useState<Option | null>(null);
  const [selectedRouteOption, setSelectedRouteOption] = useState<Option | null>(null);
  const [selectedCustomerOption, setSelectedCustomerOption] = useState<Option | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  type Dict = Record<string, unknown>;

  const getFirstValue = (obj: Dict | undefined, keys: string[]) => {
    if (!obj) return "";
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== "") return String(v);
    }
    return "";
  };

  const makeLabel = (obj: Dict | undefined, codeKeys: string[], nameKeys: string[]) => {
    const code = getFirstValue(obj, codeKeys);
    const name = getFirstValue(obj, nameKeys);
    return (code ? code : "") + (name ? ` - ${name}` : "");
  };
  useEffect(() => {
    if (isEditMode && routeId) {
      setLoading(true);
      (async () => {
        try {
          const res = await getTierDetails(String(routeId));
          const data = res?.data ?? res;
          const itemId = data?.item_id ?? data?.itemId ?? data?.id ?? "";
          const labelParts = [];
          if (data?.erp_code) labelParts.push(data.erp_code);
          else if (data?.item_code) labelParts.push(data.item_code);
          else if (data?.code) labelParts.push(data.code);
          if (data?.name) labelParts.push(data.name);
          const itemLabel = labelParts.join(" - ") || (data?.name ?? "");

          setForm({
            warehouse: data?.warehouse_id ? String(data.warehouse_id) : "",
            route: data?.route_id ? String(data.route_id) : "",
            current_points: data?.route_id ? String(data.route_id) : "",
            customer: data?.customer_id ? String(data.customer_id) : "",
            adjustment_type: data?.period,
            adjustment_points: data?.minpurchase,
            description: data?.maxpurchase,
          });
          if (data?.warehouse_id) {
            const whLabel = (data.warehouse_code ?? data.warehouse_name ?? data.warehouse ?? "") || String(data.warehouse_id);
            setSelectedWarehouseOption({ value: String(data.warehouse_id), label: whLabel });
          }
          if (data?.route_id) {
            const rLabel = (data.route_code ?? data.route_name ?? data.route ?? "") || String(data.route_id);
            setSelectedRouteOption({ value: String(data.route_id), label: rLabel });
          }
          if (data?.customer_id) {
            const cLabel = (data.customer_code ?? data.customer_name ?? data.customer ?? "") || String(data.customer_id);
            setSelectedCustomerOption({ value: String(data.customer_id), label: cLabel });
            // fetch closing points for this customer on load
            fetchCustomerClosingPoints(String(data.customer_id));
          }

       
        } catch (err) {
          showSnackbar("Failed to fetch route details", "error");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isEditMode, routeId]);

  // Validation schema
  const validationSchema = yup.object().shape({
    warehouse: yup
      .string()
      .required("Warehouse is required"),
    route: yup
      .string()
      .required("Route is required"),
    customer: yup
      .string()
      .required("Customer is required"),

    adjustment_type: yup.string().required("Adjustment Type is required"),
    description: yup.string().required("Description is required"),
    adjustment_points: yup
      .number()
      .transform((value, originalValue) => {
        // treat empty string as undefined so required() triggers
        return originalValue === "" || originalValue === null || originalValue === undefined
          ? undefined
          : Number(originalValue);
      })
      .typeError("Adjustment Points must be a number")
      .required("Adjustment Points is required")
      .min(0, "You cannot write negative value"),
   
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear existing error for this field
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    // Live validation: prevent negative values being entered for number fields
    if (field === "adjustment_points") {
      // allow empty value (will be caught by required on submit)
      if (value === "") {
        setErrors((prev) => ({ ...prev, [field]: "" }));
        return;
      }
      const num = Number(value);
      if (!isNaN(num) && num < 0) {
        setErrors((prev) => ({ ...prev, [field]: "You cannot write negative value" }));
      } else {
        // clear negative error if fixed
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const fetchItems = async (searchTerm: string) => {
    try {
      const res = await itemGlobalSearch({ per_page: "10", query: searchTerm });
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch items", "error");
        return [];
      }
      const data = (res?.data || []) as Dict[];
      const options = data.map((item) => ({
        value: String(item.id ?? item.uuid ?? item.item_id ?? ""),
        label: makeLabel(item, ["erp_code", "item_code", "code"], ["name"]) || String(item.id ?? item.uuid ?? ""),
      }));
      return options;
    } catch (err) {
      showSnackbar("Failed to fetch items", "error");
      return [];
    }
  };

  const fetchWarehouses = async (searchTerm: string) => {
    try {
      const res = await warehouseListGlobalSearch({ per_page: "10", query: searchTerm });
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch warehouses", "error");
        return [];
      }
  const data = (res?.data || []) as Dict[];
  return data.map((w) => ({ value: String(w.id ?? w.uuid ?? w.warehouse_id ?? ""), label: makeLabel(w, ["warehouse_code", "code"], ["name", "warehouse_name", "warehouse"]) || String(w.id ?? w.uuid ?? w.warehouse_id ?? "") }));
    } catch (err) {
      showSnackbar("Failed to fetch warehouses", "error");
      return [];
    }
  };

  const fetchRoutes = async (searchTerm: string) => {
    try {
      // prefer warehouse-specific routes when warehouse selected
      if (form.warehouse) {
        // Some APIs return routes for warehouse via getRouteInWarehouse or routeList with warehouse_id
        try {
          const res = await routeList({ warehouse_id: form.warehouse, search: searchTerm, per_page: "50" });
          if (res?.error) {
            showSnackbar(res.data?.message || "Failed to fetch routes", "error");
            return [];
          }
          const data = (res?.data || []) as Dict[];
          return data.map((r) => ({ value: String(r.id ?? r.uuid ?? r.route_id ?? ""), label: makeLabel(r, ["route_code", "code"], ["name", "route_name"]) || String(r.id ?? r.uuid ?? r.route_id ?? "") }));
        } catch (e) {
          // fallback to warehouse-specific route endpoint
          const res2 = await getRouteInWarehouse(form.warehouse, { per_page: "100" } as Record<string, string>);
          const data2 = (res2?.data || []) as Dict[];
          const filtered = searchTerm
            ? data2.filter((r) => ((getFirstValue(r, ["route_code", "code"]) ) + (getFirstValue(r, ["name"]) ? ` - ${getFirstValue(r, ["name"])}` : "")).toLowerCase().includes(searchTerm.toLowerCase()))
            : data2;
          return filtered.map((r) => ({ value: String(r.id ?? r.uuid ?? r.route_id ?? ""), label: makeLabel(r, ["route_code", "code"], ["name", "route_name"]) || String(r.id ?? r.uuid ?? r.route_id ?? "") }));
        }
      }

      const res = await routeList({ per_page: "10", query: searchTerm, search: searchTerm });
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch routes", "error");
        return [];
      }
  const data = (res?.data || []) as Dict[];
  return data.map((r) => ({ value: String(r.id ?? r.uuid ?? r.route_id ?? ""), label: makeLabel(r, ["route_code", "code"], ["name", "route_name"]) || String(r.id ?? r.uuid ?? r.route_id ?? "") }));
    } catch (err) {
      showSnackbar("Failed to fetch routes", "error");
      return [];
    }
  };

  const fetchCustomers = async (searchTerm: string) => {
    try {
      if (form.route) {
        const res = await getAgentCusByRoute(form.route);
        if (res?.error) {
          showSnackbar(res.data?.message || "Failed to fetch customers for route", "error");
          return [];
        }
        const data = (res?.data || []) as Dict[];
        const filtered = searchTerm
          ? data.filter((c) => ((getFirstValue(c, ["code", "customer_code", "osa_code"]) ) + (getFirstValue(c, ["name", "customer_name", "outlet_name"]) ? ` - ${getFirstValue(c, ["name", "customer_name", "outlet_name"])}` : "")).toLowerCase().includes(searchTerm.toLowerCase()))
          : data;
        return filtered.map((c) => ({ value: String(c.id ?? c.uuid ?? c.customer_id ?? ""), label: makeLabel(c, ["code", "customer_code", "osa_code"], ["name", "customer_name", "outlet_name"]) || String(c.id ?? c.uuid ?? c.customer_id ?? "") }));
      }

      const res = await agentCustomerGlobalSearch({ per_page: "10", query: searchTerm });
      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to fetch customers", "error");
        return [];
      }
  const data = (res?.data || []) as Dict[];
  return data.map((c) => ({ value: String(c.id ?? c.uuid ?? c.customer_id ?? ""), label: makeLabel(c, ["code", "customer_code", "osa_code"], ["name", "customer_name", "outlet_name"]) || String(c.id ?? c.uuid ?? c.customer_id ?? "") }));
    } catch (err) {
      showSnackbar("Failed to fetch customers", "error");
      return [];
    }
  };

  const fetchCustomerClosingPoints = async (customerId: string) => {
    try {
      if (!customerId) return;
      const res = await getCustomerClosingPoints({ customer_id: customerId });
      // response shapes vary; try common locations for the closing points value
  let points: unknown = null;
      if (res == null) {
        points = null;
      } else if (typeof res === "number" || typeof res === "string") {
        points = res;
      } else if (res.data !== undefined) {
        // res.data might be object or value
        if (res.data.closing_points !== undefined) points = res.data.closing_points;
        else if (res.data?.data?.closing_points !== undefined) points = res.data.data.closing_points;
        else if (typeof res.data === "number" || typeof res.data === "string") points = res.data;
      } else if (res.closing_points !== undefined) {
        points = res.closing_points;
      }

      setForm((prev) => ({ ...prev, current_points: points !== null && points !== undefined ? String(points) : "" }));
    } catch (err) {
      showSnackbar("Failed to fetch customer closing points", "error");
      setForm((prev) => ({ ...prev, current_points: "" }));
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      const payload = {
        ...(form.warehouse ? { warehouse_id: form.warehouse } : {}),
        ...(form.route ? { route_id: form.route } : {}),
        ...(form.customer ? { customer_id: form.customer } : {}),
        adjustment_symbol: form.adjustment_type,
        adjustment_points: (form.adjustment_points),
        description: form.description,
      };

      let res;
      if (isEditMode && routeId) {
        res = await updateTier(routeId, payload);
      } else {
        res = await createAdjustment(payload);
      }

      if (res?.error) {
        showSnackbar(res.data?.message || "Failed to submit form", "error");
      } else {
        showSnackbar(
          isEditMode ? "Points Adjustment updated successfully" : "Points Adjustment added successfully",
          "success"
        );
        router.push("/pointsAdjustment");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
        // showSnackbar("Please fix validation errors before submitting", "error");
      } else {
        showSnackbar(
          isEditMode ? "Failed to update route" : "Failed to add route",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if ((isEditMode && loading)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/pointsAdjustment">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Update Points Adjustment" : "Add Points Adjustment"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Points Adjustment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           


            {/* Warehouse */}
            <div className="flex flex-col">
              <AutoSuggestion
              required
                label="Warehouse"
                placeholder="Search warehouse"
                onSearch={(q) => fetchWarehouses(q)}
                selectedOption={selectedWarehouseOption}
                onSelect={(opt) => {
                  setForm((prev) => ({ ...prev, warehouse: String(opt.value), route: "", customer: "" }));
                  setSelectedWarehouseOption(opt);
                  setSelectedRouteOption(null);
                  setSelectedCustomerOption(null);
                }}
                onClear={() => {
                  setForm((prev) => ({ ...prev, warehouse: "", route: "", customer: "" }));
                  setSelectedWarehouseOption(null);
                  setSelectedRouteOption(null);
                  setSelectedCustomerOption(null);
                }}
                className="w-full"
              />
               {errors.warehouse && (
                <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>
              )}
            </div>

            {/* Route */}
            <div className="flex flex-col">
              <AutoSuggestion
              required
                label="Route"
                placeholder="Search route"
                disabled={!form.warehouse}
                onSearch={(q) => fetchRoutes(q)}
                selectedOption={selectedRouteOption}
                onSelect={(opt) => {
                  setForm((prev) => ({ ...prev, route: String(opt.value), customer: "" }));
                  setSelectedRouteOption(opt);
                  setSelectedCustomerOption(null);
                }}
                onClear={() => {
                  setForm((prev) => ({ ...prev, route: "", customer: "" }));
                  setSelectedRouteOption(null);
                  setSelectedCustomerOption(null);
                }}
                className="w-full"
              />
               {errors.route && (
                <p className="text-red-500 text-sm mt-1">{errors.route}</p>
              )}
            </div>

            {/* Customer */}
            <div className="flex flex-col">
              <AutoSuggestion
              required
                label="Customer"
                disabled={!form.route}
                placeholder="Search customer"
                onSearch={(q) => fetchCustomers(q)}
                selectedOption={selectedCustomerOption}
                onSelect={(opt) => {
                  const customerId = String(opt.value);
                  setForm((prev) => ({ ...prev, customer: customerId }));
                  setSelectedCustomerOption(opt);
                  // fetch closing points for selected customer
                  fetchCustomerClosingPoints(customerId);
                }}
                onClear={() => {
                  setForm((prev) => ({ ...prev, customer: "", current_points: "" }));
                  setSelectedCustomerOption(null);
                }}
                className="w-full"
              />
               {errors.customer && (
                <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
              )}
            </div>
<div className="flex flex-col">
              <InputFields
              min={1}
                type="number"
                disabled={true}
                label="Current Points"
                value={form.current_points}
                onChange={(e) => {
                  handleChange("current_points", e.target.value);
                }}
                error={(errors.current_points)}
              />
              
            </div>


            <div className="flex flex-col">
              <InputFields
                required
                label="Adjustment Type"
                value={form.adjustment_type}
                onChange={(e) => handleChange("adjustment_type", e.target.value)}
                options={[
                  { value: "1", label: "Increase" },
                  { value: "2", label: "Decrease" },
                ]}
                error={errors.adjustment_type}
              />
              
            </div>
<div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="number"
                label="Adjustment Points"
                value={form.adjustment_points}
                onChange={(e) => {
                  handleChange("adjustment_points", e.target.value);
                }}
                error={(errors.adjustment_points)}
              />
            </div>
            <div className="flex flex-col">
              <InputFields
              min={1}
                required
                type="text"
                label="Description"
                value={form.description}
                onChange={(e) => {
                  handleChange("description", e.target.value);
                }}
                error={(errors.description)}
              />
              
            </div>
            
          </div>
        </div>
      </div>

   

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-6 pr-0">
        <button
          type="button"
          className={`px-6 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 ${submitting
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : "border-gray-300"
            }`}
          onClick={() => router.push("/pointsAdjustment")}
          disabled={submitting}
        // disable while submitting
        >
          Cancel
        </button>
        <SidebarBtn
          label={
            submitting
              ? isEditMode
                ? "Updating..."
                : "Submitting..."
              : isEditMode
                ? "Update"
                : "Submit"
          }
          isActive={!submitting}
          leadingIcon="mdi:check"
          onClick={handleSubmit}
          disabled={submitting}
        />
      </div>
    </>
  );
}
