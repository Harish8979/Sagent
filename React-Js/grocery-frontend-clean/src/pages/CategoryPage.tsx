import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/categoryService';
import '../styles/category.css';

interface Category {
  categoryId: number;
  categoryName: string;
}

interface CategoryPageProps {
  onCategorySelect?: (categoryId: number) => void;
  goToCart?: () => void;
  goToProducts?: () => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ onCategorySelect, goToCart, goToProducts }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'Groceries': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
      'Cooking Essentials': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      'Vegetables & Fruits': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400',
      'Pulses & Lentils': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
      'Spices & Condiments': 'https://images.unsplash.com/photo-1596040033229-a0b13b1f8e1f?w=400',
      'Beverages': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400'
    };
    return imageMap[categoryName] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
  };

  const handleCategoryClick = (categoryId: number) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="header-content">
          <h1>🛒 Grocery Delivery App</h1>
          <p className="delivery-time">⚡ 30 Mins delivery</p>
        </div>
        <button className="cart-icon-btn" onClick={goToCart}>🛒</button>
      </div>

      <div className="welcome-section">
        <h2>Hello, {user.name || 'Guest'}! 👋</h2>
        <p>What would you like to order today?</p>
      </div>

      <div className="search-section">
        <input 
          type="text" 
          placeholder="🔍 Search for products..."
          className="search-input"
          onClick={goToProducts}
        />
      </div>

      <div className="category-section">
        <h3 className="section-header">SHOP BY CATEGORY</h3>
        <div className="category-grid">
          {categories.map((category) => (
            <div 
              key={category.categoryId} 
              className="category-card"
              onClick={() => handleCategoryClick(category.categoryId)}
            >
              <div className="category-image-container">
                <img 
                  src={getCategoryImage(category.categoryName)} 
                  alt={category.categoryName}
                  className="category-image"
                />
              </div>
              <p className="category-name">{category.categoryName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
