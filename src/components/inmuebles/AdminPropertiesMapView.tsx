"use client";

import AdminPropertiesMap from "./AdminPropertiesMap";
import type { PublicProperty } from "@/lib/property-types";

type AdminPropertiesMapViewProps = {
  properties: PublicProperty[];
  error?: string | null;
};

const AdminPropertiesMapView = ({ properties, error }: AdminPropertiesMapViewProps) => {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16">
      <AdminPropertiesMap properties={properties} isLoading={false} />
      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
};

export type { AdminPropertiesMapViewProps };

export default AdminPropertiesMapView;
