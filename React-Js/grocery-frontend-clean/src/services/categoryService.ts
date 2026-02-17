import api from "../api/axiosConfig";

export const getCategories = async () => {
  try {
    const response = await api.get("/category");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: number) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};
