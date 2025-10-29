"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import * as yup from "yup";
import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useSnackbar } from "@/app/services/snackbarContext";
import Loading from "@/app/components/Loading";
import {
  regionList,
  getArea,
  warehouseList,
  routeList,
  saveRouteVisit,
  updateRouteVisitDetails,
  getRouteVisitDetails,
  subRegionList,
  agentCustomerList,
} from "@/app/services/allApi";
import Table from "./toggleTable";
import StepperForm, {
  useStepperForm,
  StepperStep,
} from "@/app/components/stepperForm";

// Types for customer data
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

export default function AddEditRouteVisit() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const visitId = params?.id as string | undefined;
  const isEditMode = !!(visitId && visitId !== "add");
  const [skeleton, setSkeleton] = useState({
    route: false,
    region: false,
    area: false,
    warehouse: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [regionOptions, setRegionOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [areaOptions, setAreaOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [warehouseOptions, setWarehouseOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [routeOptions, setRouteOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSchedules, setCustomerSchedules] = useState<
    CustomerSchedule[]
  >([]);

  const [selectedCustomerType, setSelectedCustomerType] = useState<string>();

  const [form, setForm] = useState({
    customer_type: "1",
    region: [] as string[],
    area: [] as string[],
    warehouse: [] as string[],
    route: [] as string[],
    days: [] as string[],
    from_date: "",
    to_date: "",
    status: "1",
  });

  // Stepper setup
  const steps: StepperStep[] = [
    { id: 1, label: "Route Details" },
    { id: 2, label: "Customer Schedule" },
  ];

  const {
    currentStep,
    nextStep,
    prevStep,
    markStepCompleted,
    isStepCompleted,
    isLastStep,
  } = useStepperForm(steps.length);

  // ✅ Validation schema for single selects
  const validationSchema = yup.object().shape({
    customer_type: yup.string().required("Customer type is required"),
    region: yup.array().min(1, "Region is required"),
    area: yup.array().min(1, "Area is required"),
    warehouse: yup.array().min(1, "Warehouse is required"),
    route: yup.array().min(1, "Route is required"),
    from_date: yup.string().required("From date is required"),
    to_date: yup
      .string()
      .required("To date is required")
      .test(
        "is-after-or-equal",
        "To Date must be after or equal to From Date",
        function (value) {
          const { from_date } = this.parent;
          if (!from_date || !value) return true;
          return new Date(value) >= new Date(from_date);
        }
      ),
    status: yup.string().required("Status is required"),
  });

  // Step-specific validation schemas
  const stepSchemas = [
    // Step 1: Route Details validation
    yup.object().shape({
      region: validationSchema.fields.region,
      area: validationSchema.fields.area,
      warehouse: validationSchema.fields.warehouse,
      route: validationSchema.fields.route,
      from_date: validationSchema.fields.from_date,
      to_date: validationSchema.fields.to_date,
      status: validationSchema.fields.status,
    }),
    // Step 2: Customer Schedule validation
    yup.object().shape({
      customer_type: validationSchema.fields.customer_type,
    }),
  ];

  // ✅ Fetch dropdowns
  const loadDropdownData = async () => {
    try {
      const regions = await regionList();

      setRegionOptions(
        regions?.data?.map((r: any) => ({
          value: String(r.id),
          label: r.region_name || r.name,
        })) || []
      );
    } catch {
      showSnackbar("Failed to load dropdown data", "error");
    }
  };

  // ✅ Load data for editing
  const loadVisitData = async (uuid: string) => {
    setLoading(true);
    try {
      const res = await getRouteVisitDetails(uuid);
      console.log(res);
      const allVisits = res?.data || [];
      const existing = allVisits.find(
        (item: any) => String(item.uuid) === String(uuid)
      );

      if (existing) {
        setForm({
          customer_type: String(existing.customer_type ?? "1"),
          region: existing.region_ids?.map(String) || [],
          area: existing.area_ids?.map(String) || [],
          warehouse: existing.warehouse_ids?.map(String) || [],
          route: existing.route_ids?.map(String) || [],
          days: existing.days || [],
          from_date: existing.from_date || "",
          to_date: existing.to_date || "",
          status: String(existing.status ?? "1"),
        });

        // If there are existing customer schedules, load them
        if (existing.customers && Array.isArray(existing.customers)) {
          setCustomerSchedules(
            existing.customers.map((customer: any) => ({
              customer_id: customer.customer_id,
              days: customer.days || [],
            }))
          );
        }
      } else {
        showSnackbar("Route visit not found", "error");
      }
    } catch {
      showSnackbar("Failed to fetch route visit details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      let res = null;
      if (selectedCustomerType == "1") {
        res = await agentCustomerList();
      } else {
        res = await agentCustomerList();
      }

      console.log(res, selectedCustomerType);
      setCustomers(res.data);
    };

    fetchCustomers();
  }, [selectedCustomerType]);

  // 1️⃣ When Region changes → Fetch Areas
  useEffect(() => {
    if (!form.region.length) {
      setAreaOptions([]);
      setForm((prev) => ({ ...prev, area: [], warehouse: [], route: [] }));
      return;
    }

    const fetchAreas = async () => {
      try {
        setSkeleton({ ...skeleton, area: true });
        const res = await subRegionList({ region_id: String(form.region[0]) });
        const areaList = res?.data?.data || res?.data || [];

        setAreaOptions(
          areaList.map((a: any) => ({
            value: String(a.id),
            label: a.area_name || a.name,
          }))
        );
        setSkeleton({ ...skeleton, area: false });
      } catch (err) {
        console.error("Failed to fetch area list:", err);
        setAreaOptions([]);
      }
    };

    fetchAreas();
  }, [form.region]);

  // 2️⃣ When Area changes → Fetch Warehouses
  useEffect(() => {
    if (!form.area.length) {
      setWarehouseOptions([]);
      setForm((prev) => ({ ...prev, warehouse: [], route: [] }));
      return;
    }

    const fetchWarehouses = async () => {
      try {
        setSkeleton({ ...skeleton, warehouse: true });
        const res = await warehouseList({ area_id: String(form.area[0]) });
        const warehousesList = res?.data?.data || res?.data || [];

        setWarehouseOptions(
          warehousesList.map((w: any) => ({
            value: String(w.id),
            label: w.warehouse_name || w.name,
          }))
        );
        setSkeleton({ ...skeleton, warehouse: false });
      } catch (err) {
        console.error("Failed to fetch warehouse list:", err);
        setWarehouseOptions([]);
      }
    };

    fetchWarehouses();
  }, [form.area]);

  // 3️⃣ When Warehouse changes → Fetch Routes
  useEffect(() => {
    if (!form.warehouse.length) {
      setRouteOptions([]);
      setForm((prev) => ({ ...prev, route: [] }));
      return;
    }

    const fetchRoutes = async () => {
      try {
        setSkeleton({ ...skeleton, route: true });
        const res = await routeList({
          warehouse_id: String(form.warehouse[0]),
        });
        console.log(res);
        const routeListData = res?.data?.data || res?.data || [];

        setRouteOptions(
          routeListData.map((r: any) => ({
            value: String(r.id),
            label: r.route_name || r.name,
          }))
        );
        setSkeleton({ ...skeleton, route: false });
      } catch (err) {
        console.error("Failed to fetch route list:", err);
        setRouteOptions([]);
      }
    };

    fetchRoutes();
  }, [form.warehouse]);

  useEffect(() => {
    loadDropdownData();
    if (isEditMode && visitId) loadVisitData(visitId);
  }, [isEditMode, visitId]);

  // ✅ Single select handler for array fields
  const handleSingleSelectChange = (field: string, value: string) => {
    console.log(field);
    if (field == "customer_type") {
      setSelectedCustomerType(value);
      setForm((prev) => ({ ...prev, [field]: value }));
    } else if (["region", "area", "warehouse", "route"].includes(field)) {
      // For array fields, store as single element array
      setForm((prev) => ({
        ...prev,
        [field]: value ? [value] : [],
        // Reset dependent fields when parent changes
        ...(field === "region" && { area: [], warehouse: [], route: [] }),
        ...(field === "area" && { warehouse: [], route: [] }),
        ...(field === "warehouse" && { route: [] }),
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Handle customer schedule updates from Table component
  const handleCustomerScheduleUpdate = useCallback(
    (schedules: CustomerSchedule[]) => {
      setCustomerSchedules(schedules);
    },
    []
  );

  // ✅ Step navigation
  const handleNext = async () => {
    try {
      const schema = stepSchemas[currentStep - 1];
      await schema.validate(form, { abortEarly: false });
      markStepCompleted(currentStep);
      nextStep();
      setErrors({});
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      }
    }
  };

  // ✅ Handle submit
  const handleSubmit = async () => {
    try {
      if (form.from_date && form.to_date) {
        const fromDate = new Date(form.from_date);
        const toDate = new Date(form.to_date);
        if (toDate < fromDate) {
          setErrors({
            ...errors,
            to_date: "To Date must be after or equal to From Date",
          });
          return;
        }
      }

      // Validate that at least one customer has days selected
      const hasValidSchedules = customerSchedules.some(
        (schedule) => schedule.days && schedule.days.length > 0
      );

      if (!hasValidSchedules) {
        showSnackbar("Please select days for at least one customer", "error");
        return;
      }

      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setSubmitting(true);

      // ✅ Build payload in the required format
      const payload = {
        customer_type: Number(form.customer_type),
        customers: customerSchedules
          .filter((schedule) => schedule.days && schedule.days.length > 0)
          .map((schedule) => ({
            customer_id: Number(schedule.customer_id),
            region: form.region.map(Number),
            area: form.area.map(Number),
            warehouse: form.warehouse.map(Number),
            route: form.route.map(Number),
            days: schedule.days,
            from_date: form.from_date,
            to_date: form.to_date,
            status: Number(form.status),
          })),
      };

      let res;
      if (isEditMode) {
        res = await updateRouteVisitDetails(payload);
      } else {
        res = await saveRouteVisit(payload);
      }

      if (res?.error) {
        showSnackbar(
          res?.data?.message || "Failed to save route visit",
          "error"
        );
      } else {
        showSnackbar(
          isEditMode
            ? "Route visit updated successfully"
            : "Route visit created successfully",
          "success"
        );
        router.push("/routeVisit");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const formErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) formErrors[e.path] = e.message;
        });
        setErrors(formErrors);
      } else {
        showSnackbar("Failed to submit form", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* From Date */}
              <div>
                <InputFields
                  required
                  label="From Date"
                  type="date"
                  value={form.from_date}
                  onChange={(e) =>
                    handleSingleSelectChange("from_date", e.target.value)
                  }
                  error={errors.from_date}
                />
                {errors.from_date && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.from_date}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <InputFields
                  required
                  label="To Date"
                  type="date"
                  value={form.to_date}
                  onChange={(e) =>
                    handleSingleSelectChange("to_date", e.target.value)
                  }
                  error={errors.to_date}
                />
                {errors.to_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.to_date}</p>
                )}
              </div>

              {/* Region */}
              <div>
                <InputFields
                  required
                  label="Region"
                  value={form.region[0] || ""}
                  showSkeleton={skeleton.region}
                  onChange={(e) =>
                    handleSingleSelectChange("region", e.target.value)
                  }
                  options={regionOptions}
                  error={errors.region}
                />
                {errors.region && (
                  <p className="text-red-500 text-sm mt-1">{errors.region}</p>
                )}
              </div>

              {/* Area */}
              <div>
                <InputFields
                  required
                  disabled={form.region.length === 0}
                  label="Area"
                  value={form.area[0] || ""}
                  showSkeleton={skeleton.area}
                  onChange={(e) =>
                    handleSingleSelectChange("area", e.target.value)
                  }
                  options={areaOptions}
                  error={errors.area}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              {/* Warehouse */}
              <div>
                <InputFields
                  required
                  disabled={form.area.length === 0 || areaOptions.length === 0}
                  label="Warehouse"
                  value={form.warehouse[0] || ""}
                  showSkeleton={skeleton.warehouse}
                  onChange={(e) =>
                    handleSingleSelectChange("warehouse", e.target.value)
                  }
                  options={warehouseOptions}
                  error={errors.warehouse}
                />
                {errors.warehouse && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.warehouse}
                  </p>
                )}
              </div>

              {/* Route */}
              <div>
                <InputFields
                  required
                  disabled={form.warehouse.length === 0}
                  label="Route"
                  value={form.route[0] || ""}
                  showSkeleton={skeleton.route}
                  onChange={(e) =>
                    handleSingleSelectChange("route", e.target.value)
                  }
                  options={routeOptions}
                  error={errors.route}
                />
                {errors.route && (
                  <p className="text-red-500 text-sm mt-1">{errors.route}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <InputFields
                  required
                  label="Status"
                  type="radio"
                  value={form.status}
                  onChange={(e) =>
                    handleSingleSelectChange("status", e.target.value)
                  }
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                  error={errors.status}
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-200 mb-6">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Customer Type */}
                <div>
                  <InputFields
                    required
                    label="Customer Type"
                    value={form.customer_type}
                    onChange={(e) =>
                      handleSingleSelectChange("customer_type", e.target.value)
                    }
                    options={[
                      { value: "1", label: "Agent Customer" },
                      { value: "2", label: "Merchandiser" },
                    ]}
                    error={errors.customer_type}
                  />
                  {errors.customer_type && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customer_type}
                    </p>
                  )}
                </div>
              </div>

              <Table
                selectedCustomerType={
                  selectedCustomerType ? selectedCustomerType : "Agent Customer"
                }
                customers={customers}
                onScheduleUpdate={handleCustomerScheduleUpdate}
                initialSchedules={customerSchedules}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
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
          <Link href="/routeVisit">
            <Icon icon="lucide:arrow-left" width={24} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Route Visit" : "Add Route Visit"}
          </h1>
        </div>
      </div>

      {/* Stepper Form */}
      <StepperForm
        steps={steps.map((step) => ({
          ...step,
          isCompleted: isStepCompleted(step.id),
        }))}
        currentStep={currentStep}
        onBack={prevStep}
        onNext={handleNext}
        onSubmit={handleSubmit}
        showSubmitButton={isLastStep}
        showNextButton={!isLastStep}
        nextButtonText="Save & Next"
        submitButtonText={submitting ? "Submitting..." : "Submit"}
      >
        {renderStepContent()}
      </StepperForm>
    </>
  );
}
