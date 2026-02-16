package com.college.admissions.controller;

import com.college.admissions.entity.Document;
import com.college.admissions.service.DocumentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public Document create(@RequestBody Document document) {
        return documentService.save(document);
    }

    @GetMapping
    public List<Document> getAll() {
        return documentService.getAll();
    }

    @GetMapping("/{id}")
    public Document get(@PathVariable Integer id) {
        return documentService.getById(id);
    }
}
