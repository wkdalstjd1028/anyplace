package com.project.anyplace.space.controller;

import com.project.anyplace.space.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // 1. 파일을 서비스로 전달하여 저장
        String fileUrl = fileStorageService.storeFile(file);

        // 2. 프론트엔드에 저장된 URL 반환
        // (응답 형식은 ApiResponse DTO를 사용하는 것이 좋습니다)
        // 여기서는 간단히 Map을 사용
        return ResponseEntity.ok(Map.of("data", Map.of("fileUrl", fileUrl)));
    }
}