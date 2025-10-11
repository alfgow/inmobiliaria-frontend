"use client";

import AdminPropertiesMap from "./AdminPropertiesMap";
import { useProperties } from "@/components/FeaturedProperties/useProperties";

const AdminPropertiesMapView = () => {
  const { properties, isLoading, error } = useProperties();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16">
      <AdminPropertiesMap properties={properties} isLoading={isLoading} />
      {error && !isLoading ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
};

export default AdminPropertiesMapView;
