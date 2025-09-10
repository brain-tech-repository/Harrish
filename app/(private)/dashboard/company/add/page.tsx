"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import CompanyDetails from "./companyDetails";
import CompanyContactDetails from "./companyContactDetails";

export default function AddCustomer() {

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/company">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Company
                    </h1>
                </div>
            </div>

            <div>
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Company Details</h2>
                    <CompanyDetails />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Contact</h2>
                    <CompanyContactDetails />
                </ContainerCard>
            </div>
        </>
    );
}
