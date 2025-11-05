package com.project.anyplace.space.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpaceSearchRequest {

    private String keyword;

    private String type;

    private String region;

    private Integer capacity;

    private Integer minPrice;

    private Integer maxPrice;
}
