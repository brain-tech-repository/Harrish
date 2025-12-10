"use client";

import KeyValueData from "@/app/components/keyValueData";
import ContainerCard from "@/app/components/containerCard";
import StatusBtn from "@/app/components/statusBtn2";
import { serviceVisitByUUID } from "@/app/services/assetsApi";
import { useLoading } from "@/app/services/loadingContext";
import { useSnackbar } from "@/app/services/snackbarContext";
import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const title = "Service Visit View";
const backBtnUrl = "/assetsManagement/callRegister";

export default function ViewPage() {
    const params = useParams();
    const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid;

    const { showSnackbar } = useSnackbar();
    const { setLoading } = useLoading();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!uuid) return;
            setLoading(true);
            const res = await serviceVisitByUUID(uuid);
            setLoading(false);

            console.log("Service Visit Response:", res);

            if (res.error) {
                showSnackbar(res.data?.message || "Unable to fetch Service Visit", "error");
            } else {
                setData(res.data);
            }
        };
        fetchDetails();
    }, [uuid]);



    return (


        <>
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <Link href={backBtnUrl}>
                    <Icon icon="lucide:arrow-left" width={24} />
                </Link>
                <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            <div className="flex flex-col gap-8">

                {/* ================= SERVICE BASIC DETAILS ================= */}
                <h2 className="text-lg font-semibold">Service Visit Details</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "OSA Code", value: data?.osa_code },
                                { key: "Ticket Type", value: data?.ticket_type },
                                { key: "Ticket Number", value: data?.osa_code },
                                { key: "Time In", value: data?.time_in || "-" },
                                { key: "Time Out", value: data?.time_out || "-" },
                                { key: "Work Status", value: data?.work_status },
                            ]}



                        />
                    </ContainerCard>

                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Technician Name", value: data?.technician?.name },
                                { key: "Technician Code", value: data?.technician?.code },
                                {
                                    key: "Status",
                                    value: "",
                                    component: (
                                        <StatusBtn isActive={data?.work_status === "Closed"} />
                                    )
                                },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= CURRENT CUSTOMER DETAILS ================= */}
                <h2 className="text-lg font-semibold">Current Customer Details</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Outlet Code", value: data?.outlet_code || "-" },
                                { key: "Outlet Name", value: data?.outlet_name || "-" },
                                { key: "Owner Name", value: data?.owner_name || "-" },
                                { key: "Landmark", value: data?.landmark || "-" },
                                { key: "Location", value: data?.location || "-" },
                            ]}
                        />
                    </ContainerCard>

                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Town/Village", value: data?.town_village || "-" },
                                { key: "District", value: data?.district || "-" },
                                { key: "Contact No 1", value: data?.contact_no || "-" },
                                { key: "Contact No 2", value: data?.contact_no2 || "-" },
                                { key: "Contact Person", value: data?.contact_person || "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= FRIDGE DETAILS ================= */}
                <h2 className="text-lg font-semibold">Fridge Details</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Model Number", value: data?.model_no || "-" },
                                { key: "Asset Number", value: data?.asset_no || "-" },
                                { key: "Serial Number", value: data?.serial_no || "-" },
                                { key: "Branding", value: data?.branding || "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= WORK DETAILS ================= */}
                <h2 className="text-lg font-semibold">Work Details</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Complaint Type", value: data?.complaint_type || "-" },
                                { key: "Nature of Call", value: data?.nature_of_call?.name || "-" },
                                { key: "Current Voltage", value: data?.current_voltage || "-" },
                                { key: "Amps", value: data?.amps || "-" },
                                { key: "Cabin Temperature", value: data?.cabin_temperature || "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= WORK DONE DETAILS ================= */}
                <h2 className="text-lg font-semibold">Work Done Details</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Work Done Type", value: data?.work_done_type || "-" },
                                { key: "Spare Part Used", value: data?.spare_part_used || "-" },
                                { key: "Spare Details", value: data?.spare_details || "-" },
                                { key: "Technical Behavior", value: data?.technical_behavior || "-" },
                                { key: "Service Quality", value: data?.service_quality || "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= EQUIPMENT CONDITION ================= */}
                <h2 className="text-lg font-semibold">Equipment Condition</h2>
                <div className="flex flex-wrap gap-5">
                    <ContainerCard className="w-full lg:w-[680px]">
                        <KeyValueData
                            data={[
                                { key: "Machine Working", value: data?.is_machine_in_working || "-" },
                                { key: "Cleanliness", value: data?.cleanliness || "-" },
                                { key: "Condenser Coil Cleaned", value: data?.condensor_coil_cleand || "-" },
                                { key: "Gaskets", value: data?.gaskets || "-" },
                                { key: "Light Working", value: data?.light_working || "-" },
                                { key: "Proper Ventilation", value: data?.propper_ventilation_available || "-" },
                                { key: "Leveling Positioning", value: data?.leveling_positioning || "-" },
                                { key: "Stock Availability %", value: data?.stock_availability_in || "-" },
                            ]}
                        />
                    </ContainerCard>
                </div>

                {/* ================= COMMENTS ================= */}
                {(data?.comment || data?.cts_comment) && (
                    <ContainerCard className="w-full">
                        <h3 className="font-semibold mb-2">Comments</h3>
                        <p><b>Technician:</b> {data?.comment || "-"}</p>
                        <p><b>CTS:</b> {data?.cts_comment || "-"}</p>
                    </ContainerCard>
                )}

            </div>
        </>
    );
}
