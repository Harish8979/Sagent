import api from "../api/axiosConfig";

export const login = async (name: string, email: string) => {
  try {
    // Validate user credentials against database
    const response = await api.get(`/users`);
    const users = response.data;
    
    // Find user with matching name and email
    const user = users.find(
      (u: any) => u.name.toLowerCase() === name.toLowerCase() && 
                  u.email.toLowerCase() === email.toLowerCase() &&
                  u.status === 'ACTIVE'
    );
    
    if (user) {
      localStorage.setItem("userId", user.userId.toString());
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userPhone", user.phoneNumber || "");
      localStorage.setItem("userAddress", user.address || "");
      return { success: true, user };
    } else {
      return { success: false, message: "Invalid credentials or inactive account" };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed. Please try again." };
  }
};

export const logout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userAddress");
};

export const getCurrentUser = () => {
  return {
    userId: localStorage.getItem("userId"),
    userName: localStorage.getItem("userName"),
    userEmail: localStorage.getItem("userEmail"),
    userPhone: localStorage.getItem("userPhone"),
    userAddress: localStorage.getItem("userAddress")
  };
};

export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
