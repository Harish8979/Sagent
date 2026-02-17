import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/books';

class BookService {
  getAllBooks() {
    return axios.get(API_BASE_URL);
  }

  getBookById(id) {
    return axios.get(`${API_BASE_URL}/${id}`);
  }

  createBook(book) {
    return axios.post(API_BASE_URL, book);
  }

  updateBook(id, book) {
    return axios.put(`${API_BASE_URL}/${id}`, book);
  }

  deleteBook(id) {
    return axios.delete(`${API_BASE_URL}/${id}`);
  }
}

export default new BookService();
