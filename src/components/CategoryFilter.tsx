
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  englishName: string;
  icon: LucideIcon;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`sidebar-item w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            activeCategory === category.id 
              ? 'bg-green-100 text-green-700' 
              : 'hover:bg-gray-100'
          }`}
          aria-current={activeCategory === category.id ? 'page' : undefined}
        >
          <category.icon size={18} />
          <span className="tamil">{category.name}</span>
          <span className="sr-only">{category.englishName}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
