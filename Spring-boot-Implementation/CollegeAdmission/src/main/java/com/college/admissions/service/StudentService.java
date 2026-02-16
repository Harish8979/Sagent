package com.college.admissions.service;

import com.college.admissions.entity.Student;
import com.college.admissions.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student save(Student student) {
        return studentRepository.save(student);
    }

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student getById(Integer id) {
        return studentRepository.findById(id).orElse(null);
    }
}
