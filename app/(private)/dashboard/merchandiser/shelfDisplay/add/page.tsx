"use client";

import React from "react";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, ErrorMessage, type FormikHelpers } from "formik";
import * as Yup from "yup";
import ContainerCard from "@/app/components/containerCard";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import InputFields from "@/app/components/inputFields";
import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";
import { addShelves } from "@/app/services/merchandiserApi";
import { useAllDropdownListData } from "@/app/components/contexts/allDropdownListData";

const ShelfDisplaySchema = Yup.object().shape({
  name: Yup.string().required("Name is required."),
  validFrom: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date"),
  validTo: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date")
    .min(
      Yup.ref("validFrom"),
      "Valid To date cannot be before Valid From date"
    ),

  height: Yup.number().required("Height is required."),
  width: Yup.number().required("Width is required."),
  depth: Yup.number().required("Depth is required."),
  customerIds: Yup.array()
    .of(Yup.number().required())
    .min(1, "Please select at least one customer.")
    .required("Please select at least one customer."),
});

type shelvesType = {
  name: string;
  validFrom: string;
  validTo: string;
  height: string;
  width: string;
  depth: string;
  customerIds: Array<string>;
};

export default function AddShelfDisplay() {
  const { companyCustomersOptions } = useAllDropdownListData();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const {setLoading} = useLoading();

  const initialValues: shelvesType = {
    name: "",
    validFrom: "",
    validTo: "",
    height: "",
    width: "",
    depth: "",
    customerIds: [],
  };

  // ✅ Local submit handler (no API)
  const handleSubmit = async (
    values: shelvesType,
    { setSubmitting }: FormikHelpers<shelvesType>
  ) => {
    const localPayload = {
      shelf_name: values.name.trim(),
      valid_from: values.validFrom.trim(),
      valid_to: values.validTo.trim(),
      height: Number(values.height.trim()),
      width: Number(values.width.trim()),
      depth: Number(values.depth.trim()),
      customer_ids: values.customerIds.map(Number),
    };

    setLoading(true);
    const res = await addShelves(localPayload);
    if(res.error) {
      showSnackbar(res.data.message, "error");
      setLoading(false);
      setSubmitting(false);
      throw new Error("Unable to add Shelf Display");
    } else {
      showSnackbar(res.message || "Shelf Display added locally", "success");
      setLoading(false);
      setSubmitting(false);
      router.push("/dashboard/merchandiser/shelfDisplay");
    }

  };
  
  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/merchandiser/shelfDisplay">
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Shelf Display</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ShelfDisplaySchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, touched, errors }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">
                Shelf Display Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <InputFields
                    required
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={(e) => setFieldValue("name", e.target.value)}
                    error={touched.name && errors.name}
                  />
                  <ErrorMessage
                    name="name"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label="Customer"
                    name="customerIds"
                    value={values.customerIds}
                    isSingle={false}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
                        setFieldValue("customerIds", e.target.value);
                    }}
                    options={companyCustomersOptions}
                  />
                  <ErrorMessage
                    name="customer"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                <div>
                  <InputFields
                    required
                    label="Valid From"
                    type="date"
                    name="validFrom"
                    value={values.validFrom}
                    onChange={(e) => setFieldValue("validFrom", e.target.value)}
                  />
                  <ErrorMessage
                    name="validFrom"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label="Valid To"
                    type="date"
                    name="validTo"
                    value={values.validTo}
                    onChange={(e) => setFieldValue("validTo", e.target.value)}
                  />
                  <ErrorMessage
                    name="validTo"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label="Height(CM)"
                    name="height"
                    value={values.height}
                    onChange={(e) => setFieldValue("height", e.target.value)}
                  />
                  <ErrorMessage
                    name="height"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label=" Width(CM)"
                    name="width"
                    value={values.width}
                    onChange={(e) => setFieldValue("width", e.target.value)}
                  />
                  <ErrorMessage
                    name="width"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    required
                    label="Depth(CM)"
                    name="depth"
                    value={values.depth}
                    onChange={(e) => setFieldValue("depth", e.target.value)}
                  />
                  <ErrorMessage
                    name="depth"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
              </div>
            </ContainerCard>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="reset"
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <SidebarBtn
                type="submit"
                label={isSubmitting ? "Submitting..." : "Submit"}
                isActive
                leadingIcon="mdi:check"
                disabled={isSubmitting}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
