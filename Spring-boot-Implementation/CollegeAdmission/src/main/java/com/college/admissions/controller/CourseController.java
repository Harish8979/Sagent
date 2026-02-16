package com.college.admissions.controller;

import com.college.admissions.entity.Course;
import com.college.admissions.service.CourseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public Course create(@RequestBody Course course) {
        return courseService.save(course);
    }

    @GetMapping
    public List<Course> getAll() {
        return courseService.getAll();
    }

    @GetMapping("/{id}")
    public Course get(@PathVariable Integer id) {
        return courseService.getById(id);
    }
}
