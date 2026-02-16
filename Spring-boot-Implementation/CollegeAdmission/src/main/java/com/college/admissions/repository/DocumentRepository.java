package com.college.admissions.repository;

import com.college.admissions.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Integer> {
}
