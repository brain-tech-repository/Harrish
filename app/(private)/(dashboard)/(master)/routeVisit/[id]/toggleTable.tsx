"use client";
import { Icon } from "@iconify-icon/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Toggle from "@/app/components/toggle";
import Loading from "@/app/components/Loading";
import Skeleton from "@mui/material/Skeleton";
import CustomCheckbox from "@/app/components/customCheckbox";

// Add your API function import
import { getRouteVisitDetails } from "@/app/services/allApi";

const TableRowSkeleton = () => (
  <tr className="border-b-[1px] border-[#E9EAEB]">
    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-[#E9EAEB]">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={150} height={20} />
      </div>
    </td>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3 border-l border-[#E9EAEB]">
        <div className="flex justify-center">
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      </td>
    ))}
  </tr>
);

// Types for customer schedule
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

type TableProps = {
  customers: any[];
  setCustomerSchedules: any;
  initialSchedules?: CustomerSchedule[];
  loading?: boolean;
  editMode?: boolean;
  visitUuid?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  onGlobalChange?: (days: string[]) => void;
};

export default function Table({
  customers,
  setCustomerSchedules,
  initialSchedules = [],
  loading = false,
  editMode = false,
  visitUuid = "",
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
  onGlobalChange,
}: TableProps) {

  const transformCustomerList = (apiResponse: any[]) => {
    return apiResponse.map((item) => ({
      id: item.id,
      name: `${item.osa_code} - ${item.name.toUpperCase()}`,
    }));
  };
  const data = transformCustomerList(customers);
  const isInitialMount = useRef(true);
  const [internalLoading, setInternalLoading] = useState(false);
  const hasFetchedData = useRef(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Observer triggered - loading more...");
          onLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.0,
        rootMargin: '300px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  // ✅ Track pre-filled customer IDs from API
  const [prefilledCustomerIds, setPrefilledCustomerIds] = useState<Set<number>>(
    new Set()
  );

  const [rowStates, setRowStates] = useState<
    Record<
      number,
      {
        Monday: boolean;
        Tuesday: boolean;
        Wednesday: boolean;
        Thursday: boolean;
        Friday: boolean;
        Saturday: boolean;
        Sunday: boolean;
      }
    >
  >({});

  const [columnSelection, setColumnSelection] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });

  // ✅ Filtered data - only show customers that are in both current customer_type AND pre-filled data
  // Added bypass for dummy data (IDs >= 5000) to allow testing infinite scroll in edit mode
  const filteredData = data.filter(
    (customer) => !editMode || prefilledCustomerIds.has(customer.id) || customer.id >= 5000
  );
  console.log(filteredData, "filteredData")

  // ✅ Load visit data for editing - UPDATED FOR ARRAY RESPONSE
  const loadVisitData = useCallback(async (uuid: string) => {
    if (!uuid || hasFetchedData.current) {
      console.log("Skipping data fetch - no UUID or already fetched");
      return;
    }

    setInternalLoading(true);
    try {
      console.log("Fetching visit data for UUID:", uuid);
      const res = await getRouteVisitDetails(uuid);
      console.log("API Response for edit:", res);

      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const list = res.data;
        const initialRowStates: typeof rowStates = {};
        const prefilledIds = new Set<number>();

        list.forEach((item: any) => {
          if (item.customer && item.customer.id) {
            const days = item.days || [];
            const daysMap = {
              Monday: days.includes("Monday"),
              Tuesday: days.includes("Tuesday"),
              Wednesday: days.includes("Wednesday"),
              Thursday: days.includes("Thursday"),
              Friday: days.includes("Friday"),
              Saturday: days.includes("Saturday"),
              Sunday: days.includes("Sunday"),
            };

            initialRowStates[item.customer.id] = daysMap;
            prefilledIds.add(item.customer.id);
          }
        });

        setRowStates(initialRowStates);
        setPrefilledCustomerIds(prefilledIds);
        hasFetchedData.current = true;
        console.log("Table initialized with schedules:", initialRowStates);
        console.log("Prefilled customer IDs:", Array.from(prefilledIds));
      } else {
        console.warn("Route visit not found in API response or empty");
      }
    } catch (error) {
      console.error("Error loading visit data:", error);
      hasFetchedData.current = false;
    } finally {
      setInternalLoading(false);
    }
  }, []);

  // Initialize row states - FIXED VERSION
  useEffect(() => {
    console.log("Initialization effect running:", {
      editMode,
      visitUuid,
      initialSchedulesLength: initialSchedules.length,
      isInitialMount: isInitialMount.current,
      hasFetchedData: hasFetchedData.current,
    });

    if (editMode && visitUuid && !hasFetchedData.current) {
      console.log("Table in edit mode, fetching data for UUID:", visitUuid);
      loadVisitData(visitUuid);
    } else if (
      initialSchedules.length > 0 &&
      isInitialMount.current &&
      !editMode
    ) {
      console.log("Using initialSchedules:", initialSchedules);
      const initialRowStates: typeof rowStates = {};
      const prefilledIds = new Set<number>();

      initialSchedules.forEach((schedule) => {
        const daysMap = {
          Monday: schedule.days.includes("Monday"),
          Tuesday: schedule.days.includes("Tuesday"),
          Wednesday: schedule.days.includes("Wednesday"),
          Thursday: schedule.days.includes("Thursday"),
          Friday: schedule.days.includes("Friday"),
          Saturday: schedule.days.includes("Saturday"),
          Sunday: schedule.days.includes("Sunday"),
        };

        initialRowStates[schedule.customer_id] = daysMap;
        prefilledIds.add(schedule.customer_id);
      });

      setRowStates(initialRowStates);
      setPrefilledCustomerIds(prefilledIds);
      console.log("Initialized with initialSchedules:", initialRowStates);
      console.log("Prefilled customer IDs:", Array.from(prefilledIds));
    }

    isInitialMount.current = false;
  }, [initialSchedules, editMode, visitUuid, loadVisitData]);

  // Update parent when rowStates change - DEBOUNCED VERSION
  useEffect(() => {
    if (Object.keys(rowStates).length > 0) {
      console.log("Row states updated, notifying parent:", rowStates);
      setCustomerSchedules(rowStates);
    }
  }, [rowStates, setCustomerSchedules]);

  // Reset row states when customers change - ONLY in create mode
  const previousCustomersLength = useRef(customers.length);
  const previousFirstCustomerId = useRef<number | null>(null);

  useEffect(() => {
    // Also apply global selections to NEW customers if any column is selected
    if (filteredData.length > 0) {
      setRowStates(prev => {
        const next = { ...prev };
        let hasChanges = false;
        filteredData.forEach(c => {
          if (!next[c.id]) {
            // Initialize with global selections
            next[c.id] = { ...columnSelection };
            hasChanges = true;
          } else {
            // Optionally enforce global selection on existing? 
            // For now, let's only apply to new/missing ones to respect individual toggles, 
            // UNLESS we want "Select All" to strictly enforce. 
            // But the requirement is "apply for all customers automatically when i click on next page"
            // So if columnSelection is true, we should probably ensure it's true?
            // But that might overwrite user deselects. 
            // Let's assume: If I have column selected, any NEW row gets it.
            // Existing rows: handled by handleColumnSelect.

            // Ensure consistency for keys that are globally true? 
            // "apply for all customers automatically" -> likely means enforcement.
            let rowChanged = false;
            const rowState = { ...next[c.id] };
            Object.entries(columnSelection).forEach(([day, isSelected]) => {
              if (isSelected && !rowState[day as keyof typeof columnSelection]) {
                rowState[day as keyof typeof columnSelection] = true;
                rowChanged = true;
              }
            });
            if (rowChanged) {
              next[c.id] = rowState;
              hasChanges = true;
            }
          }
        });
        return hasChanges ? next : prev;
      });
    }

    if (!editMode) {
      const currLength = customers.length;
      const firstId = customers.length > 0 ? customers[0].id : null;

      const isFreshFetch = currLength > 0 && (
        (previousFirstCustomerId.current !== null && firstId !== previousFirstCustomerId.current) ||
        (currLength < previousCustomersLength.current)
      );

      if (isFreshFetch) {
        console.log("Fresh customer list detected, resetting table states");
        // Don't fully reset if we want to keep global selections?
        // But "Fresh Fetch" implies new route/filter, so maybe we SHOULD reset.
        setRowStates({});
        setPrefilledCustomerIds(new Set());
        setColumnSelection({
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        });
        if (onGlobalChange) onGlobalChange([]);
      }
      previousCustomersLength.current = currLength;
      previousFirstCustomerId.current = firstId;
    }
  }, [customers, editMode, columnSelection]); // Added columnSelection dependency to re-apply if needed

  // Handle individual toggle
  const handleToggle = (
    rowId: number,
    field: keyof (typeof rowStates)[number]
  ) => {
    setRowStates((prev) => {
      const current = prev[rowId] || {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const newState = {
        ...prev,
        [rowId]: {
          ...current,
          [field]: !current[field],
        },
      };

      console.log(`Toggled ${field} for customer ${rowId}:`, newState[rowId]);
      return newState;
    });
  };

  // Handle column selection - UPDATED to use filteredData
  const handleColumnSelect = (day: keyof typeof columnSelection) => {
    const newColumnState = !columnSelection[day];

    console.log(`Column ${day} selection:`, newColumnState);

    const newColumnSelection = {
      ...columnSelection,
      [day]: newColumnState,
    };
    setColumnSelection(newColumnSelection);

    // Notify parent of global selection change
    if (onGlobalChange) {
      const selectedDays = Object.entries(newColumnSelection)
        .filter(([_, isSelected]) => isSelected)
        .map(([d]) => d);
      onGlobalChange(selectedDays);
    }

    setRowStates((prev) => {
      const updatedStates = { ...prev };

      // ✅ Use filteredData instead of data
      filteredData.forEach((customer) => {
        const currentState = updatedStates[customer.id] || {
          Monday: false,
          Tuesday: false,
          Wednesday: false,
          Thursday: false,
          Friday: false,
          Saturday: false,
          Sunday: false,
        };

        updatedStates[customer.id] = {
          ...currentState,
          [day]: newColumnState,
        };
      });

      console.log(`Updated all rows for column ${day}:`, updatedStates);
      return updatedStates;
    });
  };

  // Handle row selection
  const handleRowSelect = (rowId: number) => {
    setRowStates((prev) => {
      const current = prev[rowId] || {
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
      };

      const allSelected = Object.values(current).every(Boolean);

      const newState = {
        ...prev,
        [rowId]: {
          Monday: !allSelected,
          Tuesday: !allSelected,
          Wednesday: !allSelected,
          Thursday: !allSelected,
          Friday: !allSelected,
          Saturday: !allSelected,
          Sunday: !allSelected,
        },
      };

      console.log(`Row ${rowId} selection:`, newState[rowId]);
      return newState;
    });
  };

  // Check if all toggles in a column are selected - UPDATED to use filteredData
  const isColumnFullySelected = (day: keyof typeof columnSelection) => {
    // If global selection is on, show check
    return columnSelection[day];
  };

  // Check if some toggles in a column are selected - UPDATED to use filteredData
  const isColumnPartiallySelected = (day: keyof typeof columnSelection) => {
    // Simplify: Just return false if fully selected is true, to avoid indeterminate state conflicting with "Select All"
    // Or check if some rows disagree with global?
    // User wants "Select All" checkbox.
    return false;
  };

  // Check if all toggles in a row are selected
  const isRowFullySelected = (rowId: number) => {
    const customerState = rowStates[rowId];
    if (!customerState) return false;

    return Object.values(customerState).every(Boolean);
  };

  // Check if some toggles in a row are selected (for indeterminate state)
  const isRowPartiallySelected = (rowId: number) => {
    const customerState = rowStates[rowId];
    if (!customerState) return false;

    const hasTrue = Object.values(customerState).some(Boolean);
    const hasFalse = Object.values(customerState).some((value) => !value);

    return hasTrue && hasFalse;
  };

  // Show loading when customers are being fetched or internal loading
  // if (loading || internalLoading) {
  //   return (
  //     <div className="w-full flex flex-col overflow-hidden">
  //       <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
  //         <div className="flex items-center justify-center py-12">
  //           <Loading />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300"
        >
          <table className="w-full min-w-max border-collapse">
            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-30">
              <tr className="border-b-[1px] border-[#E9EAEB]">
                <th className="px-4 py-3 font-[500] text-left min-w-[220px] sticky left-0 bg-[#FAFAFA] z-10 border-r border-[#E9EAEB]">
                  <div className="flex items-center gap-2">
                    <span>Customer List</span>
                  </div>
                </th>

                {Object.keys(columnSelection).map((day) => {
                  const dayKey = day as keyof typeof columnSelection;
                  // Use local state for immediate feedback
                  const isChecked = columnSelection[dayKey];

                  return (
                    <th
                      key={day}
                      className="px-4 py-3 font-[500] text-center min-w-[120px] border-l border-[#E9EAEB]"
                    >
                      <div className="flex flex-row items-center justify-center gap-2">
                        <span className="text-xs">{day}</span>
                        <div className="flex items-center">
                            <CustomCheckbox
                              id={`header-checkbox-${day}`}
                              label=""
                              checked={isChecked}
                              onChange={() => handleColumnSelect(dayKey)}
                            />
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="text-[14px] bg-white text-[#535862]">
              {(loading || internalLoading) ? (
                Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={`init-${i}`} />)
              ) : (
                <>
                  {filteredData.map((row) => {
                    const state = rowStates[row.id] || {
                      Monday: false,
                      Tuesday: false,
                      Wednesday: false,
                      Thursday: false,
                      Friday: false,
                      Saturday: false,
                      Sunday: false,
                    };

                    const isRowSelected = isRowFullySelected(row.id);

                    return (
                      <tr
                        className="border-b-[1px] border-[#E9EAEB] hover:bg-gray-50"
                        key={row.id}
                      >
                        <td className="px-4 py-3 text-left font-[500] sticky left-0 bg-white z-10 border-r border-[#E9EAEB] min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <Toggle
                              isChecked={isRowSelected}
                              onChange={() => handleRowSelect(row.id)}
                            />
                            <span
                              className="truncate max-w-[100%]"
                              title={row.name}
                            >
                              {row.name}
                            </span>
                          </div>
                        </td>

                        {Object.entries(state).map(([day, isChecked]) => (
                          <td
                            key={day}
                            className="px-4 py-3 text-center border-l border-[#E9EAEB] min-w-[120px]"
                          >
                            <div className="flex justify-center">
                              <Toggle
                                isChecked={isChecked}
                                onChange={() =>
                                  handleToggle(
                                    row.id,
                                    day as keyof (typeof rowStates)[number]
                                  )
                                }
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {isLoadingMore && (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={`more-${i}`} />)
                  )}
                </>
              )}
            </tbody>
          </table>

          {/* Infinite Scroll Observer */}
          {hasMore && (
            <div ref={observerRef} className="w-full flex justify-center py-2">
              <div className="h-1" />
            </div>
          )}
        </div>

        {!loading && !internalLoading && filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {editMode ? (
              <div>
                <p>No matching customers found for edit</p>
                <p className="text-sm text-gray-400 mt-2">
                  The pre-filled customer is not available in the current
                  customer type selection.
                </p>
              </div>
            ) : (
              "No customers found"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
