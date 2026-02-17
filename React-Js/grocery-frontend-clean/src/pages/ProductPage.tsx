import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { getProductsByCategory } from "../services/categoryService";
import { addToCart } from "../services/cartService";
import { getCurrentUser } from "../services/authService";
import CategoryNav from "../components/CategoryNav";
import SearchBar from "../components/SearchBar";
import "../styles/product.css";

export default function ProductPage({ goCart, goToProfile }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const user = getCurrentUser();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    setFilteredProducts(data);
  };

  const loadCategoryProducts = async (categoryId: number) => {
    const data = await getProductsByCategory(categoryId);
    setProducts(data);
    setFilteredProducts(data);
  };

  const handleCategorySelect = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      const data = await getProducts();
      setProducts(data);
    } else {
      const data = await getProductsByCategory(categoryId);
      setProducts(data);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  const add = async (id: number) => {
    await addToCart(id);
    setCartCount(cartCount + 1);
    // Show toast notification instead of alert
    showToast("Added to cart! 🛒");
  };

  const showToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  // Product image mapping with specific images for each product
  const getProductImage = (product: any) => {
    // If description is a URL, use it; otherwise use placeholder
    if (product.description && product.description.startsWith('http')) {
      return product.description;
    }
    // Specific images for each product
    const imageMap: { [key: string]: string } = {
      // Grains & Cereals
      'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'Wheat Flour': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
      'Oats': 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400',
      'Quinoa': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      
      // Dairy Products
      'Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      'Yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      'Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
      'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
      'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      
      // Cooking Oils
      'Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      'Olive Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      'Coconut Oil': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400',
      'Mustard Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
      
      // Vegetables & Fruits
      'Tomatoes': 'https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400',
      'Onions': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
      'Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
      'Apples': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      'Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      'Carrots': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
      
      // Pulses & Lentils
      'Toor Dal': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
      'Moong Dal': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
      'Chana Dal': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
      'Rajma': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      
      // Spices & Condiments
      'Turmeric Powder': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400',
      'Red Chili Powder': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400',
      'Cumin Seeds': 'https://images.unsplash.com/photo-1596040033229-a0b3b83b6aec?w=400',
      'Salt': 'https://images.unsplash.com/photo-1598781430746-5f1d9e6e6e1e?w=400',
      'Sugar': 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400',
      
      // Beverages
      'Tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
      'Coffee': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
      'Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      
      // Snacks
      'Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
      'Chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
      'Namkeen': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'
    };
    return imageMap[product.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
  };

  return (
    <div className="product-page">
      {/* Header with user info and cart */}
      <div className="product-header">
        <div className="header-content">
          <button className="profile-icon-btn" onClick={goToProfile}>
            👤
          </button>
          <div className="user-greeting">
            <h2>Hello, {user.userName || 'Guest'}! 👋</h2>
            <p>Shop Your Daily Necessary</p>
          </div>
          <button className="cart-icon-btn" onClick={goCart}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={setSearchQuery} />

      {/* Category Navigation */}
      <CategoryNav 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* Products Grid */}
      <div className="products-container">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <div className="product-card" key={p.productId}>
                <div className="product-image-container">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    className="product-img"
                  />
                  {p.status === 'AVAILABLE' && (
                    <span className="status-badge">In Stock</span>
                  )}
                </div>

                <div className="product-info">
                  <h4 className="product-name">{p.name}</h4>
                  <p className="product-description">{p.description}</p>
                  
                  <div className="product-footer">
                    <div className="price-container">
                      <span className="price">₹{p.price}</span>
                      <span className="price-unit">/unit</span>
                    </div>
                    
                    <button
                      className="add-to-cart-btn"
                      onClick={() => add(p.productId)}
                      disabled={p.status !== 'AVAILABLE'}
                    >
                      <span>+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <button className="floating-cart-btn" onClick={goCart}>
        <span>View Cart</span>
        {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
      </button>
    </div>
  );
}
