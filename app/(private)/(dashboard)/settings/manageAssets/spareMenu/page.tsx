"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/services/snackbarContext";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
import { useLoading } from "@/app/services/loadingContext";
import Table, {
  listReturnType,
  TableDataType,
} from "@/app/components/customTable";
import StatusBtn from "@/app/components/statusBtn2";
import { spareMenu } from "@/app/services/assetsApi";

export default function SpareList() {
  const { setLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const router = useRouter();

  const fetchSpare = useCallback(
    async (pageNo: number = 1, pageSize: number = 5): Promise<listReturnType> => {
      try {
        setLoading(true);

        const res = await spareMenu({
          page: pageNo.toString(),
          per_page: pageSize.toString(),
        });

        if (res?.error) {
          showSnackbar(
            res?.data?.message || "Failed to fetch spare list",
            "error"
          );
          throw new Error("Fetch failed");
        }

        const page = Number(res?.pagination?.page) || 1;
        const limit = Number(res?.pagination?.limit) || pageSize;
        const totalPages = Number(res?.pagination?.totalPages) || 1;

        return {
          data: res?.data || [],
          currentPage: page,
          pageSize: limit,
          total: totalPages * limit,
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, showSnackbar]
  );

  return (
    <div className="flex flex-col h-full">
      <Table
        config={{
          api: {
            list: fetchSpare,
          },

          header: {
            title: "Spare List",
            searchBar: false,
            columnFilter: true,
            actions: [
              <SidebarBtn
                key="add"
                href="/settings/manageAssets/spareMenu/add"
                leadingIcon="lucide:plus"
                label="Add"
                labelTw="hidden lg:block"
                isActive
              />,
            ],
          },

          footer: {
            nextPrevBtn: true,
            pagination: true,
          },

          /* ✅ TABLE COLUMNS */
          columns: [
            {
              key: "osa_code",
              label: "Code",
              render: (row: TableDataType) => (
                <span className="font-semibold text-[#181D27] text-[14px]">
                  {row.osa_code}
                </span>
              ),
            },
            {
              key: "spare_name",
              label: "Spare Name",
            },
            {
              key: "plant_name",
              label: "Plant",
            },
            {
              key: "spare_category_name",
              label: "Spare Category",
            },
            {
              key: "spare_subcategory_name",
              label: "Spare Sub Category",
            },
            {
              key: "status",
              label: "Status",
              render: (row: TableDataType) => (
                <StatusBtn isActive={String(row.status) === "1"} />
              ),
            },
          ],

          rowSelection: true,

          rowActions: [
            {
              icon: "lucide:edit-2",
              onClick: (row: TableDataType) => {
                router.push(`/settings/manageAssets/spareMenu/${row.uuid}`);
              },
            },
          ],

          pageSize: 5,
        }}
      />
    </div>
  );
}
