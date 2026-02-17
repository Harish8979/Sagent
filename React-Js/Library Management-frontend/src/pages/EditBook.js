import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookService from '../services/bookService';
import './AddBook.css';

function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, canManageBooks } = useAuth();
  const [book, setBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      alert('Please login to access this page');
      navigate('/login');
      return;
    }
    if (!canManageBooks()) {
      alert('Only librarians can edit books');
      navigate('/');
      return;
    }
    loadBook();
  }, [id, user, canManageBooks, navigate]);

  const loadBook = async () => {
    try {
      const response = await bookService.getBookById(id);
      setBook(response.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load book details');
      console.error('Error loading book:', err);
      navigate('/books');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!book.title.trim()) newErrors.title = 'Title is required';
    if (!book.author.trim()) newErrors.author = 'Author is required';
    if (!book.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (!book.publishedYear) {
      newErrors.publishedYear = 'Published year is required';
    } else if (book.publishedYear < 1000 || book.publishedYear > new Date().getFullYear()) {
      newErrors.publishedYear = 'Please enter a valid year';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await bookService.updateBook(id, book);
      alert('Book updated successfully!');
      navigate('/books');
    } catch (err) {
      alert('Failed to update book');
      console.error('Error updating book:', err);
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

  return (
    <div className="add-book">
      <div className="card">
        <h2 className="form-title">Edit Book</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-control ${errors.title ? 'error' : ''}`}
              value={book.title}
              onChange={handleChange}
              placeholder="Enter book title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              name="author"
              className={`form-control ${errors.author ? 'error' : ''}`}
              value={book.author}
              onChange={handleChange}
              placeholder="Enter author name"
            />
            {errors.author && <span className="error-message">{errors.author}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              className={`form-control ${errors.isbn ? 'error' : ''}`}
              value={book.isbn}
              onChange={handleChange}
              placeholder="Enter ISBN number"
            />
            {errors.isbn && <span className="error-message">{errors.isbn}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="publishedYear">Published Year *</label>
            <input
              type="number"
              id="publishedYear"
              name="publishedYear"
              className={`form-control ${errors.publishedYear ? 'error' : ''}`}
              value={book.publishedYear}
              onChange={handleChange}
              placeholder="Enter published year"
            />
            {errors.publishedYear && <span className="error-message">{errors.publishedYear}</span>}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-success">
              Update Book
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/books')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBook;
