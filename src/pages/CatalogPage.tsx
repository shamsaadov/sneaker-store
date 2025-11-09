import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCatalog from "../components/ProductCatalog";

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const handleSearchChange = (query: string) => {
    if (query.trim()) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const urlSearchQuery = searchParams.get("search") || "";
    setSearchQuery(urlSearchQuery);
  }, [searchParams]);

  return (
    <div className="bg-neutral-gray-100 min-h-screen">
      {/* Product Catalog */}
      <ProductCatalog
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
};

export default CatalogPage;
