"use client";

import { Icon } from "@iconify-icon/react";
import Logo from "../../components/logo";

export default function Sidebar() {
    return (
        <div className="group peer">
            <div className="w-[80px] group-hover:w-[250px] h-[100vh] fixed ease-in-out duration-300 bg-white">
                <div className="w-full h-[60px] px-[16px] py-[12px] border-r-[1px] border-b-[1px] border-[#E9EAEB]">
                    <div className="w-[24px] group-hover:w-full h-full m-auto">
                        <Logo width={128} height={35} twClass="object-cover h-full object-[0%_center]" />
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
                                <li className="p-2 h-10 bg-[#EA0A2A] rounded-lg px-3 py-2 text-white flex items-center gap-3">
                                    <Icon icon="hugeicons:home-01" width={24} />
                                    <span className="hidden group-hover:block">
                                        Dashboard
                                    </span>
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3">
                                    <Icon icon="lucide:user" width={24} />
                                    <span className="hidden group-hover:block">
                                        Customer
                                    </span>
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3">
                                    <Icon
                                        icon="hugeicons:truck-delivery"
                                        width={24}
                                    />
                                    <span className="hidden group-hover:block">
                                        Landmark
                                    </span>
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3">
                                    <Icon
                                        icon="lucide:inbox"
                                        width={24}
                                    />
                                    <span className="hidden group-hover:block">
                                        Items
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* sidebar CRM */}
                        <div>
                            <div className="text-[#717680] text-[14px] mb-3 hidden group-hover:block">
                                CRM
                            </div>
                            <ul className="w-full flex flex-col gap-[6px]">
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            icon="hugeicons:workflow-square-06"
                                            width={24}
                                        />
                                        <span className="hidden group-hover:block">
                                            Masters
                                        </span>
                                    </div>
                                    <Icon
                                        icon="mdi-light:chevron-right"
                                        width={18}
                                        className="hidden group-hover:block"
                                    />
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            icon="tabler:file-text"
                                            width={24}
                                        />
                                        <span className="hidden group-hover:block">
                                            Report
                                        </span>
                                    </div>
                                    <Icon
                                        icon="mdi-light:chevron-right"
                                        width={18}
                                        className="hidden group-hover:block"
                                    />
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            icon="mingcute:bill-line"
                                            width={24}
                                        />
                                        <span className="hidden group-hover:block">
                                            Agent Transaction
                                        </span>
                                    </div>
                                </li>
                                <li className="p-2 h-10 rounded-lg px-3 py-2 text-[#414651] flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            icon="hugeicons:transaction"
                                            width={24}
                                        />
                                        <span className="hidden group-hover:block">
                                            Hariss Transaction
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
