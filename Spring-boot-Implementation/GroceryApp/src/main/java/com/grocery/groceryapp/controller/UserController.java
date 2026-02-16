package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.User;
import com.grocery.groceryapp.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // CREATE USER
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // UPDATE USER
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Integer id,
                           @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }
}
