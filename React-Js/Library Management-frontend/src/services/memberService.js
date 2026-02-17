import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/members';

class MemberService {
  getAllMembers() {
    return axios.get(API_BASE_URL);
  }

  getMemberById(id) {
    return axios.get(`${API_BASE_URL}/${id}`);
  }

  getMemberByMemberId(memberId) {
    return axios.get(`${API_BASE_URL}/member-id/${memberId}`);
  }
}

export default new MemberService();
