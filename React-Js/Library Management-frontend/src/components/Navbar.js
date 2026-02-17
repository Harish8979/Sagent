import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isLibrarian, canBorrow } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          📚 Library Management
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          {user && (
            <>
              <li className="navbar-item">
                <Link to="/books" className="navbar-link">Books</Link>
              </li>
              {canBorrow() && (
                <li className="navbar-item">
                  <Link to="/my-borrows" className="navbar-link">My Borrows</Link>
                </li>
              )}
              {isLibrarian() && (
                <>
                  <li className="navbar-item">
                    <Link to="/add-book" className="navbar-link">Add Book</Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/borrow-history" className="navbar-link">History</Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
        <div className="navbar-user">
          {user ? (
            <>
              <span className="user-info">
                👤 {user.fullName} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Login</Link>
              <Link to="/register" className="btn-register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
