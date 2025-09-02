"use client";

import { useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar";
import TopBar from "./topBar";

const DashboardPage = () => {

    const [horizontalSidebar, setHorizontalSidebar] = useState(
        localStorage.getItem("horizontalSidebar") === "true"
    );

    const toggleSidebar = () => {
        localStorage.setItem(
            "horizontalSidebar",
            (!horizontalSidebar).toString()
        );
        setHorizontalSidebar(!horizontalSidebar);
    };

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-scroll bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar />}
            <TopBar horizontalSidebar={horizontalSidebar} toggleSidebar={toggleSidebar} />
            <Main />
        </div>
    );
};

export default DashboardPage;
