"use client";

import { useEffect, useState } from "react";
import Main from "./main";
import Sidebar from "./sidebar";
import TopBar from "./topBar";

const DashboardLayout = ({children}: {children: React.ReactNode}) => {

    const [horizontalSidebar, setHorizontalSidebar] = useState<boolean>(
       true
    );

    const toggleSidebar = () => {
        localStorage?.setItem(
            "horizontalSidebar",
            (!horizontalSidebar).toString()
        );
        setHorizontalSidebar(!horizontalSidebar);
    };


    useEffect(()=>{
      setHorizontalSidebar( localStorage?.getItem("horizontalSidebar") === 'true')
    },[])

    return (
        <div className="h-[100vh] w-[100%] m-auto overflow-scroll bg-[#FAFAFA]">
            {!horizontalSidebar && <Sidebar />}
            <TopBar horizontalSidebar={horizontalSidebar} toggleSidebar={toggleSidebar} />
            <Main horizontalSidebar={horizontalSidebar}>
                {children}
            </Main>
        </div>
    );
};

export default DashboardLayout;
