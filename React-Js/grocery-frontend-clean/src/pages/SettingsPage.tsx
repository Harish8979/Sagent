import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";
import api from "../api/axiosConfig";
import "../styles/settings.css";

interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function SettingsPage({ goBack }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const user = getCurrentUser();

  useEffect(() => {
    loadProfile();
    loadTheme();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${user.userId}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/${user.userId}`, formData);
      setProfile({ ...profile!, ...formData });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
        <h2>⚙️ Settings</h2>
        <div></div>
      </div>

      {/* Theme Section */}
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">{theme === 'light' ? '☀️' : '🌙'}</span>
            <div>
              <h4>Theme</h4>
              <p>Switch between light and dark mode</p>
            </div>
          </div>
          <label className="theme-toggle">
            <input 
              type="checkbox" 
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Profile Section */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Profile Information</h3>
          {!isEditing && (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <span className="info-icon">👤</span>
              <div>
                <label>Name</label>
                <p>{profile?.name || "Not provided"}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <label>Email</label>
                <p>{profile?.email || "Not provided"}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <label>Phone</label>
                <p>{profile?.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <label>Address</label>
                <p>{profile?.address || "Not provided"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Settings */}
      <div className="settings-section">
        <h3>Other Settings</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">🔔</span>
            <div>
              <h4>Notifications</h4>
              <p>Manage notification preferences</p>
            </div>
          </div>
          <label className="theme-toggle">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">🔒</span>
            <div>
              <h4>Privacy</h4>
              <p>Manage your privacy settings</p>
            </div>
          </div>
          <span className="arrow">›</span>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">❓</span>
            <div>
              <h4>Help & Support</h4>
              <p>Get help with your account</p>
            </div>
          </div>
          <span className="arrow">›</span>
        </div>
      </div>

      {/* Logout Button */}
      <div className="settings-section">
        <button className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
