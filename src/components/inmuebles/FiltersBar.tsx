"use client";

import { useEffect, useState } from "react";

const viewOptions = [
  { value: "list" as const, label: "Lista" },
  { value: "grid" as const, label: "Cuadrícula" },
];

export type ViewMode = (typeof viewOptions)[number]["value"];

export type SortOption = "relevance" | "price-asc" | "price-desc";

interface FiltersBarProps {
  totalCount: number;
  isLoading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  canSelectViewMode: boolean;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  operationFilter: string;
  onOperationChange: (operation: string) => void;
  availableOperations: string[];
  statusFilter: string;
  onStatusChange: (status: string) => void;
  availableStatuses: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FiltersBar = ({
  totalCount,
  isLoading,
  viewMode,
  onViewModeChange,
  canSelectViewMode,
  sortOption,
  onSortChange,
  operationFilter,
  onOperationChange,
  availableOperations,
  statusFilter,
  onStatusChange,
  availableStatuses,
  searchTerm,
  onSearchChange,
}: FiltersBarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateState = (matches: boolean) => {
      setIsMobileOpen(matches);
    };

    updateState(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      updateState(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-lg backdrop-blur">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            {isLoading ? "Cargando propiedades…" : `Mostrando ${totalCount} propiedades`}
          </p>
          <h1 className="text-2xl font-semibold text-[var(--text-dark)]">
            Encuentra tu próximo hogar
          </h1>
        </div>

        {canSelectViewMode && (
          <div className="flex flex-wrap items-center gap-3">
            {viewOptions.map((option) => {
              const isActive = option.value === viewMode;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onViewModeChange(option.value)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 ${
                    isActive
                      ? "border-[var(--indigo)] bg-[var(--indigo)] text-white"
                      : "border-gray-200 bg-white text-[var(--text-dark)] hover:border-[var(--indigo)] hover:text-[var(--indigo)]"
                  }`}
                >
                  <span
                    className="inline-flex h-2.5 w-2.5 rounded-full border border-current"
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsMobileOpen((prevState) => !prevState)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[var(--text-dark)] shadow-sm transition hover:border-[var(--indigo)] hover:text-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 md:hidden"
        aria-expanded={isMobileOpen}
        aria-controls="filters-grid"
      >
        {isMobileOpen ? "Ocultar filtros" : "Mostrar filtros"}
      </button>

      <div
        id="filters-grid"
        className={`mt-6 gap-4 transition-all duration-300 ${
          isMobileOpen ? "grid grid-cols-1" : "hidden"
        } md:grid md:grid-cols-4`}
      >
        <div className="rounded-2xl bg-slate-50/90 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 text-[var(--text-dark)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">
              🏠
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Operación</p>
              <p className="text-sm text-gray-600">Tipo de operación</p>
            </div>
          </div>
          <label htmlFor="operation-filter" className="sr-only">
            Selecciona el tipo de operación
          </label>
          <select
            id="operation-filter"
            value={operationFilter}
            onChange={(event) => onOperationChange(event.target.value)}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] shadow-sm transition focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 hover:border-[var(--indigo)]"
          >
            <option value="all">Todas</option>
            {availableOperations.map((operation) => (
              <option key={operation} value={operation}>
                {operation}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50/90 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 text-[var(--text-dark)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">
              📊
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estatus</p>
              <p className="text-sm text-gray-600">Disponibilidad del inmueble</p>
            </div>
          </div>
          <label htmlFor="status-filter" className="sr-only">
            Selecciona el estatus del inmueble
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] shadow-sm transition focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 hover:border-[var(--indigo)]"
          >
            <option value="all">Todos</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50/90 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 text-[var(--text-dark)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">
              ⚖️
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ordenar por</p>
              <p className="text-sm text-gray-600">Define la prioridad de la lista</p>
            </div>
          </div>
          <label htmlFor="sort-filter" className="sr-only">
            Selecciona el orden de los resultados
          </label>
          <select
            id="sort-filter"
            value={sortOption}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] shadow-sm transition focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)] focus:ring-offset-2 hover:border-[var(--indigo)]"
          >
            <option value="relevance">Relevancia</option>
            <option value="price-desc">Precio: Mayor a menor</option>
            <option value="price-asc">Precio: Menor a mayor</option>
          </select>
        </div>

        <div className="rounded-2xl bg-slate-50/90 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3 text-[var(--text-dark)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm" aria-hidden="true">
              🔍
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Buscar</p>
              <p className="text-sm text-gray-600">Explora por ubicación o título</p>
            </div>
          </div>
          <label htmlFor="search-term" className="sr-only">
            Ingresa un término de búsqueda
          </label>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-[var(--indigo)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--indigo)] focus-within:ring-offset-2">
            <input
              id="search-term"
              type="search"
              value={searchTerm}
              placeholder="Ciudad, estado o título"
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full border-none bg-transparent text-[var(--text-dark)] placeholder:text-gray-400 outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiltersBar;
