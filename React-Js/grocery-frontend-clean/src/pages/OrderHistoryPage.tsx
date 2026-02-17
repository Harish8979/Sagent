import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";
import api from "../api/axiosConfig";
import "../styles/orderHistory.css";

interface Order {
  orderId: number;
  orderDate: string;
  totalAmount: number;
  finalAmount: number;
  status: string;
  deliveryAddress: string;
}

export default function OrderHistoryPage({ goBack }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get(`/orders/user/${user.userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED': return 'status-placed';
      case 'CONFIRMED': return 'status-confirmed';
      case 'OUT_FOR_DELIVERY': return 'status-delivery';
      case 'DELIVERED': return 'status-delivered';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="order-history-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      {/* Header */}
      <div className="order-history-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h2>📦 My Orders</h2>
        <div></div>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>Start shopping to see your orders here</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="order-label">Order #</span>
                  <span className="order-number">{order.orderId}</span>
                </div>
                <span className={`order-status ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="order-detail-item">
                  <span className="detail-icon">📅</span>
                  <div>
                    <label>Order Date</label>
                    <p>{formatDate(order.orderDate)}</p>
                  </div>
                </div>

                <div className="order-detail-item">
                  <span className="detail-icon">📍</span>
                  <div>
                    <label>Delivery Address</label>
                    <p>{order.deliveryAddress}</p>
                  </div>
                </div>

                <div className="order-detail-item">
                  <span className="detail-icon">💰</span>
                  <div>
                    <label>Total Amount</label>
                    <p className="order-amount">₹{order.finalAmount}</p>
                  </div>
                </div>
              </div>

              <div className="order-footer">
                <button className="view-details-btn">View Details</button>
                <button className="reorder-btn">Reorder</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
