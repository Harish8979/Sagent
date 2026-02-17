import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryService";
import "../styles/category.css";

interface Category {
  categoryId: number;
  name: string;
  icon?: string;
}

interface CategoryNavProps {
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategory: number | null;
}

export default function CategoryNav({ onCategorySelect, selectedCategory }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  // All categories use the same box emoji
  const categoryIcons: { [key: string]: string } = {
    "Groceries": "📦",
    "Dairy": "📦",
    "Cooking Essentials": "📦",
    "Vegetables & Fruits": "📦",
    "Pulses & Lentils": "📦",
    "Spices & Condiments": "📦",
    "Beverages": "📦",
    "Snacks": "📦"
  };

  return (
    <div className="category-nav">
      <div className="category-scroll">
        <button
          className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onCategorySelect(null)}
        >
          <span className="category-icon">🛒</span>
          <span>All</span>
        </button>
        
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            className={`category-chip ${selectedCategory === cat.categoryId ? 'active' : ''}`}
            onClick={() => onCategorySelect(cat.categoryId)}
          >
            <span className="category-icon">
              {categoryIcons[cat.name] || "📦"}
            </span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
