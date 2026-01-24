
"use client";
import { iroViewList } from "@/app/services/assetsApi";
import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDate } from "@/app/(private)/(dashboard)/(master)/salesTeam/details/[uuid]/page";
import StatusBtn from "@/app/components/statusBtn2";



const title = "Installation Request Order Details";
const backBtnUrl = "/chillerInstallation/iro"

export default function ViewPage() {
    const params = useParams();
    let id: string = "";
    if (params?.id) {
        if (Array.isArray(params?.id)) {
            id = params?.id[0] || "";
        } else {
            id = params?.id as string;
        }
    }

    // state variables
    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [data, setData] = useState<any>();

    useEffect(() => {
        const fetchTransferDetails = async () => {
            setLoading(true);
            const res = await iroViewList(id);
            setLoading(false);
            if (res.error) {
                showSnackbar(
                    res.data?.message || "Unable to fetch Bulk Transfer Details",
                    "error"
                );
            } else {
                // If response is array, use first item
                if (Array.isArray(res.data)) {
                    setData(res.data[0] || {});
                } else {
                    setData(res.data || {});
                }
            }
        };
        fetchTransferDetails();
    }, [id]);

    return (
        <>
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold mb-1">{title}</h1>
            </div>
          
            <div className="flex flex-wrap gap-x-[30px] gap-y-[30px]">
                <ContainerCard className="w-full">
                    <KeyValueData
                        data={[
                            { value: data?.osa_code || "-", key: "OSA Code" },
                            {
                                value:
                                data?.details && Array.isArray(data.details) && data.details.length > 0
                                        ? `${data.details[0].warehouse_code || "-"} - ${data.details[0].warehouse_name || "-"}`
                                        : "-",
                                        key: "Distributor"
                                    },
                                    { value: data?.created_user?.username || "-", key: "Regional Manager" },
                                    { value: data?.details && Array.isArray(data.details) && data.details[0]?.created_date ? formatDate(data.details[0].created_date) : "-", key: "Created Date" },
                                    { value: <StatusBtn isActive={data?.status || "-"} />, key: "Status" },
                        ]}
                    />
                </ContainerCard>
              

               
            </div>
        </>
    );
}
