// "use client";

// import React, { useState } from "react";
// import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

// const initialFieldData = {
//   Company: Array.from({ length: 140 }, (_, i) => `Company Data ${i + 1}`),
//   Region: Array.from({ length: 20 }, (_, i) => `Region Data ${i + 1}`),
//   Area: Array.from({ length: 120 }, (_, i) => `Area Data ${i + 1}`),
//   Warehouse: Array.from({ length: 75 }, (_, i) => `Warehouse Data ${i + 1}`),
//   Salesman: Array.from({ length: 90 }, (_, i) => `Salesman Data ${i + 1}`),
//   Route: Array.from({ length: 130 }, (_, i) => `Route Data ${i + 1}`),
//   "Item Category": Array.from({ length: 200 }, (_, i) => `Item Category Data ${i + 1}`),
//   Item: Array.from({ length: 300 }, (_, i) => `Item Data ${i + 1}`),
//   "Customer Category": Array.from({ length: 220 }, (_, i) => `Customer Category Data ${i + 1}`),
//   "Customer Channel": Array.from({ length: 185 }, (_, i) => `Customer Channel Data ${i + 1}`),
//   Customer: Array.from({ length: 260 }, (_, i) => `Customer Data ${i + 1}`),
//   Amount: Array.from({ length: 50 }, (_, i) => `Amount Data ${i + 1}`),
//   Quantity: Array.from({ length: 50 }, (_, i) => `Quantity Data ${i + 1}`),
// };

// type FieldId = keyof typeof initialFieldData;

// const mainFields: FieldId[] = ["Company", "Region", "Area", "Warehouse"];
// const searchTypeFields: FieldId[] = ["Amount", "Quantity"];
// const searchByFields: FieldId[] = ["Salesman", "Route"];
// const otherFields: FieldId[] = [
//   "Item Category", "Item", "Customer Category", "Customer Channel", "Customer",
// ];

// export default function DragDropReport() {
//   const [fieldData] = useState(initialFieldData);
//   const [selectedFields, setSelectedFields] = useState<FieldId[]>([]);
//   const [expandedSelected, setExpandedSelected] = useState<FieldId[]>([]);
//   const [pageState, setPageState] = useState<{ [key in FieldId]?: number }>({});
//   const [chosenItems, setChosenItems] = useState<Record<FieldId, string[]>>({});
//   const [choosingField, setChoosingField] = useState<FieldId | null>(null);
//   const [workingSelection, setWorkingSelection] = useState<Set<string>>(new Set());
//   const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "", isActive: false });
//   const [showSearchBy, setShowSearchBy] = useState(false);
//   const [showSearchType, setShowSearchType] = useState(false);

//   const filteredFieldData = React.useMemo(() => {
//     if (!dateFilter.isActive || !dateFilter.startDate || !dateFilter.endDate) {
//       return fieldData;
//     }

//     const filteredData: Record<FieldId, string[]> = { ...fieldData };
    
//     Object.keys(fieldData).forEach((field) => {
//       const fieldId = field as FieldId;
//       const originalData = fieldData[fieldId];
      
//       const startDateNum = new Date(dateFilter.startDate).getTime();
//       const endDateNum = new Date(dateFilter.endDate).getTime();
      
//       filteredData[fieldId] = originalData.filter((item, index) => {
//         const simulatedDate = new Date(2024, 0, 1 + index).getTime();
//         return simulatedDate >= startDateNum && simulatedDate <= endDateNum;
//       });
//     });

//     return filteredData;
//   }, [fieldData, dateFilter]);

//   const handleDragEnd = (result: DropResult) => {
//     const { source, destination, draggableId } = result;
//     if (!destination) return;

//     const id = draggableId as FieldId;

//     if (source.droppableId === "fields" && destination.droppableId === "selected") {
//       if (!selectedFields.includes(id)) {
//         const defaultSelections = filteredFieldData[id].slice(0, 3);
        
//         setSelectedFields(prev => {
//           const copy = [...prev];
//           copy.splice(destination.index, 0, id);
//           return copy;
//         });

//         setExpandedSelected(prev => prev.includes(id) ? prev : [...prev, id]);
//         setPageState(prev => ({ ...prev, [id]: 1 }));
//         setChosenItems(prev => ({ ...prev, [id]: defaultSelections }));
//       }
//       return;
//     }

//     if (source.droppableId === "selected" && destination.droppableId === "selected") {
//       setSelectedFields(prev => {
//         const copy = [...prev];
//         const [removed] = copy.splice(source.index, 1);
//         copy.splice(destination.index, 0, removed);
//         return copy;
//       });
//       return;
//     }

//     if (source.droppableId === "selected" && destination.droppableId === "fields") {
//       setSelectedFields(prev => prev.filter(p => p !== id));
//       setExpandedSelected(prev => prev.filter(p => p !== id));
//       setPageState(prev => ({ ...prev, [id]: 1 }));
//       return;
//     }
//   };

//   const openChooser = (field: FieldId) => {
//     setChoosingField(field);
//     setWorkingSelection(new Set(chosenItems[field] ?? []));
//   };

//   const saveChooser = () => {
//     if (!choosingField) return;
//     setChosenItems(prev => ({ ...prev, [choosingField]: Array.from(workingSelection) }));
//     setChoosingField(null);
//     setWorkingSelection(new Set());
//   };

//   const closeChooser = () => {
//     setChoosingField(null);
//     setWorkingSelection(new Set());
//   };

//   const toggleWorking = (value: string) => {
//     setWorkingSelection(prev => {
//       const copy = new Set(prev);
//       if (copy.has(value)) copy.delete(value);
//       else copy.add(value);
//       return copy;
//     });
//   };

//   const handleReset = (field: FieldId) => {
//     setChosenItems(prev => ({ ...prev, [field]: [] }));
//   };

//   const handleRemoveField = (field: FieldId) => {
//     setSelectedFields(prev => prev.filter(f => f !== field));
//     setExpandedSelected(prev => prev.filter(f => f !== field));
//   };

//   const handleCancel = () => {
//     setSelectedFields([]);
//     setExpandedSelected([]);
//     setPageState({});
//     setChosenItems({});
//     setDateFilter({ startDate: "", endDate: "", isActive: false });
//   };

//   const handleDateFilterApply = () => {
//     if (dateFilter.startDate && dateFilter.endDate) {
//       setDateFilter(prev => ({ ...prev, isActive: true }));
//     }
//   };

//   const handleDateFilterClear = () => {
//     setDateFilter({ startDate: "", endDate: "", isActive: false });
//   };

//   const chosenSummary = (field: FieldId) => {
//     const arr = chosenItems[field] ?? [];
//     if (arr.length === 0) return "No selection";
//     if (arr.length <= 3) return arr.join(", ");
//     return `${arr.slice(0, 3).join(", ")} ... (+${arr.length - 3})`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
//       <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-6 py-4 shadow-sm">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//                 Sales Report Builder
//               </h1>
//               <p className="text-sm text-slate-600">Drag and drop to create custom reports</p>
//             </div>
//           </div>
//           <div className="flex gap-3">
//             <button onClick={handleCancel} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium">
//               Cancel
//             </button>
//             <button onClick={() => alert("Navigating to Dashboard...")} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
//               Dashboard
//             </button>
//           </div>
//         </div>
//       </div>

//       <DragDropContext onDragEnd={handleDragEnd}>
//         <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
//           <Droppable droppableId="fields">
//             {(provided) => (
//               <div className="w-full lg:w-[30%] bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden" ref={provided.innerRef} {...provided.droppableProps}>
//                 <div className="p-6">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                       </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-slate-800">Available Fields</h2>
//                   </div>

//                   <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/60 rounded-xl shadow-sm">
//                     <div className="flex justify-between items-center mb-4">
//                       <div className="flex items-center gap-2">
//                         <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                         </svg>
//                         <span className="font-semibold text-blue-800">Date Range Filter</span>
//                       </div>
//                       {dateFilter.isActive && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">Active</span>}
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-3 mb-4">
//                       <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
//                         <input type="date" value={dateFilter.startDate} onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))} className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
//                         <input type="date" value={dateFilter.endDate} onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))} className="w-full p-3 text-sm border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
//                       </div>
//                     </div>
                    
//                     <div className="flex gap-3">
//                       <button onClick={handleDateFilterApply} disabled={!dateFilter.startDate || !dateFilter.endDate} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg">
//                         Apply Filter
//                       </button>
//                       <button onClick={handleDateFilterClear} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md">
//                         Clear
//                       </button>
//                     </div>
//                   </div>

//                   <div className="space-y-3 mb-6">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Main Fields</h3>
//                     {mainFields.map((field, index) => (
//                       <FieldItem key={field} field={field} index={index} dateFilter={dateFilter} filteredFieldData={filteredFieldData} />
//                     ))}
//                   </div>

//                   <div className="mb-6">
//                     <button className="w-full p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-purple-200/60 rounded-xl flex justify-between items-center hover:shadow-md transition-all duration-200 group" onClick={() => setShowSearchType(!showSearchType)}>
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
//                           <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                           </svg>
//                         </div>
//                         <span className="font-semibold text-slate-800">Search Type</span>
//                       </div>
//                       <span className={`transform transition-transform duration-200 ${showSearchType ? "rotate-180 text-purple-600" : "text-slate-400"}`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </span>
//                     </button>

//                     {showSearchType && (
//                       <div className="mt-3 space-y-2 pl-4">
//                         {searchTypeFields.map((field, index) => (
//                           <FieldItem key={field} field={field} index={mainFields.length + index} dateFilter={dateFilter} filteredFieldData={filteredFieldData} />
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-6">
//                     <button className="w-full p-4 bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/60 rounded-xl flex justify-between items-center hover:shadow-md transition-all duration-200 group" onClick={() => setShowSearchBy(!showSearchBy)}>
//                       <div className="flex items-center gap-3">
//                         <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
//                           <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
//                           </svg>
//                         </div>
//                         <span className="font-semibold text-slate-800">Search By</span>
//                       </div>
//                       <span className={`transform transition-transform duration-200 ${showSearchBy ? "rotate-180 text-orange-600" : "text-slate-400"}`}>
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </span>
//                     </button>

//                     {showSearchBy && (
//                       <div className="mt-3 space-y-2 pl-4">
//                         {searchByFields.map((field, index) => (
//                           <FieldItem key={field} field={field} index={mainFields.length + searchTypeFields.length + index} dateFilter={dateFilter} filteredFieldData={filteredFieldData} />
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-3">
//                     <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Additional Fields</h3>
//                     {otherFields.map((field, index) => (
//                       <FieldItem key={field} field={field} index={mainFields.length + searchTypeFields.length + searchByFields.length + index} dateFilter={dateFilter} filteredFieldData={filteredFieldData} />
//                     ))}
//                   </div>

//                   {provided.placeholder}
//                 </div>
//               </div>
//             )}
//           </Droppable>

//           <Droppable droppableId="selected">
//             {(provided, snapshot) => (
//               <div className={`w-full lg:w-[65%] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${snapshot.isDraggingOver ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-2 border-dashed border-blue-300" : "bg-white/80 backdrop-blur-sm border border-slate-200/60"}`} ref={provided.innerRef} {...provided.droppableProps}>
//                 <div className="p-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
//                         <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       <h2 className="text-xl font-bold text-slate-800">Selected for Report</h2>
//                     </div>
//                     {selectedFields.length > 0 && (
//                       <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
//                         {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
//                       </span>
//                     )}
//                   </div>

//                   {selectedFields.length === 0 && (
//                     <div className="text-center py-16">
//                       <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                       </div>
//                       <h3 className="text-lg font-semibold text-slate-600 mb-2">No fields selected</h3>
//                       <p className="text-slate-500 max-w-md mx-auto">Drag fields from the left panel to build your custom report</p>
//                     </div>
//                   )}

//                   <div className="space-y-4">
//                     {selectedFields.map((field, index) => (
//                       <SelectedFieldItem
//                         key={field}
//                         field={field}
//                         index={index}
//                         expandedSelected={expandedSelected}
//                         pageState={pageState}
//                         chosenSummary={chosenSummary}
//                         filteredFieldData={filteredFieldData}
//                         dateFilter={dateFilter}
//                         chosenItems={chosenItems}
//                         onOpenChooser={openChooser}
//                         onResetField={handleReset}
//                         onRemoveField={handleRemoveField}
//                         onPageChange={(field, page) => setPageState(prev => ({ ...prev, [field]: page }))}
//                       />
//                     ))}
//                   </div>

//                   {provided.placeholder}
//                 </div>
//               </div>
//             )}
//           </Droppable>
//         </div>
//       </DragDropContext>

//       {choosingField && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col">
//             <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-slate-800">Select {choosingField}</h3>
//                     <p className="text-sm text-slate-600">Choose the data items for this field</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors duration-200" onClick={() => setWorkingSelection(new Set(filteredFieldData[choosingField]))}>
//                     Select All
//                   </button>
//                   <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200" onClick={() => setWorkingSelection(new Set())}>
//                     Clear
//                   </button>
//                   <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200" onClick={closeChooser}>
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 overflow-auto p-6 bg-slate-50">
//               <div className="grid gap-3">
//                 {filteredFieldData[choosingField].map((item, index) => (
//                   <label key={item} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${workingSelection.has(item) ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50 hover:shadow-sm'}`}>
//                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${workingSelection.has(item) ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
//                       {workingSelection.has(item) && (
//                         <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       )}
//                     </div>
//                     <span className="flex-1 text-slate-700 font-medium">{item}</span>
//                     <input type="checkbox" checked={workingSelection.has(item)} onChange={() => toggleWorking(item)} className="hidden" />
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end gap-4">
//               <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 shadow-sm hover:shadow-md" onClick={closeChooser}>
//                 Cancel
//               </button>
//               <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl" onClick={saveChooser}>
//                 Save Selection
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const FieldItem: React.FC<{
//   field: FieldId;
//   index: number;
//   dateFilter: { isActive: boolean };
//   filteredFieldData: Record<FieldId, string[]>;
// }> = ({ field, index, dateFilter, filteredFieldData }) => (
//   <Draggable draggableId={field} index={index}>
//     {(prov, snapshot) => (
//       <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`p-4 bg-white border-2 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 ${snapshot.isDragging ? 'shadow-2xl border-blue-400 bg-blue-50 transform rotate-2' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:bg-blue-50'}`}>
//         <div className="flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
//               <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
//               </svg>
//             </div>
//             <span className="font-medium text-slate-800">{field}</span>
//           </div>
//           {dateFilter.isActive && (
//             <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
//               {filteredFieldData[field].length} items
//             </span>
//           )}
//         </div>
//       </div>
//     )}
//   </Draggable>
// );

// const SelectedFieldItem: React.FC<{
//   field: FieldId;
//   index: number;
//   expandedSelected: FieldId[];
//   pageState: { [key in FieldId]?: number };
//   chosenSummary: (field: FieldId) => string;
//   filteredFieldData: Record<FieldId, string[]>;
//   dateFilter: { isActive: boolean };
//   chosenItems: Record<FieldId, string[]>;
//   onOpenChooser: (field: FieldId) => void;
//   onResetField: (field: FieldId) => void;
//   onRemoveField: (field: FieldId) => void;
//   onPageChange: (field: FieldId, page: number) => void;
// }> = ({
//   field,
//   index,
//   expandedSelected,
//   pageState,
//   chosenSummary,
//   filteredFieldData,
//   dateFilter,
//   chosenItems,
//   onOpenChooser,
//   onResetField,
//   onRemoveField,
//   onPageChange,
// }) => {
//   const allItems = filteredFieldData[field];
//   const selectedItems = chosenItems[field] ?? [];
//   const unselectedItems = allItems.filter(item => !selectedItems.includes(item));
  
//   const page = pageState[field] || 1;
//   const pageSize = 50;
//   const end = page * pageSize;
//   const displayItems = unselectedItems.slice(0, end);

//   return (
//     <Draggable draggableId={field} index={index}>
//       {(prov, snapshot) => (
//         <div ref={prov.innerRef} {...prov.draggableProps} className={`border-2 rounded-xl transition-all duration-300 ${snapshot.isDragging ? 'shadow-2xl border-emerald-400 bg-emerald-50 transform rotate-1' : 'border-slate-200 bg-white hover:shadow-lg'}`}>
//           <div {...prov.dragHandleProps} className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-white p-6 cursor-grab active:cursor-grabbing rounded-t-xl">
//             <div className="flex items-center gap-4 flex-1 min-w-0">
//               <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
//                 <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
//                 </svg>
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h4 className="font-bold text-slate-800 text-lg mb-1">{field}</h4>
//                 <p className={`text-sm truncate ${chosenSummary(field) === "No selection" ? "text-amber-600 font-medium" : "text-slate-600"}`}>
//                   {chosenSummary(field)}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2 flex-wrap">
//               <button className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg" onClick={() => onOpenChooser(field)}>
//                 Update
//               </button>
//               <button className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg" onClick={() => onResetField(field)}>
//                 Reset
//               </button>
//               <button className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg" onClick={() => onRemoveField(field)}>
//                 Remove
//               </button>
//             </div>
//           </div>

//           {expandedSelected.includes(field) && (
//             <div className="bg-slate-50 p-6 border-t border-slate-200 rounded-b-xl">
//               {dateFilter.isActive && (
//                 <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
//                   <div className="flex items-center gap-2 text-blue-800 font-medium">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     Showing {allItems.length} items after date filter
//                     {selectedItems.length > 0 && ` (${selectedItems.length} selected, ${unselectedItems.length} available)`}
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
//                 {displayItems.map((child) => (
//                   <div key={child} className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors duration-200">
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                       <span className="text-slate-700">{child}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {unselectedItems.length > 50 && (
//                 <div className="flex gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
//                   <button disabled={page === 1} className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 text-sm font-medium hover:bg-slate-50 transition-all duration-200 disabled:cursor-not-allowed" onClick={() => onPageChange(field, Math.max(1, page - 1))}>
//                     Previous
//                   </button>

//                   <span className="text-sm text-slate-600 font-medium text-center">
//                     Showing {Math.min(displayItems.length, pageSize)} of {unselectedItems.length} available items
//                     {selectedItems.length > 0 && <span className="text-emerald-600 ml-2">({selectedItems.length} selected)</span>}
//                   </span>

//                   <button disabled={end >= unselectedItems.length} className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white disabled:opacity-40 text-sm font-medium hover:bg-slate-50 transition-all duration-200 disabled:cursor-not-allowed" onClick={() => onPageChange(field, page + 1)}>
//                     Load More
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </Draggable>
//   );
// };




import React from 'react'

const drag = () => {
  return (
    <div>drag</div>
  )
}

export default drag