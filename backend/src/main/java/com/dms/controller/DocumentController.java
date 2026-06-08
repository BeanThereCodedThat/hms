package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.DocumentDto;
import com.dms.entity.Document;
import com.dms.enums.DocumentType;
import com.dms.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DocumentDto>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) DocumentType documentType,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long visitId,
            @RequestParam(required = false) Long vaccinationId) throws IOException {
        DocumentDto dto = documentService.upload(file, documentType, employeeId, visitId, vaccinationId);
        return ResponseEntity.ok(ApiResponse.success("File uploaded", dto));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Resource resource = documentService.download(id);
        Document doc = documentService.getDocumentEntity(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> preview(@PathVariable Long id) {
        Resource resource = documentService.download(id);
        Document doc = documentService.getDocumentEntity(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getByEmployee(employeeId)));
    }

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getByVisit(@PathVariable Long visitId) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getByVisit(visitId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) throws IOException {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
