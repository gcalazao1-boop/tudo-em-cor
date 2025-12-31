import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ProductContextType } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Tag } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { products, categories, filters } = useOutletContext<ProductContextType>();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlFilter = searchParams.get('filter'); // Capture filter from URL

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlFilter) setSelectedFilter(urlFilter); // Apply filter from URL
  }, [urlCategory, urlFilter]);

  // Get only active categories and filters
  const activeCategories = ['Todos', ...categories.filter(c => c.active).map(c => c.name)];
  const activeFilters = ['Todos', ...filters.filter(f => f.active).map(f => f.name)];

  const filteredProducts = products.filter(p => {
    // Only show active products
    if (!p.active) return false;

    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    
    // Check custom filters (tags)
    const matchesFilter = selectedFilter === 'Todos' || (p.filters && p.filters.includes(selectedFilter));

    return matchesSearch && matchesCategory && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen">
      
      {/* Header & Filters */}
      <div className="flex flex-col gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Catálogo</h1>
          <p className="text-gray-500">Encontre a arte perfeita para sua caneca.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-cream">
          {/* Search Input */}
          <div className="relative flex-grow w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar arte..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-gray-50 rounded-full border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-pink-100 outline-none w-full shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full lg:w-auto">
             <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-10 py-3 bg-gray-50 rounded-full border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-pink-100 outline-none w-full appearance-none shadow-sm cursor-pointer font-semibold text-gray-600"
             >
                {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>
          </div>

          {/* Additional Tags/Filters */}
          {activeFilters.length > 1 && (
             <div className="relative w-full lg:w-auto">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select 
                   value={selectedFilter}
                   onChange={(e) => setSelectedFilter(e.target.value)}
                   className="pl-12 pr-10 py-3 bg-gray-50 rounded-full border border-gray-200 focus:border-cherry focus:ring-2 focus:ring-pink-100 outline-none w-full appearance-none shadow-sm cursor-pointer font-semibold text-gray-600"
                >
                   {activeFilters.map(f => (
                     <option key={f} value={f}>{f}</option>
                   ))}
                </select>
             </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-xl text-gray-400 font-semibold">Nenhum produto encontrado com estes filtros 😔</p>
          <button 
            onClick={() => {setSearchTerm(''); setSelectedCategory('Todos'); setSelectedFilter('Todos');}}
            className="mt-4 text-cherry font-bold hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};