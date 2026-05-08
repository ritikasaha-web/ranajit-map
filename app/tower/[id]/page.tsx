"use client";

import EditTwin from "@/app/components/common/editTwin";
import { Button } from "@/components/ui/button";
import { applyFormatting } from "@/app/constants/component_names";
import { useTower } from "@/app/hooks/getTowers";

const TowerDetails = () => {
  const getIdFromUrl = () => {
    const match = window.location.pathname.match(/\/tower\/([^/]+)/);
    return match ? match[1] : null;
  };

  const id = getIdFromUrl();
  const towerName = id ? decodeURIComponent(id) : "";
  const router = {
    push: (url: string) => {
      window.location.href = url;
    },
  };

  const { data: twinData, isLoading, error } = useTower(towerName ?? undefined);

  /* -----------------------------
     Recursive Renderer (KEY FIX)
  ----------------------------- */
  const renderRecursive = (data: any, parentKey?: string): React.ReactNode => {
    if (data === null || data === undefined)
      return <span className="opacity-50">—</span>;

    if (typeof data !== "object") {
      return (
        <span>
          {parentKey?.toLowerCase() === "model"
            ? String(data).toUpperCase()
            : typeof data === "string"
              ? applyFormatting(data)
              : String(data)}
        </span>
      );
    }

    if (Array.isArray(data)) {
      return (
        <ul className="ml-4 list-disc">
          {data.map((item, i) => (
            <li key={i}>{renderRecursive(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className="ml-3 border-l border-sky-200 pl-3 space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium text-slate-700">
              {applyFormatting(key)}:
            </span>
            <div className="ml-2 text-slate-600">
              {renderRecursive(value, key)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) return <div className="p-6">Loading twin data…</div>;
  if (error instanceof Error)
    return <div className="p-6 text-red-500">{error.message}</div>;

  if (!twinData) {
    return <div className="p-6">No twin data found.</div>;
  }

  const { thingId, attributes = {}, features = {} } = twinData;

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-sky-200">
        <div className="relative flex items-center justify-center py-4 px-6">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-10 absolute left-6"
          />
          <h1 className="text-2xl font-semibold tracking-wide">{thingId}</h1>
        </div>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Attributes + Features */}
        <div className="flex gap-6">
          {/* Attributes */}
          <section className="flex-1 bg-white/80 rounded-xl border border-sky-200 shadow-sm p-4 overflow-auto max-h-[420px]">
            <h2 className="text-xl font-semibold mb-3">Attributes</h2>
            {Object.keys(attributes).length === 0 ? (
              <p className="opacity-60">No attributes</p>
            ) : (
              renderRecursive(attributes)
            )}
          </section>

          {/* Features */}
          <section className="flex-1 bg-white/80 rounded-xl border border-sky-200 shadow-sm p-4 overflow-auto max-h-[420px]">
            <h2 className="text-xl font-semibold mb-3">Features</h2>

            {Object.entries(features).length === 0 ? (
              <p className="opacity-60">No features</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(features).map(
                  ([featureName, featureObj]: any) => (
                    <div
                      key={featureName}
                      className="p-3 rounded-lg bg-sky-50 border border-sky-100"
                    >
                      <h3 className="font-semibold text-sky-700 mb-2 capitalize">
                        {featureName.replaceAll("_", " ")}
                      </h3>

                      {featureObj?.properties ? (
                        renderRecursive(featureObj.properties)
                      ) : (
                        <p className="opacity-60">No properties</p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        {/* Edit Section (unchanged logic) */}
        <section className="bg-white/80 rounded-xl border border-sky-200 shadow-sm p-4">
          <EditTwin data={twinData} />
        </section>

        {/* Quick Actions */}
        <div className="flex gap-3 justify-end">
          <Button onClick={() => router.push(`/`)}>Back to Towers</Button>

          <Button
            variant="secondary"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${attributes.location?.lat},${attributes.location?.lng}`,
                "_blank",
              )
            }
          >
            Open in Maps
          </Button>
        </div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-sky-200 bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold">CODEZIN</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default TowerDetails;

// const [twinData, setTwinData] = useState<any>(null);
// const [loading, setLoading] = useState(true);
// const [error, setError] = useState<string | null>(null);

// useEffect(() => {
//   const fetchTwin = async () => {
//     try {
//       const data = await getTwinById(towerName);
//       setTwinData(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchTwin();
// }, [towerName]);
