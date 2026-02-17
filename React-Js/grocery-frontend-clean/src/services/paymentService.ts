import api from "../api/axiosConfig";

export const makePayment = async (orderId: number) => {
  return api.post(`/payment/${orderId}`);
};
