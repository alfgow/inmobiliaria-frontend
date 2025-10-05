"use client";

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
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <label className="flex flex-col text-sm font-medium text-[var(--text-dark)]">
          Operación
          <select
            value={operationFilter}
            onChange={(event) => onOperationChange(event.target.value)}
            className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
          >
            <option value="all">Todas</option>
            {availableOperations.map((operation) => (
              <option key={operation} value={operation}>
                {operation}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-[var(--text-dark)]">
          Estatus
          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
          >
            <option value="all">Todos</option>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-[var(--text-dark)]">
          Ordenar por
          <select
            value={sortOption}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[var(--text-dark)] focus:border-[var(--indigo)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
          >
            <option value="relevance">Relevancia</option>
            <option value="price-desc">Precio: Mayor a menor</option>
            <option value="price-asc">Precio: Menor a mayor</option>
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-[var(--text-dark)]">
          Buscar
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 focus-within:border-[var(--indigo)] focus-within:ring-2 focus-within:ring-[var(--indigo)]">
            <span className="text-gray-400" aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              value={searchTerm}
              placeholder="Ciudad, estado o título"
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full border-none bg-transparent text-[var(--text-dark)] outline-none"
            />
          </div>
        </label>
      </div>
    </section>
  );
};

export default FiltersBar;
