import type React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ProductCatalog from "../components/ProductCatalog";

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  // Update search query when URL params change
  useEffect(() => {
    const urlSearchQuery = searchParams.get("search") || "";
    setSearchQuery(urlSearchQuery);
  }, [searchParams]);

  return (
    <div className="bg-neutral-gray-100 min-h-screen">
      {/* Search Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Поиск кроссовок..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brand-primary text-white px-4 py-1.5 rounded-md hover:bg-brand-dark transition-colors text-sm font-medium"
              >
                Найти
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Product Catalog */}
      <ProductCatalog searchQuery={searchQuery} />
    </div>
  );
};

export default CatalogPage;
