"use client";

import { useEffect, useState } from "react";
import { listThings, ThingDocument } from "@/app/ditto/endpoints";

type TwinsProps = {
  onSelectTwin: (twin: ThingDocument) => void;
};

const Twins = ({ onSelectTwin }: TwinsProps) => {
  const [twins, setTwins] = useState<ThingDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTwins = async () => {
      try {
        setTwins(await listThings());
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTwins();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading twins...</div>;
  }

  return (
    <div className="w-1/2 h-full border-4 border-blue-500 p-4">
      <div className="text-2xl font-bold mb-4 text-blue-600">Twins</div>

      {twins.length === 0 ? (
        <div className="text-gray-500">No twins found.</div>
      ) : (
        <ul className="space-y-3">
          {twins.map((twin, index) => (
            <li
              key={twin.thingId ?? index}
              className="cursor-pointer p-3 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition"
              onClick={() => onSelectTwin(twin)}
            >
              <p className="font-semibold">{twin.thingId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Twins;
