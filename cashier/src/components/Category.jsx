import React from 'react';
import { Coffee, Utensils, Moon, CupSoda, ChefHat } from 'lucide-react';

const iconMap = {
  'breakfast': Coffee,
  'lunch': Utensils,
  'dinner': Moon,
  'drink': CupSoda,
  'all': ChefHat
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  search,
  onSearchChange,
  getProductCount,
  getIcon
}) {
  return (
    <div className="mb-6">
      {/* Categories Title */}
      <h2 className="text-xl font-semibold text-base-content mb-4">Categories</h2>
      
      {/* Category Buttons */}
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const Icon = getIcon(category);
          const isSelected = selectedCategory === category;
          const count = getProductCount(category);

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl transition-all shrink-0 min-w-40 sm:min-w-[200px] ${
                isSelected
                  ? 'bg-accent text-white shadow-lg'
                  : 'bg-accent text-accent-content hover:bg-accent-focus'
              }`}
            >
              <div className="bg-accent">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-content" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-sm sm:text-base capitalize">{category}</span>
                <span className="text-[10px] sm:text-xs opacity-70">{count} Menu in Stock</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search Products"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input w-full bg-white border-accent placeholder:text-accent-content/50 rounded-xl px-5 py-3 pr-12 focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Helper functions
export const getIcon = (categoryName) => {
  const slug = categoryName.toLowerCase();
  return iconMap[slug] || iconMap.all;
};

export const getProductCount = (categoryName, products) => {
  if (categoryName === 'All') return products.length;
  return products.filter(p => p.category === categoryName).length;
};