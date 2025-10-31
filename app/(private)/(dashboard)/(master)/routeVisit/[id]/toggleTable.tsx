"use client";
import { Icon } from "@iconify-icon/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Toggle from "@/app/components/toggle";

const transformCustomerList = (apiResponse: any[]) => {
  return apiResponse.map((item) => ({
    id: item.id,
    name: `${item.owner_name} - ${item.osa_code}`,
  }));
};

// Types for customer schedule
type CustomerSchedule = {
  customer_id: number;
  days: string[];
};

type TableProps = {
  customers: any[];
  setCustomerSchedules: any;
  initialSchedules?: CustomerSchedule[];
};

export default function Table({
  customers,
  setCustomerSchedules,
  initialSchedules = [],
}: TableProps) {
  const data = transformCustomerList(customers);
  const isInitialMount = useRef(true);

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

  // Initialize row states from initialSchedules - DON'T notify parent
  useEffect(() => {
    if (initialSchedules.length > 0 && isInitialMount.current) {
      const initialRowStates: typeof rowStates = {};

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
      });

      setRowStates(initialRowStates);
      isInitialMount.current = false;
    }
  }, [initialSchedules]);

  useEffect(() => {
    console.log(data);
    setCustomerSchedules(rowStates);
  }, [rowStates]);

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

      return {
        ...prev,
        [rowId]: {
          ...current,
          [field]: !current[field],
        },
      };
    });
  };

  // Handle column selection
  const handleColumnSelect = (day: keyof typeof columnSelection) => {
    const newColumnState = !columnSelection[day];

    // Update column selection state
    setColumnSelection((prev) => ({
      ...prev,
      [day]: newColumnState,
    }));

    // Update all rows for this column
    setRowStates((prev) => {
      const updatedStates = { ...prev };

      data.forEach((customer) => {
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

      // Check if all days in this row are currently selected
      const allSelected = Object.values(current).every(Boolean);

      return {
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
    });
  };

  // Check if all toggles in a column are selected
  const isColumnFullySelected = (day: keyof typeof columnSelection) => {
    if (data.length === 0) return false;

    return data.every((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === true;
    });
  };

  // Check if some toggles in a column are selected (for indeterminate state)
  const isColumnPartiallySelected = (day: keyof typeof columnSelection) => {
    if (data.length === 0) return false;

    const hasTrue = data.some((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === true;
    });

    const hasFalse = data.some((customer) => {
      const customerState = rowStates[customer.id];
      return customerState?.[day] === false;
    });

    return hasTrue && hasFalse;
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

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <div className="rounded-lg border border-[#E9EAEB] overflow-hidden">
        {/* Responsive container with horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="text-[12px] bg-[#FAFAFA] text-[#535862] sticky top-0 z-20">
              <tr className="border-b-[1px] border-[#E9EAEB]">
                {/* Customer List column with select all toggle */}
                <th className="px-4 py-3 font-[500] text-left min-w-[220px] sticky left-0 bg-[#FAFAFA] z-10 border-r border-[#E9EAEB]">
                  <div className="flex items-center gap-2">
                    <span>Customer List</span>
                  </div>
                </th>

                {/* Days columns with toggles on the left */}
                {Object.keys(columnSelection).map((day) => {
                  const dayKey = day as keyof typeof columnSelection;
                  const isFullySelected = isColumnFullySelected(dayKey);
                  const isPartiallySelected = isColumnPartiallySelected(dayKey);

                  return (
                    <th
                      key={day}
                      className="px-4 py-3 font-[500] text-center min-w-[120px] border-l border-[#E9EAEB]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {/* Toggle for column selection - on the left */}
                        <div className="flex items-center">
                          <Toggle
                            isChecked={isFullySelected}
                            onChange={() => handleColumnSelect(dayKey)}
                          />
                        </div>
                        {/* Day name */}
                        <span className="text-xs">{day}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="text-[14px] bg-white text-[#535862]">
              {data.map((row) => {
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
                const isRowPartial = isRowPartiallySelected(row.id);

                return (
                  <tr
                    className="border-b-[1px] border-[#E9EAEB] hover:bg-gray-50"
                    key={row.id}
                  >
                    {/* Customer name with row selection toggle */}
                    <td className="px-4 py-3 text-left font-[500] sticky left-0 bg-white z-10 border-r border-[#E9EAEB] min-w-[220px]">
                      <div className="flex items-center gap-3">
                        {/* Row selection toggle */}
                        <Toggle
                          isChecked={isRowSelected}
                          onChange={() => handleRowSelect(row.id)}
                        />
                        <span
                          className="truncate max-w-[160px]"
                          title={row.name}
                        >
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* Days columns */}
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
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
