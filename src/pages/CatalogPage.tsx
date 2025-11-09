import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCatalog from "../components/ProductCatalog";

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") || undefined
  );

  const handleSearchChange = (query: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (query.trim()) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    
    setSearchParams(params);
  };

  useEffect(() => {
    const urlSearchQuery = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || undefined;
    
    setSearchQuery(urlSearchQuery);
    setCategoryId(urlCategory);
  }, [searchParams]);

  return (
    <div className="bg-neutral-gray-100 min-h-screen">
      {/* Product Catalog */}
      <ProductCatalog
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        categoryId={categoryId}
      />
    </div>
  );
};

export default CatalogPage;
