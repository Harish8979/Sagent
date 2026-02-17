import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/borrow';

class BorrowService {
  borrowBook(borrowData) {
    return axios.post(API_BASE_URL, borrowData);
  }

  returnBook(recordId) {
    return axios.put(`${API_BASE_URL}/return/${recordId}`);
  }

  cancelBorrow(recordId) {
    return axios.delete(`${API_BASE_URL}/cancel/${recordId}`);
  }

  getAllBorrowRecords() {
    return axios.get(API_BASE_URL);
  }

  getBorrowRecordsByMember(memberId) {
    return axios.get(`${API_BASE_URL}/member/${memberId}`);
  }

  getActiveBorrows() {
    return axios.get(`${API_BASE_URL}/active`);
  }
}

export default new BorrowService();
