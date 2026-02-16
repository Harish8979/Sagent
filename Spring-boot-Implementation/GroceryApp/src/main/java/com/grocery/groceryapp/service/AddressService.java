package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Address;
import com.grocery.groceryapp.entity.User;
import com.grocery.groceryapp.exception.UserNotFoundException;
import com.grocery.groceryapp.repository.AddressRepository;
import com.grocery.groceryapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository,
                          UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // ADD ADDRESS
    public Address addAddress(int userId, Address address) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        address.setUser(user);

        return addressRepository.save(address);
    }

    // GET USER ADDRESSES
    public List<Address> getUserAddresses(int userId) {
        return addressRepository.findByUserUserId(userId);
    }
}
