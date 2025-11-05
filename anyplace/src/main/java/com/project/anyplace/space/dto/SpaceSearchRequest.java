package com.project.anyplace.space.dto;

import lombok.*;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

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