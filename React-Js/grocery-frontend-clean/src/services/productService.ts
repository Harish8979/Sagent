import api from "../api/axiosConfig";

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};
