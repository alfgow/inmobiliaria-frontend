import PropertyCard from "./PropertyCard";
import type { ViewMode } from "./FiltersBar";
import type { ApiProperty } from "@/components/FeaturedProperties/useProperties";

interface PropertiesListProps {
  properties: ApiProperty[];
  viewMode: ViewMode;
}

const PropertiesList = ({ properties, viewMode }: PropertiesListProps) => {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div
      className={
        viewMode === "grid"
          ? "grid gap-6 md:grid-cols-2"
          : "flex flex-col gap-6"
      }
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default PropertiesList;
