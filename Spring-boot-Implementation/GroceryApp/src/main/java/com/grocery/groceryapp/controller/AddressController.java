package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Address;
import com.grocery.groceryapp.service.AddressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // ADD ADDRESS
    @PostMapping("/{userId}")
    public Address addAddress(@PathVariable int userId,
                              @RequestBody Address address) {

        return addressService.addAddress(userId, address);
    }

    // GET USER ADDRESSES
    @GetMapping("/user/{userId}")
    public List<Address> getUserAddresses(@PathVariable int userId) {

        return addressService.getUserAddresses(userId);
    }
}
