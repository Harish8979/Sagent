package com.budgettracker.budgettracker.service;

import com.budgettracker.budgettracker.entity.User;
import com.budgettracker.budgettracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User save(User user) {
        return repository.save(user);
    }

    public List<User> getAll() {
        return repository.findAll();
    }
}
