package com.college.admissions.service;

import com.college.admissions.entity.User;
import com.college.admissions.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }
}
