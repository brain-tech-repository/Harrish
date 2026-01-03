"use client";

import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify-icon/react";

import InputFields from "@/app/components/inputFields";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import ContainerCard from "@/app/components/containerCard";
import Loading from "@/app/components/Loading";

import { useSnackbar } from "@/app/services/snackbarContext";
import { useLoading } from "@/app/services/loadingContext";

import {
  spareCategoryList,
  spareSubCategoryList,
  addSpareName,
  updateSpareName,
  spareNameByID,
} from "@/app/services/assetsApi";

import { genearateCode, saveFinalCode } from "@/app/services/allApi";

/* -------------------- VALIDATION -------------------- */
const validationSchema = Yup.object({
  spare_name: Yup.string().required("Spare name is required"),
  spare_categoryid: Yup.string().required("Spare category is required"),
  spare_subcategoryid: Yup.string().required("Spare sub category is required"),
  plant: Yup.string().required("Plant is required"),
  status: Yup.number().oneOf([0, 1]).required(),
});

export default function AddEditSpareName() {
  const router = useRouter();
  const params = useParams();
  const uuid = typeof params.uuid === "string" ? params.uuid : "";
  const isEditMode = uuid && uuid !== "add";

  const { showSnackbar } = useSnackbar();
  const { setLoading } = useLoading();

  const codeGeneratedRef = useRef(false);
  const [localLoading, setLocalLoading] = useState(false);

  const [spareCategories, setSpareCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [spareSubCategories, setSpareSubCategories] = useState<
    { value: string; label: string }[]
  >([]);

  /* -------------------- FORM -------------------- */
  const formik = useFormik({
    initialValues: {
      osa_code: "",
      spare_name: "",
      spare_categoryid: "",
      spare_subcategoryid: "",
      plant: "",
      status: 1,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          spare_name: values.spare_name,
          spare_categoryid: values.spare_categoryid,
          spare_subcategoryid: values.spare_subcategoryid,
          plant: values.plant,
          status: Number(values.status),
        };

        const res = isEditMode
          ? await updateSpareName(uuid, payload as any)
          : await addSpareName({ ...payload, osa_code: values.osa_code } as any);

        if (res?.error) {
          showSnackbar(res.message || "Failed to save", "error");
          return;
        }

        if (!isEditMode) {
          await saveFinalCode({
            reserved_code: values.osa_code,
            model_name: "spa_cat",
          });
        }

        showSnackbar(
          isEditMode ? "Spare updated successfully" : "Spare added successfully",
          "success"
        );

        router.push("/settings/manageAssets/spareMenu");
      } catch {
        showSnackbar("Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  /* -------------------- LOAD SUB CATEGORY -------------------- */
  const loadSubCategories = async (
    categoryId: string,
    selectedSubId?: string
  ) => {
    const res = await spareSubCategoryList({ category_id: categoryId });

    const options =
      res?.data?.map((sc: any) => ({
        value: String(sc.id),
        label: sc.spare_subcategory_name,
      })) || [];

    setSpareSubCategories(options);

    if (selectedSubId) {
      formik.setFieldValue("spare_subcategoryid", selectedSubId);
    }
  };

  /* -------------------- LOAD DATA -------------------- */
  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      try {
        /* ---- LOAD CATEGORIES ---- */
        const catRes = await spareCategoryList({});
        const categoryOptions =
          catRes?.data?.map((c: any) => ({
            value: String(c.id),
            label: c.spare_category_name,
          })) || [];

        setSpareCategories(categoryOptions);

        /* ---- EDIT MODE ---- */
        if (isEditMode) {
          const res = await spareNameByID(uuid);
          const d = res?.data;
          console.log("Spare Data:", d);

          if (d) {
            formik.setValues({
              osa_code: d.osa_code ?? "",
              spare_name: d.spare_name ?? "",
              spare_categoryid: String(d.spare_categoryid),
              spare_subcategoryid: String(d.spare_subcategoryid),
              plant: d.plant ?? "",
              status: d.status ?? 1,
            });

            await loadSubCategories(
              String(d.spare_categoryid),
              // String(d.spare_subcategory_id)
            );
          }
        }

        /* ---- ADD MODE CODE ---- */
        if (!isEditMode && !codeGeneratedRef.current) {
          codeGeneratedRef.current = true;
          const codeRes = await genearateCode({ model_name: "spa_cat" });
          if (codeRes?.code) {
            formik.setFieldValue("osa_code", codeRes.code);
          }
        }
      } catch {
        showSnackbar("Failed to load data", "error");
      } finally {
        setLocalLoading(false);
      }
    };

    loadData();
  }, [uuid]);

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div onClick={() => router.back()} className="cursor-pointer">
          <Icon icon="lucide:arrow-left" width={24} />
        </div>
        <h1 className="text-xl font-semibold">
          {isEditMode ? "Update Spare Name" : "Add Spare Name"}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {localLoading ? (
          <Loading />
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <ContainerCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputFields label="Code" value={formik.values.osa_code} disabled onChange={(e: any) => {}} />

                <InputFields
                  label="Spare Name"
                  name="spare_name"
                  value={formik.values.spare_name}
                  onChange={formik.handleChange}
                />

                <InputFields
                  label="Spare Category"
                  type="select"
                  name="spare_categoryid"
                  options={spareCategories}
                  value={formik.values.spare_categoryid}
                  onChange={(e) => {
                    const catId = e.target.value;
                    formik.setFieldValue("spare_categoryid", catId);
                    formik.setFieldValue("spare_subcategoryid", "");
                    loadSubCategories(catId);
                  }}
                />

                <InputFields
                  label="Spare Sub Category"
                  type="select"
                  name="spare_subcategoryid"
                  options={spareSubCategories}
                  value={formik.values.spare_subcategoryid}
                  onChange={formik.handleChange}
                />

                <InputFields
                  label="Plant"
                  name="plant"
                  value={formik.values.plant}
                  onChange={formik.handleChange}
                />

                <InputFields
                  label="Status"
                  type="radio"
                  name="status"
                  value={formik.values.status.toString()}
                  onChange={formik.handleChange}
                  options={[
                    { value: "1", label: "Active" },
                    { value: "0", label: "Inactive" },
                  ]}
                />
              </div>
            </ContainerCard>

            <div className="flex justify-end mt-6">
              <SidebarBtn
                type="submit"
                label={isEditMode ? "Update" : "Submit"}
                isActive
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
