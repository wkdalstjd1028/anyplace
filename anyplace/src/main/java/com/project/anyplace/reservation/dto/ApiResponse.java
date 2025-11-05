package com.project.anyplace.reservation.dto;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    // 성공 시
    public ApiResponse(T data) {
        this.success = true;
        this.data = data;
        this.message = null;
    }

    // 실패 시 (메시지 포함)
    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    // (간단한 성공 래퍼)
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }
}