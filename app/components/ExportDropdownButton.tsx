import React from "react";
import CustomDropdown from "./customDropdown";
import BorderIconButton from "./borderIconButton";

export interface ExportDropdownButtonProps {
    threeDotLoading: { csv: boolean; xlsx: boolean };
    exportReturnFile: (uuid: string, format: string) => void;
    uuid: string;
    className?: string;
}

export default function ExportDropdownButton({
    threeDotLoading,
    exportReturnFile,
    uuid,
    className = ""
}: ExportDropdownButtonProps) {
    const [showDropdown, setShowDropdown] = React.useState(false);
    return (
        <div className={`relative ${className}`}>
            <BorderIconButton icon="ic:sharp-more-vert" onClick={() => setShowDropdown((prev) => !prev)} />
            {/* <Icon icon="ic:sharp-more-vert" width={24} /> */}
            {/* </button> */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 z-50">
                    <CustomDropdown
                        data={[
                            {
                                icon: threeDotLoading.csv ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export CSV",
                                iconWidth: 20,
                                onClick: () => {
                                    setShowDropdown(false);
                                    if (!threeDotLoading.csv) exportReturnFile(uuid, "csv");
                                },
                            },
                            {
                                icon: threeDotLoading.xlsx ? "eos-icons:three-dots-loading" : "gala:file-document",
                                label: "Export Excel",
                                iconWidth: 20,
                                onClick: () => {
                                    setShowDropdown(false);
                                    if (!threeDotLoading.xlsx) exportReturnFile(uuid, "xlsx");
                                },
                            },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
