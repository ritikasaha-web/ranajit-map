"use client";

import NavBar from "@/app/components/shared/navBar";
import Attribures from "@/app/components/shared/attributes";
import Features from "@/app/components/shared/features";
import EditTwin from "@/app/components/common/editTwin";
import TowerComponents from "@/app/components/towerComponents";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTwinById } from "@/app/api/endpoints";

const TowerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const towerName = decodeURIComponent(id);

  const [twinData, setTwinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTwin = async () => {
      try {
        const data = await getTwinById(towerName);
        setTwinData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTwin();
  }, [towerName]);

  if (loading) return <div>Loading twin data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <NavBar towerId={towerName} />
      <div className="flex w-full px-8 rounded-lg">
        <Attribures data={twinData?.attributes} />
        <Features data={twinData?.features} />
      </div>
      <div className="">
        <EditTwin data={twinData} />
        {/* <TowerComponents features={twinData.features} /> */}
      </div>
    </div>
  );
};

export default TowerDetails;
