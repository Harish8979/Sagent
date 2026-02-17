import api from "../api/axiosConfig";

export const addToCart = async (productId: number) => {
  const userId = localStorage.getItem("userId") || 1;

  return api.post(`/cart-item/${userId}/${productId}/1`);
};

export const getCartItems = async () => {
  const userId = localStorage.getItem("userId") || 1;

  const response = await api.get(`/cart/user/${userId}`);
  return response.data;
};

export const removeFromCart = async (cartItemId: number) => {
  return api.delete(`/cart-item/${cartItemId}`);
};

export const updateCartItemQuantity = async (cartItemId: number, quantity: number) => {
  return api.put(`/cart-item/${cartItemId}/${quantity}`);
};
