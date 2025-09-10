"use client";

import { Icon } from "@iconify-icon/react";
import Link from "next/link";
import ContainerCard from "@/app/components/containerCard";
import CustomerDetailsForm from "./customerDetailsForm";
import CustomerContactDetails from "./customerContactDetails";
import CustomerLocationInformation from "./customerLocationInformation";
import CustomerFinancialInformation from "./customerFinancialInformation";
import CustomerTransactionPromotion from "./customerTransactionPromotion";
import CustomerAdditionalInformation from "./customerAdditionalInformation";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";
export default function AddCustomer() {

    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-[20px]">
                <div className="flex items-center gap-[16px]">
                    <Link href="/dashboard/customer">
                        <Icon icon="lucide:arrow-left" width={24} />
                    </Link>
                    <h1 className="text-[20px] font-semibold text-[#181D27] flex items-center leading-[30px] mb-[5px]">
                        Add New Customer
                    </h1>
                </div>
            </div>

            {/* content */}
            <div>
                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Customer Details</h2>
                    <CustomerDetailsForm />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Contact</h2>
                    <CustomerContactDetails />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Location Information</h2>
                    <CustomerLocationInformation />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Financial Information </h2>
                    <CustomerFinancialInformation />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Transaction Promotion</h2>
                    <CustomerTransactionPromotion />
                </ContainerCard>

                <ContainerCard>
                    <h2 className="text-lg font-semibold mb-6">Additional Information</h2>
                    <CustomerAdditionalInformation />
                </ContainerCard>

                <div className="flex justify-end gap-3 mt-6">
                    {/* Cancel button */}
                    <button
                        className="px-6 py-2 h-[40px] w-[80px] rounded-md font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
                        type="button"
                    >
                        Cancel
                    </button>

                    {/* Submit button with icon */}
                    <SidebarBtn
                        label="Submit"
                        isActive={true}
                        leadingIcon="mdi:check"   // checkmark icon
                        onClick={() => console.log("Form submitted ✅")}
                    />
                </div>


            </div>
        </>
    );
}
