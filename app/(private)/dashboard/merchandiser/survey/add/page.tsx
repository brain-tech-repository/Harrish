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
import { addSurvey } from "@/app/services/allApi";
import SettingPopUp from "@/app/components/settingPopUp";
import IconButton from "@/app/components/iconButton";

const SurveySchema = Yup.object().shape({
  surveyName: Yup.string().required("Survey Name is required."),
  surveyCode: Yup.string().required("Survey Code is required."),
  startDate: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date"),
  endDate: Yup.date()
    .required("Field is required.")
    .typeError("Please enter a valid date")
    .min(
      Yup.ref("startDate"),
      "Valid To date cannot be before Valid From date"
    ),
  status: Yup.string().required("Please select a status."),
});

type SurveyFormValues = {
  surveyCode: string;
  surveyName: string;
  startDate: string;
  endDate: string;
  status: string; // "active" | "inactive"
};

export default function AddSurvey() {
  const { showSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const initialValues: SurveyFormValues = {
    surveyCode: "",
    surveyName: "",
    startDate: "",
    endDate: "",
    status: "",
  };

  const handleSubmit = async (
    values: SurveyFormValues,
    { setSubmitting }: FormikHelpers<SurveyFormValues>
  ) => {
    try {
      // ✅ send backend-friendly keys
      const payload = {
        survey_code: values.surveyCode.trim(),
        survey_name: values.surveyName.trim(),
        start_date: values.startDate,
        end_date: values.endDate,
        status: values.status, // <-- directly "active" or "inactive"
      };

      console.log("Payload ->", payload);
      const res = await addSurvey(payload);

      if (res?.errors) {
        const errs: string[] = [];
        for (const key in res.errors) errs.push(...res.errors[key]);
        showSnackbar(errs.join(" | "), "error");
        setSubmitting(false);
        return;
      }

      showSnackbar("Survey added successfully ✅", "success");
      router.push("/dashboard/merchandiser/survey");
    } catch (error) {
      console.error(error);
      showSnackbar("Failed to add Survey ❌", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/merchandiser/survey"
          className="text-gray-600 hover:text-gray-800"
        >
          <Icon icon="lucide:arrow-left" width={24} />
        </Link>
        <h1 className="text-xl font-semibold">Add New Survey</h1>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={SurveySchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <ContainerCard>
              <h2 className="text-lg font-semibold mb-6">Survey Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Survey Code */}
              {/* Survey Code */}
<div className="flex flex-col gap-1 max-w-[406px]">
  <div className="flex items-end gap-2">
    <InputFields
      label="Survey Code"
      name="surveyCode"
      value={values.surveyCode}
      onChange={(e) => setFieldValue("surveyCode", e.target.value)}
    />
    <IconButton
      bgClass="white"
      className="mb-2 cursor-pointer text-[#252B37]"
      icon="mi:settings"
      onClick={() => setIsOpen(true)}
    />
    <SettingPopUp
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Survey Code"
    />
  </div>

  {/* Error message below the input */}
  <ErrorMessage
    name="surveyCode"
    component="span"
    className="text-xs text-red-500"
  />
</div>


                {/* Survey Name */}
                <div>
                  <InputFields
                    label="Survey Name"
                    name="surveyName"
                    value={values.surveyName}
                    onChange={(e) => setFieldValue("surveyName", e.target.value)}
                  />
                  <ErrorMessage
                    name="surveyName"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Dates */}
                <div>
                  <InputFields
                    label="Start Date"
                    name="startDate"
                    value={values.startDate}
                    onChange={(e) => setFieldValue("startDate", e.target.value)}
                    type="date"
                  />
                  <ErrorMessage
                    name="startDate"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>
                <div>
                  <InputFields
                    label="End Date"
                    name="endDate"
                    value={values.endDate}
                    onChange={(e) => setFieldValue("endDate", e.target.value)}
                    type="date"
                  />
                  <ErrorMessage
                    name="endDate"
                    component="span"
                    className="text-xs text-red-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <InputFields
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                  />
                  <ErrorMessage
                    name="status"
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
                label={isSubmitting ? "Submitting..." : "Submit"}
                isActive={!isSubmitting}
                leadingIcon="mdi:check"
                type="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
