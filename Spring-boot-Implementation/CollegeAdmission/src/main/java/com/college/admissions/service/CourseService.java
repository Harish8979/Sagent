package com.college.admissions.service;

import com.college.admissions.entity.Course;
import com.college.admissions.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course save(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Course getById(Integer id) {
        return courseRepository.findById(id).orElse(null);
    }
}
