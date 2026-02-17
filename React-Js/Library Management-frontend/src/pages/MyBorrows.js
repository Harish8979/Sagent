import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import borrowService from '../services/borrowService';
import './MyBorrows.css';

function MyBorrows() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBorrows();
  }, [user]);

  const loadBorrows = async () => {
    try {
      const response = await borrowService.getBorrowRecordsByMember(user.memberId);
      setBorrows(response.data);
    } catch (err) {
      console.error('Error loading borrows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (recordId) => {
    if (window.confirm('Are you sure you want to cancel this borrow?')) {
      try {
        await borrowService.cancelBorrow(recordId);
        alert('Borrow cancelled successfully');
        loadBorrows();
      } catch (err) {
        alert(err.response?.data || 'Failed to cancel borrow');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your borrows...</p>
      </div>
    );
  }

  return (
    <div className="my-borrows">
      <div className="card">
        <h2>My Borrowed Books</h2>
        
        {borrows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No borrowed books</h3>
            <p>You haven't borrowed any books yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrows.map((borrow) => (
                  <tr key={borrow.id}>
                    <td>{borrow.bookTitle}</td>
                    <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                    <td>{borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge status-${borrow.status.toLowerCase()}`}>
                        {borrow.status}
                      </span>
                    </td>
                    <td>
                      {borrow.status === 'BORROWED' && (
                        <button
                          onClick={() => handleCancel(borrow.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBorrows;
