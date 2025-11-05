package com.project.anyplace.space.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpaceDTO {

    private Long id;

    private Long hostId;

    @NotBlank(message = "공간명은 필수 입력 항목입니다.")
    private String name;

    @NotBlank(message = "공간 유형은 필수 입력 항목입니다.")
    private String type;

    @NotBlank(message = "공간 설명은 필수 입력 항목입니다.")
    private String description;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    @Min(value = 1, message = "수용 인원은 최소 1명 이상이어야 합니다.")
    private int capacity;

    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    private int pricePerHour;

    private String mainImageUrl;

    private List<String> imageUrls;

    private List<String> facilities;
}