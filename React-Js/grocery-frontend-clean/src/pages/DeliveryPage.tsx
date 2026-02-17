import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { getCurrentUser } from "../services/authService";
import "../styles/delivery.css";

export default function DeliveryPage({ orderId }: any) {
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("confirmed");
  const user = getCurrentUser();

  useEffect(() => {
    assignAndLoadDelivery();
  }, []);

  const assignAndLoadDelivery = async () => {
    try {
      // Assign delivery person
      await api.post(`/delivery/${orderId}`);
      
      // Wait a bit for the assignment to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch delivery details
      const response = await api.get(`/delivery/order/${orderId}`);
      setDelivery(response.data);
      setLoading(false);
      
      // Simulate delivery progress
      simulateDeliveryProgress();
    } catch (error) {
      console.error("Error loading delivery:", error);
      // Set default delivery info if API fails
      setDelivery({
        deliveryPerson: "Ravi",
        deliveryStatus: "ASSIGNED",
        estimatedTime: "30 minutes"
      });
      setLoading(false);
      simulateDeliveryProgress();
    }
  };

  const simulateDeliveryProgress = () => {
    setTimeout(() => setOrderStatus("preparing"), 3000);
    setTimeout(() => setOrderStatus("out_for_delivery"), 8000);
    setTimeout(() => setOrderStatus("nearby"), 15000);
  };

  const getEstimatedTime = () => {
    const times: { [key: string]: string } = {
      confirmed: "30 minutes",
      preparing: "25 minutes",
      out_for_delivery: "15 minutes",
      nearby: "5 minutes"
    };
    return times[orderStatus] || "30 minutes";
  };

  const getStatusMessage = () => {
    const messages: { [key: string]: string } = {
      confirmed: "Your order has been confirmed!",
      preparing: "Your order is being prepared",
      out_for_delivery: "Your order is on the way!",
      nearby: "Delivery person is nearby"
    };
    return messages[orderStatus] || "Order confirmed";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Setting up your delivery...</h3>
      </div>
    );
  }

  return (
    <div className="delivery-page">
      {/* Success Header */}
      <div className="delivery-header">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark">✓</div>
          </div>
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order, {user.userName}!</p>
        <div className="order-number">Order #{orderId || "12345"}</div>
      </div>

      {/* Delivery Status Timeline */}
      <div className="delivery-content">
        <div className="status-section">
          <h2>Delivery Status</h2>
          <div className="status-message">{getStatusMessage()}</div>
          
          <div className="timeline">
            <div className={`timeline-item ${orderStatus === "confirmed" || orderStatus === "preparing" || orderStatus === "out_for_delivery" || orderStatus === "nearby" ? "completed" : ""}`}>
              <div className="timeline-icon">✅</div>
              <div className="timeline-content">
                <h4>Order Confirmed</h4>
                <p>Your order has been received</p>
              </div>
            </div>

            <div className={`timeline-item ${orderStatus === "preparing" || orderStatus === "out_for_delivery" || orderStatus === "nearby" ? "completed" : orderStatus === "confirmed" ? "active" : ""}`}>
              <div className="timeline-icon">👨‍🍳</div>
              <div className="timeline-content">
                <h4>Preparing Order</h4>
                <p>Your items are being packed</p>
              </div>
            </div>

            <div className={`timeline-item ${orderStatus === "out_for_delivery" || orderStatus === "nearby" ? "completed" : orderStatus === "preparing" ? "active" : ""}`}>
              <div className="timeline-icon">🚚</div>
              <div className="timeline-content">
                <h4>Out for Delivery</h4>
                <p>On the way to your location</p>
              </div>
            </div>

            <div className={`timeline-item ${orderStatus === "nearby" ? "active" : ""}`}>
              <div className="timeline-icon">📍</div>
              <div className="timeline-content">
                <h4>Delivered</h4>
                <p>Enjoy your fresh groceries!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Person Card */}
        <div className="delivery-person-card">
          <div className="card-header">
            <h3>Your Delivery Partner</h3>
          </div>
          
          <div className="delivery-person-info">
            <div className="person-avatar">
              <span>👤</span>
            </div>
            <div className="person-details">
              <h4>{delivery?.deliveryPerson || "Ravi"}</h4>
              <div className="rating">
                ⭐⭐⭐⭐⭐ <span>4.8</span>
              </div>
              <p className="delivery-count">500+ deliveries</p>
            </div>
          </div>

          <div className="eta-section">
            <div className="eta-icon">⏱️</div>
            <div className="eta-info">
              <div className="eta-label">Estimated Delivery</div>
              <div className="eta-time">{getEstimatedTime()}</div>
            </div>
          </div>

          <div className="contact-buttons">
            <button className="contact-btn call-btn">
              📞 Call
            </button>
            <button className="contact-btn message-btn">
              💬 Message
            </button>
          </div>
        </div>

        {/* Live Tracking Map Placeholder */}
        <div className="map-section">
          <h3>Live Tracking</h3>
          <div className="map-placeholder">
            <div className="map-marker">📍</div>
            <div className="delivery-route">
              <div className="route-line"></div>
              <div className="delivery-truck">🚚</div>
            </div>
            <p>Your delivery is on the way!</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h3>Order Summary</h3>
          <div className="summary-card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹350</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="free">FREE</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total Paid</span>
              <span>₹350</span>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h4>Need Help?</h4>
          <p>Contact our customer support for any assistance</p>
          <button className="help-btn">📞 Contact Support</button>
        </div>
      </div>
    </div>
  );
}
