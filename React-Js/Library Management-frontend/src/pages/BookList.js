import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookService from '../services/bookService';
import './BookList.css';

function BookList() {
  const navigate = useNavigate();
  const { user, canManageBooks, canBorrow } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getAllBooks();
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load books. Please make sure the backend server is running.');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(id);
        loadBooks();
      } catch (err) {
        alert('Failed to delete book');
        console.error('Error deleting book:', err);
      }
    }
  };

  const markAsDamaged = async (id) => {
    if (window.confirm('Mark this book as damaged?')) {
      try {
        await bookService.updateBook(id, { status: 'DAMAGED' });
        loadBooks();
      } catch (err) {
        alert('Failed to update book status');
      }
    }
  };

  const handleBorrow = (bookId) => {
    if (!user) {
      alert('Please login to borrow books');
      navigate('/login');
      return;
    }
    navigate(`/borrow-book/${bookId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      <div className="card">
        <div className="flex justify-between align-center mb-20">
          <h2>All Books</h2>
          {canManageBooks() && (
            <Link to="/add-book" className="btn btn-success">
              + Add New Book
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No books found</h3>
            <p>Start by adding your first book to the library</p>
            <Link to="/add-book" className="btn btn-primary mt-20">
              Add Your First Book
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Published Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td>{book.id}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.publishedYear}</td>
                    <td>
                      <span className={`status-badge status-${book.status?.toLowerCase() || 'available'}`}>
                        {book.status || 'AVAILABLE'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {canBorrow() && book.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleBorrow(book.id)}
                            className="btn btn-success btn-sm"
                          >
                            Borrow
                          </button>
                        )}
                        {canManageBooks() && (
                          <>
                            <Link
                              to={`/edit-book/${book.id}`}
                              className="btn btn-warning btn-sm"
                            >
                              Edit
                            </Link>
                            {book.status === 'AVAILABLE' && (
                              <button
                                onClick={() => markAsDamaged(book.id)}
                                className="btn btn-secondary btn-sm"
                              >
                                Mark Damaged
                              </button>
                            )}
                            <button
                              onClick={() => deleteBook(book.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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

export default BookList;
