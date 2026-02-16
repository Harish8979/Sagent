package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Integer> {

    List<Address> findByUserUserId(int userId);
}
