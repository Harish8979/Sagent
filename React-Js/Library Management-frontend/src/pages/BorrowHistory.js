import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import borrowService from '../services/borrowService';
import './BorrowHistory.css';

function BorrowHistory() {
  const navigate = useNavigate();
  const { user, isLibrarian } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isLibrarian()) {
      navigate('/');
      return;
    }
    loadBorrows();
  }, [user]);

  const loadBorrows = async () => {
    try {
      const response = await borrowService.getAllBorrowRecords();
      setBorrows(response.data);
    } catch (err) {
      console.error('Error loading borrow history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBorrows = borrows.filter(borrow => {
    if (filter === 'ALL') return true;
    return borrow.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading borrow history...</p>
      </div>
    );
  }

  return (
    <div className="borrow-history">
      <div className="card">
        <div className="flex justify-between align-center mb-20">
          <h2>All Borrow History</h2>
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select
              className="form-control filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="BORROWED">Borrowed</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
        </div>
        
        {filteredBorrows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No borrow records found</h3>
            <p>No books have been borrowed yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Member Name</th>
                  <th>Book Title</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBorrows.map((borrow) => (
                  <tr key={borrow.id}>
                    <td>{borrow.id}</td>
                    <td>{borrow.memberName}</td>
                    <td>{borrow.bookTitle}</td>
                    <td>{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                    <td>{new Date(borrow.dueDate).toLocaleDateString()}</td>
                    <td>{borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge status-${borrow.status.toLowerCase()}`}>
                        {borrow.status}
                      </span>
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

export default BorrowHistory;
