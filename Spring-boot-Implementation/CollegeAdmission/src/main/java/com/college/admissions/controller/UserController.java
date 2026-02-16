package com.college.admissions.controller;

import com.college.admissions.entity.User;
import com.college.admissions.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.save(user);
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public User get(@PathVariable Integer id) {
        return userService.getById(id);
    }
}
