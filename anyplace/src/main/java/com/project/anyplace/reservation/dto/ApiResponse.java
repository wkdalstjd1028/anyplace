package com.project.anyplace.reservation.dto;

import lombok.Getter;

@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    public ApiResponse(T data) {
        this.success = true;
        this.data = data;
        this.message = null;
    }

    public ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }
}