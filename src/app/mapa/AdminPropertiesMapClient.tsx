"use client";

import dynamic from "next/dynamic";

import type { AdminPropertiesMapViewProps } from "@/components/inmuebles/AdminPropertiesMapView";

const AdminPropertiesMapView = dynamic(
  () => import("@/components/inmuebles/AdminPropertiesMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 pb-16">
        <div className="rounded-3xl bg-white/80 p-6 text-center text-gray-500 shadow-lg backdrop-blur">
          Cargando mapa interactivo…
        </div>
      </div>
    ),
  },
);

const AdminPropertiesMapClient = (props: AdminPropertiesMapViewProps) => {
  return <AdminPropertiesMapView {...props} />;
};

export default AdminPropertiesMapClient;
