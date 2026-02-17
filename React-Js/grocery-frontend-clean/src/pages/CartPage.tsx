import { useEffect, useState } from "react";
import { getCartItems, removeFromCart, updateCartItemQuantity } from "../services/cartService";
import { getCurrentUser } from "../services/authService";
import api from "../api/axiosConfig";
import "../styles/cart.css";

interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export default function CartPage({ goPayment, goToProducts }: any) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    loadCart();
    loadUserProfile();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const data = await getCartItems();
    setCart(data);
    setLoading(false);
  };

  const loadUserProfile = async () => {
    try {
      const response = await api.get(`/users/${user.userId}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        await removeFromCart(cartItemId);
        await loadCart(); // Reload cart after deletion
      } catch (error) {
        alert("Failed to remove item. Please try again.");
      }
    }
  };

  const handleDecreaseQuantity = async (item: any) => {
    if (item.quantity > 1) {
      try {
        await updateCartItemQuantity(item.cartItemId, item.quantity - 1);
        await loadCart();
      } catch (error) {
        alert("Failed to update quantity. Please try again.");
      }
    } else {
      handleRemoveItem(item.cartItemId);
    }
  };

  const handleIncreaseQuantity = async (item: any) => {
    try {
      await updateCartItemQuantity(item.cartItemId, item.quantity + 1);
      await loadCart();
    } catch (error) {
      alert("Failed to update quantity. Please try again.");
    }
  };

  const applyPromoCode = () => {
    const promoCodes: { [key: string]: number } = {
      "SAVE10": 10,
      "SAVE20": 20,
      "FIRST50": 50,
      "WELCOME": 15
    };

    const discountPercent = promoCodes[promoCode.toUpperCase()];
    if (discountPercent) {
      setDiscount(discountPercent);
      setPromoApplied(true);
    } else {
      alert("Invalid promo code");
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setDiscount(0);
    setPromoApplied(false);
  };

  const getProductImage = (product: any) => {
    if (product.description && product.description.startsWith('http')) {
      return product.description;
    }
    const imageMap: { [key: string]: string } = {
      'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      'Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
      'Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'
    };
    return imageMap[product.name] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading your cart...</h3>
      </div>
    );
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items to get started!</p>
      </div>
    );
  }

  const subtotal = cart.totalAmount || 0;
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + deliveryFee - discountAmount;

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <h2>🛒 My Cart</h2>
        <p>{cart.cartItems.length} item{cart.cartItems.length !== 1 ? 's' : ''}</p>
      </div>

      {/* User Details Section */}
      {userProfile && (
        <div className="user-details-section">
          <h3>👤 User Details</h3>
          <div className="user-info-card">
            <div className="user-info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{userProfile.name}</span>
            </div>
            <div className="user-info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userProfile.email}</span>
            </div>
            {userProfile.phoneNumber && (
              <div className="user-info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{userProfile.phoneNumber}</span>
              </div>
            )}
            {userProfile.address && (
              <div className="user-info-item">
                <span className="info-label">Registered Address:</span>
                <span className="info-value">{userProfile.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Address Section */}
      {userProfile && (
        <div className="user-details-section">
          <h3>📍 Delivery Address</h3>
          <div className="user-info-card">
            <p className="delivery-note">
              Your order will be delivered to the address you specify during checkout.
              You can use your registered address or provide a different delivery location.
            </p>
          </div>
        </div>
      )}

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items-section">
          {cart.cartItems.map((item: any) => (
            <div className="cart-item" key={item.cartItemId}>
              <div className="cart-item-image">
                <img
                  src={getProductImage(item.product)}
                  alt={item.product.name}
                />
              </div>

              <div className="cart-item-details">
                <h4 className="cart-item-name">{item.product.name}</h4>
                <p className="cart-item-description">{item.product.description}</p>
                
                <div className="cart-item-footer">
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => handleDecreaseQuantity(item)}>-</button>
                    <span className="quantity">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => handleIncreaseQuantity(item)}>+</button>
                  </div>
                  
                  <div className="cart-item-price">
                    <span className="price">₹{item.product.price * item.quantity}</span>
                  </div>
                </div>
              </div>

              <button className="remove-btn" onClick={() => handleRemoveItem(item.cartItemId)}>🗑️</button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span className={deliveryFee === 0 ? 'free-delivery' : ''}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          {deliveryFee === 0 && (
            <div className="free-delivery-note">
              🎉 You saved ₹40 on delivery!
            </div>
          )}

          {discount > 0 && (
            <div className="summary-row discount-row">
              <span>Discount ({discount}%)</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {/* Promo Code */}
          <div className="promo-section">
            <h4>Have a promo code?</h4>
            {!promoApplied ? (
              <div className="promo-input-group">
                <input
                  type="text"
                  className="promo-input"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <button className="apply-btn" onClick={applyPromoCode}>
                  Apply
                </button>
              </div>
            ) : (
              <div className="promo-applied">
                <span>✅ {promoCode} applied!</span>
                <button className="remove-promo-btn" onClick={removePromo}>✕</button>
              </div>
            )}
            <div className="promo-suggestions">
              <small>Try: SAVE10, SAVE20, FIRST50, WELCOME</small>
            </div>
          </div>

          {/* Checkout Button */}
          <button className="checkout-btn" onClick={() => goPayment(1)}>
            Proceed to Checkout
          </button>

          {/* Products Button */}
          {goToProducts && (
            <button className="products-btn" onClick={goToProducts}>
              🛒 Continue Shopping
            </button>
          )}

          {/* Payment Methods Preview */}
          <div className="payment-methods">
            <small>We accept:</small>
            <div className="payment-icons">
              <span>💳</span>
              <span>📱</span>
              <span>💵</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Banner */}
      <div className="offers-banner">
        <div className="offer-card">
          <span className="offer-icon">🎁</span>
          <div>
            <strong>Free Delivery</strong>
            <p>On orders above ₹500</p>
          </div>
        </div>
        <div className="offer-card">
          <span className="offer-icon">⚡</span>
          <div>
            <strong>Fast Delivery</strong>
            <p>Within 30 minutes</p>
          </div>
        </div>
        <div className="offer-card">
          <span className="offer-icon">🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <p>100% safe & secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
