import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";
import api from "../api/axiosConfig";
import "../styles/profile.css";

interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export default function ProfilePage({ goToOrders, goToOffers, goToSettings, goBack }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${user.userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h2>My Profile</h2>
        <button className="settings-btn" onClick={goToSettings}>
          ⚙️
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
        <h3>{profile?.name || "User"}</h3>
        <p className="profile-email">{profile?.email}</p>
      </div>

      {/* Profile Details */}
      <div className="profile-details">
        <div className="detail-item">
          <span className="detail-icon">📧</span>
          <div className="detail-content">
            <label>Email</label>
            <p>{profile?.email || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📱</span>
          <div className="detail-content">
            <label>Phone</label>
            <p>{profile?.phoneNumber || "Not provided"}</p>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">📍</span>
          <div className="detail-content">
            <label>Address</label>
            <p>{profile?.address || "Not provided"}</p>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="profile-menu">
        <button className="menu-item" onClick={goToOrders}>
          <span className="menu-icon">📦</span>
          <div className="menu-content">
            <h4>My Orders</h4>
            <p>View your order history</p>
          </div>
          <span className="menu-arrow">›</span>
        </button>

        <button className="menu-item" onClick={goToOffers}>
          <span className="menu-icon">🎁</span>
          <div className="menu-content">
            <h4>My Offers</h4>
            <p>View available offers and deals</p>
          </div>
          <span className="menu-arrow">›</span>
        </button>

        <button className="menu-item" onClick={goToSettings}>
          <span className="menu-icon">⚙️</span>
          <div className="menu-content">
            <h4>Settings</h4>
            <p>Manage your account settings</p>
          </div>
          <span className="menu-arrow">›</span>
        </button>
      </div>
    </div>
  );
}
