package com.project.anyplace.space.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final String uploadDir;

    // 1. application.yml의 'file.upload-dir' 값을 주입받음
    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        // 2. 업로드 디렉토리 생성
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("파일을 업로드할 디렉토리를 생성할 수 없습니다.", ex);
        }
    }

    // 3. 파일 저장
    public String storeFile(MultipartFile file) {
        // 4. 파일 이름 고유하게 만들기 (덮어쓰기 방지)
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String storedFileName = UUID.randomUUID().toString() + extension;

        try {
            // 5. 파일 저장
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 6. 웹에서 접근 가능한 URL 경로 반환 (WebConfig 설정 필요)
            // 예: "http://localhost:8080/uploads/uuid-파일이름.png"
            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/") // (WebConfig에서 설정할 경로)
                    .path(storedFileName)
                    .toUriString();

        } catch (IOException ex) {
            throw new RuntimeException("파일 " + storedFileName + "을(를) 저장할 수 없습니다.", ex);
        }
    }
}