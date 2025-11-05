package com.project.anyplace.user.dto;

import com.project.anyplace.user.entity.User;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;


public class UserDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @ToString
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @ToString
    public static class HostUpgradeRequest {

        @NotEmpty(message = "사업자등록번호는 필수 항목입니다.")
        private String businessLicenseNumber;

        @NotEmpty(message = "호스트 소개는 필수 항목입니다.")
        @Size(min = 10, message = "호스트 소개는 10자 이상 작성해야 합니다.")
        private String description;
    }
}
