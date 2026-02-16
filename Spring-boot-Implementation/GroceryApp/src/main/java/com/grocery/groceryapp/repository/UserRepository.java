
package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
