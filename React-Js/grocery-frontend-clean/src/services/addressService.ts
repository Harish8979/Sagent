import api from '../api/axiosConfig';

const API_URL = '/addresses';

export interface Address {
  addressId: number;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
}

export const addressService = {
  // Get all addresses for a user
  getUserAddresses: async (userId: number): Promise<Address[]> => {
    const response = await api.get(`${API_URL}/user/${userId}`);
    return response.data;
  },

  // Add new address for a user
  addAddress: async (userId: number, address: Omit<Address, 'addressId'>): Promise<Address> => {
    const response = await api.post(`${API_URL}/${userId}`, address);
    return response.data;
  },

  // Format address as string
  formatAddress: (address: Address): string => {
    return `${address.houseNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;
  }
};
