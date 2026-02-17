import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "../styles/offers.css";

interface Offer {
  offerId: number;
  title: string;
  description: string;
  discountPercent: number;
  code: string;
  validUntil: string;
  minOrderAmount: number;
}

export default function OffersPage({ goBack }: any) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await api.get('/offers');
      setOffers(response.data);
    } catch (error) {
      console.error("Error loading offers:", error);
      // Set default offers if API fails
      setOffers([
        {
          offerId: 1,
          title: "First Order Discount",
          description: "Get 20% off on your first order. Valid for new users only.",
          discountPercent: 20,
          code: "FIRST20",
          validUntil: "2026-12-31",
          minOrderAmount: 200
        },
        {
          offerId: 2,
          title: "Weekend Special",
          description: "Enjoy 15% off on all orders above ₹500 during weekends.",
          discountPercent: 15,
          code: "WEEKEND15",
          validUntil: "2026-12-31",
          minOrderAmount: 500
        },
        {
          offerId: 3,
          title: "Mega Saver",
          description: "Save ₹100 on orders above ₹1000. Shop more, save more!",
          discountPercent: 10,
          code: "SAVE100",
          validUntil: "2026-12-31",
          minOrderAmount: 1000
        },
        {
          offerId: 4,
          title: "Free Delivery",
          description: "Get free delivery on all orders above ₹300. No code needed.",
          discountPercent: 0,
          code: "FREEDEL",
          validUntil: "2026-12-31",
          minOrderAmount: 300
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="offers-page">
        <div className="loading">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      {/* Header */}
      <div className="offers-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h2>🎁 My Offers</h2>
        <div></div>
      </div>

      {/* Offers List */}
      <div className="offers-container">
        {offers.length === 0 ? (
          <div className="no-offers">
            <div className="no-offers-icon">🎁</div>
            <h3>No Offers Available</h3>
            <p>Check back later for exciting deals</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.offerId} className="offer-card">
              <div className="offer-badge">
                {offer.discountPercent > 0 ? `${offer.discountPercent}% OFF` : "SPECIAL"}
              </div>
              
              <div className="offer-content">
                <h3>{offer.title}</h3>
                <p className="offer-description">{offer.description}</p>
                
                <div className="offer-details">
                  <div className="offer-detail">
                    <span className="detail-label">Min Order:</span>
                    <span className="detail-value">₹{offer.minOrderAmount}</span>
                  </div>
                  <div className="offer-detail">
                    <span className="detail-label">Valid Until:</span>
                    <span className="detail-value">{formatDate(offer.validUntil)}</span>
                  </div>
                </div>

                <div className="offer-code-section">
                  <div className="code-box">
                    <span className="code-label">Code:</span>
                    <span className="code-value">{offer.code}</span>
                  </div>
                  <button 
                    className="copy-btn"
                    onClick={() => copyCode(offer.code)}
                  >
                    {copiedCode === offer.code ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
