import SearchBar from "./searchBar";
import CustomDropdown from "./customDropdown";

export default function FilterDropdown({ searchBarValue, setSearchBarValue, onEnterPress, children }: { searchBarValue: string; setSearchBarValue: React.Dispatch<React.SetStateAction<string>>; onEnterPress: () => void; children?: React.ReactNode }) {

    return (
        <div className="min-w-[200px] w-fit min-h-[300px] h-fit fixed -translate-x-[200px] translate-y-[10px] z-50 overflow-auto">
            <CustomDropdown>
                <div className="p-[10px] pb-[6px]">
                    <SearchBar value={searchBarValue} onChange={(e) => setSearchBarValue(e.target.value)} onEnterPress={onEnterPress} placeholder="Search here..." />
                </div>
                <div>
                    {children}
                </div>
            </CustomDropdown>
        </div>
    );
}
