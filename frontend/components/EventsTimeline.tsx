"use client";
import { useEvents } from "@/hooks/useEvents";

export function EventsTimeline() {
  const events = useEvents();
  if (!events.length)
    return <div className="text-sm text-gray-500">No events yet.</div>;
  return (
    <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {events.map((e, idx) => (
        <li key={idx} className="text-sm flex gap-2">
          <span className="font-medium">{e.type}</span>
          <span className="text-gray-500">#{e.orderId}</span>
          <span className="text-gray-400">
            {e.timestamp.toLocaleTimeString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
