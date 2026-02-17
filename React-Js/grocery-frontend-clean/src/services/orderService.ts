import api from "../api/axiosConfig";

export const placeOrder = async (userId: any, address?: string) => {
  return api.post(`/orders/${userId}`, { address });
};
