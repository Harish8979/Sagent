import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user, canManageBooks } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">
          Welcome to Library Management System
        </h1>
        <p className="hero-subtitle">
          {user ? `Hello, ${user.fullName}! ` : ''}Manage your books efficiently with our modern and intuitive interface
        </p>
        <div className="hero-buttons">
          {user ? (
            <>
              <Link to="/books" className="btn btn-primary btn-large">
                View All Books
              </Link>
              {canManageBooks() && (
                <Link to="/add-book" className="btn btn-success btn-large">
                  Add New Book
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-large">
                Login
              </Link>
              <Link to="/register" className="btn btn-success btn-large">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Manage Books</h3>
          <p>Add, edit, and delete books from your library collection</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Search & Filter</h3>
          <p>Easily find books by title, author, or ISBN</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Track Inventory</h3>
          <p>Keep track of available and borrowed books</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
