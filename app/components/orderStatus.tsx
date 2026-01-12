"use client";


// Support both number and string status
const statusEnum: Record<number | string, string> = {
    1: "Order Created",
    2: "Delivery Created",
    3: "Completed",
    "Order Created": "Order Created",
    "Created Order": "Order Created",
    "Delivery Created": "Delivery Created",
    "Completed": "Completed",
};

// Color mapping for both number and string status
const statusStyles: Record<string, { text: string; bg: string }> = {
    1: { text: '#0B65C3', bg: '#E6F0FF' },
    2: { text: '#92400E', bg: '#FFF7ED' },
    3: { text: '#027A48', bg: '#ECFDF3' },
    "Order Created": { text: '#0B65C3', bg: '#E6F0FF' },
    "Created Order": { text: '#0B65C3', bg: '#E6F0FF' },
    "Delivery Created": { text: '#92400E', bg: '#FFF7ED' },
    "Completed": { text: '#027A48', bg: '#ECFDF3' },
};


export default function OrderStatus({ order_flag }: { order_flag: number | string }) {
    // Accept both string and number, and map to label
    let statusKey: string | number = order_flag;
    // If it's a string that can be parsed as a number, use the number
    if (typeof order_flag === "string" && !isNaN(Number(order_flag))) {
        statusKey = Number(order_flag);
    }
    // Map to label
    const statusLabel = statusEnum[statusKey] || (typeof statusKey === 'string' ? statusKey : "Unknown");
    // Map to color
    const style = statusStyles[statusKey] || { text: '#374151', bg: '#F3F4F6' };
    const inline = { color: style.text, backgroundColor: style.bg } as React.CSSProperties;
    return (
        <span style={inline} className={`text-sm font-medium p-1 px-4 rounded-xl text-[12px]`}>
            {statusLabel}
        </span>
    );
}
