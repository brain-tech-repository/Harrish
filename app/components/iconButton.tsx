import { Icon } from "@iconify-icon/react";

export default function IconButton({ icon, notification, width, onClick }: { icon: string; notification?: boolean; width?: number; onClick?: () => void }) {
    return (
        <>
            <span className="relative w-[32px] h-[32px] p-[7px] bg-[#F5F5F5] rounded-[8px] text-[#252B37] flex justify-center items-center cursor-pointer" onClick={onClick}>
                <Icon icon={icon} width={width || 18} />
                {notification && <span className="absolute -top-[1px] -right-[1px] w-[7px] h-[7px] bg-[#EA0A2A] rounded-full"></span>}
            </span>
        </>
    );
}
