package com.project.anyplace.space.dto;

import lombok.*;
import java.time.LocalDate; // (추가) 날짜 타입을 사용합니다.
import org.springframework.format.annotation.DateTimeFormat; // (추가) ISO 날짜 포맷 파싱

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpaceSearchRequest {

    private String keyword;

    private String type;

    private String city;
    private String district;

    private Integer minCapacity;

    private Integer minPrice;
    private Integer maxPrice;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkInDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOutDate;
}