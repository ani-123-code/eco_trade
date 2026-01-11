import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, ListFilter as Filter, Grid2x2 as Grid, List, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { fetchProducts, fetchTypes } from "../store/slices/productSlice";
import ProductCard from "../components/ui/ProductCard";
import Button from "../components/ui/Button";
import CustomSelect from "../components/ui/CustomSelect";

// Helper component for collapsible filter sections
const FilterSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border-b">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-800 hover:text-green-700"
    >
      <span>{title}</span>
      <ChevronDown
        size={20}
        className={`transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    {isOpen && <div className="pb-4">{children}</div>}
  </div>
);

// Helper component for filter checkboxes
const FilterCheckbox = ({ label, value, checked, onChange, count }) => (
  <label className="flex items-center space-x-3 cursor-pointer group">
    <input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
    />
    <span className="text-sm text-gray-700 group-hover:text-black">
      {label} {count && `(${count})`}
    </span>
  </label>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        <ChevronLeft size={16} />
      </button>
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      {pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-2 rounded-md border ${
            pageNum === currentPage
              ? "bg-green-600 text-white border-green-600"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {pageNum}
        </button>
      ))}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, types, loading, totalPages, currentPage } = useSelector(
    (state) => state.products
  );
    
  // Local state for the search input field only
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  
  // UI state driven by URL or local preference
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedBurnerTypes, setSelectedBurnerTypes] = useState([]);
  const [selectedIgnitionTypes, setSelectedIgnitionTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortBy, setSortBy] = useState("featured");

  // Local component state for UI toggles
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [openSections, setOpenSections] = useState({
    price: true,
    availability: false,
    burner: false,
    ignition: false,
    type: false,
  });
  
  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter options constants
  const priceOptions = [
    { label: "Under 5000", value: "0-4999" },
    { label: "5000 to 10000", value: "5000-10000" },
    { label: "10000 to 15000", value: "10000-15000" },
    { label: "15000 to 20000", value: "15000-20000" },
    { label: "Above 20000", value: "20000+" },
  ];
  const burnerTypeOptions = [
    { label: "2 Burners", value: "2" },
    { label: "3 Burners", value: "3" },
    { label: "4 Burners", value: "4" },
  ];
  const ignitionTypeOptions = [
    { label: "Auto Ignition", value: "Auto Ignition" },
    { label: "Manual Ignition", value: "Manual Ignition" },
  ];
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest First" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
    { value: "name", label: "Name A-Z" },
  ];

  // Fetch initial data like product types
  useEffect(() => {
    dispatch(fetchTypes());
  }, [dispatch]);
  
  // Sync URL params to local UI state for controlled components
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setSelectedPriceRanges(params.get("priceRanges")?.split(",") || []);
    setSelectedBurnerTypes(params.get("burners")?.split(",") || []);
    setSelectedIgnitionTypes(params.get("ignition")?.split(",") || []);
    setInStockOnly(params.get("inStock") === "true");
    setSortBy(params.get("sortBy") || "featured");
    setSelectedTypes(params.get("types")?.split(",") || []);
  }, [searchParams]);
  
  // Main effect to fetch products when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const currentQuery = params.get("q");
    
    // Only fetch if there is a search query
    if (!currentQuery) return;
    
    const filters = {
      search: currentQuery,
      page: parseInt(params.get("page") || "1", 10),
      limit: 12, // Increased limit for search results
      sortBy: params.get("sortBy") || "featured",
    };
    
    if (params.get("inStock") === "true") filters.inStock = true;
    if (params.get("burners")) filters.burners = params.get("burners");
    if (params.get("ignition")) filters.ignition = params.get("ignition");
    if (params.get("types")) filters.types = params.get("types");
    
    const priceRangesFromURL = params.get("priceRanges");
    if (priceRangesFromURL) {
      const allRanges = priceRangesFromURL.split(",").map((range) => {
        const [min, max] = range.split("-");
        return { min: parseInt(min, 10), max: max === "+" ? Infinity : parseInt(max, 10) };
      });
      filters.minPrice = Math.min(...allRanges.map((r) => r.min));
      const maxVal = Math.max(...allRanges.map((r) => r.max));
      if (isFinite(maxVal)) filters.maxPrice = maxVal;
    }
    
    dispatch(fetchProducts(filters));
  }, [dispatch, searchParams]);
  
  // Function to update URL search parameters
  const updateURLParams = (key, value) => {
    setSearchParams(
      (prev) => {
        prev.set("page", "1"); // Reset to page 1 on any filter change
        if (!value || value.length === 0) {
          prev.delete(key);
        } else {
          prev.set(key, Array.isArray(value) ? value.join(",") : value);
        }
        return prev;
      },
      { replace: true }
    );
  };

   const getHeaderStyle = () => {
    // Read directly from URL parameters for immediate detection.
    const typeParam = searchParams.get("type");
    const typesParam = searchParams.get("types")?.split(",") || [];
    
    // Combine all type filters from the URL into a Set for easy checking.
    const allSelectedTypes = new Set(typesParam.filter(Boolean));
    if (typeParam) {
      allSelectedTypes.add(typeParam);
    }

    // Default banner for "All Products" or any mixed filters.
    let imageUrl = "/assets/banner/Mix_Banner3.png";


    // Conditions for specific banners, ordered by specificity.
    if (allSelectedTypes.has("Stainless Steel Gas Stove")) {
      imageUrl = "/assets/banner/Steel_Stove_Banner.png";
    } else if (
      allSelectedTypes.has("Glass Gas Stove")
    ) {
      imageUrl = "/assets/banner/Glass_Stove_Banner.png";
    } else if (
      allSelectedTypes.has("Mixer Grinder")
    ) {
      imageUrl = "/assets/banner/Grinder_Banner.png";
    }

    return {
      backgroundImage: `linear-gradient(rgba(42, 67, 101, 0.7), rgba(42, 67, 101, 0.7)), url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      // Create new search params, clearing old filters but keeping the new query
      const newParams = new URLSearchParams();
      newParams.set("q", query);
      setSearchParams(newParams);
    }
  };

  const handleCheckboxChange = (value, state, paramKey) => {
    const newState = state.includes(value)
      ? state.filter((item) => item !== value)
      : [...state, value];
    updateURLParams(paramKey, newState);
  };
  
  const handleSortChange = (newSort) => {
    updateURLParams("sortBy", newSort);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      const currentParams = new URLSearchParams(searchParams);
      currentParams.set("page", newPage);
      setSearchParams(currentParams);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  const clearFilters = () => {
    const newSearchParams = new URLSearchParams();
    const currentQuery = searchParams.get("q");
    if (currentQuery) {
        newSearchParams.set("q", currentQuery); // Keep the search query
    }
    setSearchParams(newSearchParams);
  };

  const getActiveFiltersCount = () => {
    const params = new URLSearchParams(searchParams);
    let count = 0;
    if (params.has("priceRanges")) count++;
    if (params.has("inStock")) count++;
    if (params.has("burners")) count++;
    if (params.has("ignition")) count++;
    if (params.has("types")) count++;
    return count;
  };
  
  const currentQuery = searchParams.get('q');
  
  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Search Bar Area */}
        <div className="pb-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Search Products</h1>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for refurbished electronics, smartphones, laptops..."
                className="w-full rounded-lg border border-gray-300 pl-4 pr-12 py-3 text-lg focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 flex h-full items-center justify-center px-4 text-gray-500 hover:text-green-700"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </form>
        </div>
        
        {/* Conditional rendering for search results area */}
        {currentQuery && (
          <>
            {/* Header */}
            <div
          className="py-10 px-6 rounded-lg mb-8 text-white"
          style={getHeaderStyle()}
        >
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3">Search Results for "{currentQuery}"</h1>
                <p className="text-lg text-gray-100 mb-4">
                  {loading ? 'Searching...' : `Displaying ${products.length} products on this page`}
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-md shadow-sm relative z-20">
              <div className="flex items-center mb-4 md:mb-0">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Filter size={18} />}
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  className="mr-4"
                >
                  Filter {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
                </Button>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}>
                    <Grid size={18} className={viewMode === "grid" ? "text-green-700" : "text-gray-500"} />
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-gray-100" : ""}`}>
                    <List size={18} className={viewMode === "list" ? "text-green-700" : "text-gray-500"} />
                  </button>
                </div>
              </div>
              <div className="w-full md:w-48">
                <CustomSelect value={sortBy} onChange={handleSortChange} options={sortOptions} />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row">
              {/* Filters Sidebar */}
              <div className={`w-full sm:w-64 md:w-56 lg:w-60 xl:w-72 mb-6 md:mb-0 md:mr-6 ${isFilterVisible ? "block" : "hidden md:block"}`}>
                <div className="sticky top-24 bg-white rounded-md shadow-lg border p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-green-700">Filters</h3>
                        <button
                          onClick={clearFilters}
                          disabled={getActiveFiltersCount() === 0}
                          className="text-sm text-green-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                          Clear All
                        </button>
                    </div>

                    <div className="space-y-2">
                      <FilterSection title="Price" isOpen={openSections.price} onToggle={() => toggleSection("price")}>
                        <div className="space-y-3">
                          {priceOptions.map((opt) => (
                            <FilterCheckbox key={opt.value} label={opt.label} value={opt.value} checked={selectedPriceRanges.includes(opt.value)} onChange={() => handleCheckboxChange(opt.value, selectedPriceRanges, "priceRanges")} />
                          ))}
                        </div>
                      </FilterSection>
                      
                      <FilterSection title="Availability" isOpen={openSections.availability} onToggle={() => toggleSection("availability")}>
                        <div className="space-y-3">
                            <FilterCheckbox label="In Stock Only" value="inStock" checked={inStockOnly} onChange={() => updateURLParams("inStock", !inStockOnly ? "true" : "")} />
                        </div>
                      </FilterSection>

                      {/* Optional filters for specific product attributes */}
                      <FilterSection title="Burner Type" isOpen={openSections.burner} onToggle={() => toggleSection("burner")}>
                        <div className="space-y-3">
                          {burnerTypeOptions.map((opt) => (
                              <FilterCheckbox key={opt.value} label={opt.label} value={opt.value} checked={selectedBurnerTypes.includes(opt.value)} onChange={() => handleCheckboxChange(opt.value, selectedBurnerTypes, "burners")} />
                          ))}
                        </div>
                      </FilterSection>

                      <FilterSection title="Ignition Type" isOpen={openSections.ignition} onToggle={() => toggleSection("ignition")}>
                        <div className="space-y-3">
                          {ignitionTypeOptions.map((opt) => (
                              <FilterCheckbox key={opt.value} label={opt.label} value={opt.value} checked={selectedIgnitionTypes.includes(opt.value)} onChange={() => handleCheckboxChange(opt.value, selectedIgnitionTypes, "ignition")} />
                          ))}
                        </div>
                      </FilterSection>

                      <FilterSection title="Type" isOpen={openSections.type} onToggle={() => toggleSection("type")}>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                              {types.map((type) => (
                                  <FilterCheckbox key={type._id} label={type.name} value={type.name} checked={selectedTypes.includes(type.name)} onChange={() => handleCheckboxChange(type.name, selectedTypes, "types")} />
                              ))}
                          </div>
                      </FilterSection>
                    </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {loading && products.length === 0 ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
                    </div>
                ) : !loading && products.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                        <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
                        <p className="text-gray-600 mb-4">No results for "{currentQuery}". Try different search terms or filters.</p>
                        {getActiveFiltersCount() > 0 && <Button variant="primary" onClick={clearFilters}>Clear Filters</Button>}
                    </div>
                ) : (
                    <>
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                           {products.map((product) => (
                                <ProductCard key={product._id} product={product} viewMode="list" />
                            ))}
                        </div>
                      )}
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;