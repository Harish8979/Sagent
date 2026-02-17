import { useState, useEffect } from "react";
import { makePayment } from "../services/paymentService";
import { placeOrder } from "../services/orderService";
import { getCurrentUser, getUserById } from "../services/authService";
import { addressService, Address } from "../services/addressService";
import api from "../api/axiosConfig";
import "../styles/payment.css";

interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export default function PaymentPage({ orderId, goDelivery, goToProducts }: any) {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState("");
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [deliverySchedule, setDeliverySchedule] = useState("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const user = getCurrentUser();

  useEffect(() => {
    // Load user's saved addresses
    const loadUserAddresses = async () => {
      if (user.userId) {
        try {
          const addresses = await addressService.getUserAddresses(Number(user.userId));
          setSavedAddresses(addresses);
          
          // Set first address as default if available
          if (addresses.length > 0) {
            const defaultAddr = addresses[0];
            setSelectedAddressId(defaultAddr.addressId);
            setAddress(addressService.formatAddress(defaultAddr));
          }
        } catch (error) {
          console.error("Error loading addresses:", error);
        }
      }
    };

    // Load user profile
    const loadUserProfile = async () => {
      try {
        const response = await api.get(`/users/${user.userId}`);
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserAddresses();
    loadUserProfile();
  }, [user.userId]);

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: "💳" },
    { id: "upi", name: "UPI", icon: "📱" },
    { id: "wallet", name: "Wallet", icon: "👛" },
    { id: "cod", name: "Cash on Delivery", icon: "💵" }
  ];

  const handlePayment = async () => {
    if (!address.trim()) {
      alert("Please enter your delivery address");
      return;
    }

    if (deliverySchedule === "scheduled" && (!scheduledDate || !scheduledTime)) {
      alert("Please select delivery date and time");
      return;
    }

    setProcessing(true);
    
    try {
      // Place order first with address
      const orderResponse = await placeOrder(user.userId, address);
      const newOrderId = orderResponse.data.orderId;
      
      if (!newOrderId) {
        throw new Error("Failed to create order");
      }
      
      // Process payment
      await makePayment(newOrderId);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For COD, show delivery details immediately
      if (selectedMethod === "cod") {
        // Get existing delivery details (already created by OrderService)
        await new Promise(resolve => setTimeout(resolve, 500));
        const deliveryResponse = await api.get(`/delivery/order/${newOrderId}`);
        
        setDeliveryDetails({
          deliveryPerson: deliveryResponse.data?.deliveryPerson || "Ravi",
          estimatedTime: deliverySchedule === "immediate" ? "30-45 minutes" : `${scheduledDate} at ${scheduledTime}`,
          phone: "9876543210"
        });
        setShowDeliveryInfo(true);
        setProcessing(false);
      } else {
        goDelivery(newOrderId);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Payment failed. Please try again.";
      alert(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="payment-page">
      {/* Header */}
      <div className="payment-header">
        <h2>💳 Payment</h2>
        <p>Choose your preferred payment method</p>
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

      <div className="payment-content">
        {/* Delivery Address Section */}
        <div className="payment-methods-section">
          <h3>📍 Delivery Address</h3>
          
          {savedAddresses.length > 0 ? (
            <>
              <div className="address-options">
                <label className="address-option">
                  <input
                    type="radio"
                    name="addressType"
                    checked={useDefaultAddress}
                    onChange={() => {
                      setUseDefaultAddress(true);
                      if (selectedAddressId) {
                        const addr = savedAddresses.find(a => a.addressId === selectedAddressId);
                        if (addr) setAddress(addressService.formatAddress(addr));
                      }
                    }}
                  />
                  <div className="address-option-content">
                    <strong>🏠 Use Saved Address</strong>
                    <p className="default-address-text">Select from your saved addresses</p>
                  </div>
                </label>
                
                <label className="address-option">
                  <input
                    type="radio"
                    name="addressType"
                    checked={!useDefaultAddress}
                    onChange={() => {
                      setUseDefaultAddress(false);
                      setAddress("");
                    }}
                  />
                  <div className="address-option-content">
                    <strong>📍 Enter New Address</strong>
                  </div>
                </label>
              </div>
              
              {useDefaultAddress && (
                <div className="saved-addresses-list">
                  {savedAddresses.map((addr) => (
                    <label key={addr.addressId} className="saved-address-card">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.addressId}
                        onChange={() => {
                          setSelectedAddressId(addr.addressId);
                          setAddress(addressService.formatAddress(addr));
                        }}
                      />
                      <div className="saved-address-content">
                        <div className="address-type-badge">{addr.addressType}</div>
                        <div className="address-details">
                          <strong>{addr.houseNo}, {addr.street}</strong>
                          <p>{addr.area}, {addr.city}</p>
                          <p>{addr.state} - {addr.pincode}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </>
          ) : null}
          
          {(!useDefaultAddress || savedAddresses.length === 0) && (
            <div className="address-form">
              {savedAddresses.length === 0 && (
                <p className="no-address-text">No saved addresses found. Please enter your delivery address:</p>
              )}
              <textarea
                className="address-input"
                placeholder="Enter your complete delivery address (House/Flat No, Street, Area, City, Pincode)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Delivery Schedule */}
        <div className="payment-methods-section">
          <h3>🕐 Delivery Schedule</h3>
          
          <div className="address-options">
            <label className="address-option">
              <input
                type="radio"
                name="deliverySchedule"
                checked={deliverySchedule === "immediate"}
                onChange={() => setDeliverySchedule("immediate")}
              />
              <div className="address-option-content">
                <strong>⚡ Immediate Delivery</strong>
                <p className="default-address-text">Get your order in 30-45 minutes</p>
              </div>
            </label>
            
            <label className="address-option">
              <input
                type="radio"
                name="deliverySchedule"
                checked={deliverySchedule === "scheduled"}
                onChange={() => setDeliverySchedule("scheduled")}
              />
              <div className="address-option-content">
                <strong>📅 Schedule Delivery</strong>
                <p className="default-address-text">Choose your preferred date and time</p>
              </div>
            </label>
          </div>
          
          {deliverySchedule === "scheduled" && (
            <div className="schedule-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Time</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="time-select"
                  >
                    <option value="">Select time</option>
                    <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                    <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                    <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                    <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                    <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                    <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section">
          <h3>Select Payment Method</h3>
          
          <div className="payment-methods-grid">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method-card ${
                  selectedMethod === method.id ? "selected" : ""
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="method-icon">{method.icon}</div>
                <div className="method-name">{method.name}</div>
                <div className="radio-indicator">
                  {selectedMethod === method.id && "✓"}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Form based on selected method */}
          <div className="payment-form">
            {selectedMethod === "card" && (
              <div className="card-form">
                <h4>Card Details</h4>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" placeholder="123" maxLength={3} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="John Doe" />
                </div>
              </div>
            )}

            {selectedMethod === "upi" && (
              <div className="upi-form">
                <h4>UPI Payment</h4>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input type="text" placeholder="yourname@upi" />
                </div>
                <div className="upi-apps">
                  <button className="upi-app-btn">Google Pay</button>
                  <button className="upi-app-btn">PhonePe</button>
                  <button className="upi-app-btn">Paytm</button>
                </div>
              </div>
            )}

            {selectedMethod === "wallet" && (
              <div className="wallet-form">
                <h4>Select Wallet</h4>
                <div className="wallet-options">
                  <button className="wallet-btn">Paytm Wallet</button>
                  <button className="wallet-btn">Amazon Pay</button>
                  <button className="wallet-btn">PhonePe Wallet</button>
                </div>
              </div>
            )}

            {selectedMethod === "cod" && (
              <div className="cod-info">
                <div className="info-icon">ℹ️</div>
                <h4>Cash on Delivery</h4>
                <p>Pay with cash when your order is delivered to your doorstep.</p>
                <ul>
                  <li>Have exact change ready</li>
                  <li>Additional ₹20 COD charges apply</li>
                  <li>Payment accepted in cash only</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="payment-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-item">
            <span>Subtotal</span>
            <span>₹350</span>
          </div>
          <div className="summary-item">
            <span>Delivery</span>
            <span className="free">FREE</span>
          </div>
          {selectedMethod === "cod" && (
            <div className="summary-item">
              <span>COD Charges</span>
              <span>₹20</span>
            </div>
          )}
          
          <div className="summary-divider"></div>
          
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{selectedMethod === "cod" ? "370" : "350"}</span>
          </div>

          <button
            className="pay-button"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `Pay ₹${selectedMethod === "cod" ? "370" : "350"}`
            )}
          </button>

          {/* Products Button */}
          {goToProducts && (
            <button className="products-btn" onClick={goToProducts}>
              🛒 Back to Products
            </button>
          )}

          <div className="secure-payment">
            <span>🔒</span>
            <span>Secure Payment</span>
          </div>
        </div>
      </div>

      {/* Delivery Info Modal */}
      {showDeliveryInfo && deliveryDetails && (
        <div className="delivery-modal-overlay">
          <div className="delivery-modal">
            <div className="modal-header">
              <h2>✅ Order Placed Successfully!</h2>
              <p>Your order has been confirmed</p>
            </div>
            
            <div className="delivery-info-card">
              <div className="info-section">
                <div className="info-icon">👨‍🚀</div>
                <div className="info-content">
                  <h4>Delivery Partner</h4>
                  <p className="info-value">{deliveryDetails.deliveryPerson}</p>
                </div>
              </div>
              
              <div className="info-section">
                <div className="info-icon">🕐</div>
                <div className="info-content">
                  <h4>Estimated Delivery Time</h4>
                  <p className="info-value">{deliveryDetails.estimatedTime}</p>
                </div>
              </div>
              
              <div className="info-section">
                <div className="info-icon">📞</div>
                <div className="info-content">
                  <h4>Contact Number</h4>
                  <p className="info-value">{deliveryDetails.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="track-order-btn"
                onClick={() => {
                  setShowDeliveryInfo(false);
                  goDelivery(orderId);
                }}
              >
                Track Order 📍
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
