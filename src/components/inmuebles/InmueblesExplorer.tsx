"use client";

import { useEffect, useMemo, useState } from "react";

import FiltersBar, { type SortOption, type ViewMode } from "./FiltersBar";
import PropertiesList from "./PropertiesList";
import type { PublicProperty } from "@/lib/property-types";

type InmueblesExplorerProps = {
  properties: PublicProperty[];
  error?: string | null;
};

const normalizeValue = (value?: string | null) => value?.trim().toLowerCase() ?? "";
const DEFAULT_SORT_OPTION: SortOption = "relevance";

const getPublicationTime = (property: PublicProperty) => {
  const createdAt = property.createdAt ? new Date(property.createdAt).getTime() : 0;
  const updatedAt = property.updatedAt ? new Date(property.updatedAt).getTime() : 0;

  return Math.max(createdAt, updatedAt);
};

const comparePropertyRelevance = (left: PublicProperty, right: PublicProperty) => {
  const leftAvailable = left.isAvailable;
  const rightAvailable = right.isAvailable;

  if (leftAvailable !== rightAvailable) {
    return leftAvailable ? -1 : 1;
  }

  if (leftAvailable && rightAvailable) {
    const leftPrice = typeof left.price === "number" && Number.isFinite(left.price) ? left.price : Number.NEGATIVE_INFINITY;
    const rightPrice = typeof right.price === "number" && Number.isFinite(right.price) ? right.price : Number.NEGATIVE_INFINITY;

    if (rightPrice !== leftPrice) {
      return rightPrice - leftPrice;
    }
  }

  const leftPublishedAt = getPublicationTime(left);
  const rightPublishedAt = getPublicationTime(right);

  return rightPublishedAt - leftPublishedAt;
};

const InmueblesExplorer = ({ properties, error }: InmueblesExplorerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [canSelectViewMode, setCanSelectViewMode] = useState(false);
  const [operationFilter, setOperationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION);
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
      return [...filteredProperties].sort(comparePropertyRelevance);
    }

    const copy = [...filteredProperties];

    copy.sort((a, b) => {
      const priceA = typeof a.price === "number" ? a.price : 0;
      const priceB = typeof b.price === "number" ? b.price : 0;

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
        isLoading={false}
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

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : null}

      {!error && sortedProperties.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl bg-white/70 p-10 text-center text-gray-500">
          No hay propiedades disponibles por ahora.
        </div>
      ) : null}

      {!error && sortedProperties.length > 0 ? (
        <PropertiesList properties={sortedProperties} viewMode={viewMode} />
      ) : null}
    </div>
  );
};

export default InmueblesExplorer;
