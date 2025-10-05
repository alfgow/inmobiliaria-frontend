"use client";

import { useEffect, useMemo, useState } from "react";

import FiltersBar, { type SortOption, type ViewMode } from "./FiltersBar";
import PropertiesList from "./PropertiesList";
import { useProperties } from "@/components/FeaturedProperties/useProperties";

const normalizeValue = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const InmueblesExplorer = () => {
  const { properties, isLoading, error } = useProperties();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [canSelectViewMode, setCanSelectViewMode] = useState(false);
  const [operationFilter, setOperationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [searchTerm, setSearchTerm] = useState("");

  const availableOperations = useMemo(() => {
    const unique = new Set<string>();

    properties.forEach((property) => {
      if (property.operation) {
        unique.add(property.operation);
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const availableStatuses = useMemo(() => {
    const unique = new Set<string>();

    properties.forEach((property) => {
      if (property.status?.name) {
        unique.add(property.status.name);
      }
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = normalizeValue(searchTerm);

    return properties.filter((property) => {
      const normalizedOperation = normalizeValue(property.operation);
      const normalizedStatus = normalizeValue(property.status?.name ?? null);
      const matchesOperation =
        operationFilter === "all" || normalizedOperation === normalizeValue(operationFilter);
      const matchesStatus =
        statusFilter === "all" || normalizedStatus === normalizeValue(statusFilter);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [property.title, property.city, property.state]
          .filter(Boolean)
          .some((field) => normalizeValue(field).includes(normalizedSearch));

      return matchesOperation && matchesStatus && matchesSearch;
    });
  }, [operationFilter, properties, searchTerm, statusFilter]);

  const sortedProperties = useMemo(() => {
    if (sortOption === "relevance") {
      return filteredProperties;
    }

    const copy = [...filteredProperties];

    copy.sort((a, b) => {
      const priceA = Number.isFinite(a.price) ? a.price : 0;
      const priceB = Number.isFinite(b.price) ? b.price : 0;

      if (sortOption === "price-asc") {
        return priceA - priceB;
      }

      if (sortOption === "price-desc") {
        return priceB - priceA;
      }

      return 0;
    });

    return copy;
  }, [filteredProperties, sortOption]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const desktopQuery = window.matchMedia("(min-width: 1020px)");

    const updateViewMode = (matches: boolean) => {
      setCanSelectViewMode(matches);
      setViewMode((previous) => {
        const desired = matches ? "list" : "grid";

        return previous === desired ? previous : desired;
      });
    };

    updateViewMode(desktopQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      updateViewMode(event.matches);
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleChange);
    } else {
      desktopQuery.addListener(handleChange);
    }

    return () => {
      if (typeof desktopQuery.removeEventListener === "function") {
        desktopQuery.removeEventListener("change", handleChange);
      } else {
        desktopQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-8 md:py-12">
      <FiltersBar
        totalCount={sortedProperties.length}
        isLoading={isLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canSelectViewMode={canSelectViewMode}
        sortOption={sortOption}
        onSortChange={setSortOption}
        operationFilter={operationFilter}
        onOperationChange={setOperationFilter}
        availableOperations={availableOperations}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        availableStatuses={availableStatuses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl bg-white/70 p-10 text-center text-gray-500">
          Cargando propiedades…
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      )}

      {!isLoading && !error && sortedProperties.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl bg-white/70 p-10 text-center text-gray-500">
          No hay propiedades destacadas disponibles por ahora.
        </div>
      )}

      {!isLoading && !error && sortedProperties.length > 0 && (
        <PropertiesList properties={sortedProperties} viewMode={viewMode} />
      )}
    </div>
  );
};

export default InmueblesExplorer;
