package com.college.admissions.controller;

import com.college.admissions.entity.Student;
import com.college.admissions.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public Student create(@RequestBody Student student) {
        return studentService.save(student);
    }

    @GetMapping
    public List<Student> getAll() {
        return studentService.getAll();
    }

    @GetMapping("/{id}")
    public Student get(@PathVariable Integer id) {
        return studentService.getById(id);
    }
}
