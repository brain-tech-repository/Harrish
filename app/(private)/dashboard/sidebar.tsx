"use client";

import Logo from "../../components/logo";
import SidebarBtn from "@/app/components/dashboardSidebarBtn";

export default function Sidebar() {
    return (
        <div className="group peer">
            <div className="w-[80px] group-hover:w-[250px] h-[100vh] fixed ease-in-out duration-300 bg-white">
                <div className="w-full h-[60px] px-[16px] py-[12px] border-r-[1px] border-b-[1px] border-[#E9EAEB]">
                    <div className="w-[24px] group-hover:w-full h-full m-auto">
                        <Logo
                            width={128}
                            height={35}
                            twClass="object-cover h-full object-[0%_center]"
                        />
                    </div>
                </div>
                <div className="w-full h-[900px] py-5 px-4 border-[1px] border-[#E9EAEB] border-t-0">
                    {/* siderbar main menu */}
                    <div className="mb-5 w-full h-full">
                        <div className=" group-hover:mb-[20px]">
                            <div className="text-[#717680] text-[14px] mb-3 hidden group-hover:block">
                                Main Menu
                            </div>
                            <ul className="w-full flex flex-col gap-[6px]">
                                <SidebarBtn
                                    isActive={true}
                                    href="/dashboard"
                                    label="Dashboard"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="hugeicons:home-01"
                                />

                                <SidebarBtn
                                    href="/dashboard/customer"
                                    label="Customer"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="lucide:user"
                                />

                                <SidebarBtn
                                    href="/dashboard/landmark"
                                    label="Landmark"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="hugeicons:truck-delivery"
                                />

                                <SidebarBtn
                                    href="/dashboard/inbox"
                                    label="Items"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="lucide:inbox"
                                />
                            </ul>
                        </div>

                        {/* sidebar CRM */}
                        <div>
                            <div className="text-[#717680] text-[14px] mb-3 hidden group-hover:block">
                                CRM
                            </div>
                            <ul className="w-full flex flex-col gap-[6px]">
                                <SidebarBtn
                                    href="/dashboard/masters"
                                    label="Masters"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="hugeicons:workflow-square-06"
                                    trailingIcon="mdi-light:chevron-right"
                                    trailingIconTw="hidden group-hover:block"
                                />

                                <SidebarBtn
                                    href="/dashboard/report"
                                    label="Report"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="tabler:file-text"
                                    trailingIcon="mdi-light:chevron-right"
                                    trailingIconTw="hidden group-hover:block"
                                />

                                <SidebarBtn
                                    href="/dashboard/agentTransaction"
                                    label="Agent Transaction"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="mingcute:bill-line"
                                />

                                <SidebarBtn
                                    href="/dashboard/harissTransaction"
                                    label="Hariss Transaction"
                                    labelTw="hidden group-hover:block"
                                    leadingIcon="hugeicons:transaction"
                                />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
