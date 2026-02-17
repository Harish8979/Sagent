import api from "../api/axiosConfig";
import { User } from "../models/User";

export const createUser = async (user: User) => {
  const response = await api.post("/users", user);
  return response.data;
};
