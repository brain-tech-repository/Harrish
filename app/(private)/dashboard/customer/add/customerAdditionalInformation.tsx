"use client";
import { useState } from "react";
import InputFields from "@/app/components/inputFields";

export default function CustomerAdditionalInformation() {
  const [route, setRoute] = useState("");
  const [assignLatitude, setAssignLatitude] = useState("");
  const [assignLongitude, setAssignLongitude] = useState("");
  const [assignAccuracy, setAssignAccuracy] = useState("");

  const [days, setDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
     

      {/* First Row - Route, Latitude, Longitude */}
      
        <InputFields
          label="Route"
         
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          options={[
            { value: "Route 1", label: "Route 1" },
            { value: "Route 2", label: "Route 2" },
            { value: "Route 3", label: "Route 3" },
          ]}
        />

        <InputFields
          label="Assign Latitude"
          
          value={assignLatitude}
          onChange={(e) => setAssignLatitude(e.target.value)}
          
        />

        <InputFields
          label="Assign Longitude"
         
          value={assignLongitude}
          onChange={(e) => setAssignLongitude(e.target.value)}
        
        />
    

      {/* Second Row - Accuracy + Days */}
      
        <InputFields
          label="Assign Accuracy"
         
          value={assignAccuracy}
         onChange={(e) => setAssignAccuracy(e.target.value)}
         
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Days
          </label>
          <div className="flex gap-2 flex-wrap">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1 rounded-full border text-sm font-medium ${
                  days.includes(day)
                    ? "bg-red-50 border-red-400 text-red-500"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      
     
    
  );
}
