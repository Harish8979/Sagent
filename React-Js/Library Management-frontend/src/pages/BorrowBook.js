import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookService from '../services/bookService';
import borrowService from '../services/borrowService';
import './BorrowBook.css';

function BorrowBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBook();
  }, [id, user]);

  const loadBook = async () => {
    try {
      const response = await bookService.getBookById(id);
      setBook(response.data);
    } catch (err) {
      alert('Failed to load book details');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!user.memberId) {
      alert('Member information not found. Please contact administrator.');
      return;
    }

    setBorrowing(true);
    try {
      await borrowService.borrowBook({
        bookId: book.id,
        memberId: user.memberId
      });
      alert('Book borrowed successfully!');
      navigate('/my-borrows');
    } catch (err) {
      alert(err.response?.data || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 14);

  return (
    <div className="borrow-book">
      <div className="card">
        <h2 className="page-title">Borrow Book</h2>
        
        <div className="borrow-details">
          <div className="detail-section">
            <h3>📚 Book Details</h3>
            <div className="detail-row">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{book.title}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Author:</span>
              <span className="detail-value">{book.author}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ISBN:</span>
              <span className="detail-value">{book.isbn}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Published Year:</span>
              <span className="detail-value">{book.publishedYear}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${book.status.toLowerCase()}`}>
                {book.status}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>👤 Member Details</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{user.fullName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member ID:</span>
              <span className="detail-value">{user.memberIdString}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{user.role}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>📅 Borrow Information</h3>
            <div className="detail-row">
              <span className="detail-label">Borrow Date:</span>
              <span className="detail-value">{today.toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Due Date:</span>
              <span className="detail-value">{dueDate.toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Loan Period:</span>
              <span className="detail-value">14 days</span>
            </div>
          </div>
        </div>

        {book.status !== 'AVAILABLE' && (
          <div className="alert alert-error">
            This book is currently {book.status.toLowerCase()} and cannot be borrowed.
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={handleBorrow}
            className="btn btn-success"
            disabled={borrowing || book.status !== 'AVAILABLE'}
          >
            {borrowing ? 'Borrowing...' : 'Confirm Borrow'}
          </button>
          <button
            onClick={() => navigate('/books')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BorrowBook;
