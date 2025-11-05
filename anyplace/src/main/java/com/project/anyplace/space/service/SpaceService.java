package com.project.anyplace.space.service;

import com.project.anyplace.space.dto.SpaceDTO;
import com.project.anyplace.space.dto.SpaceSearchRequest;
import com.project.anyplace.space.entity.Space;
import com.project.anyplace.space.repository.SpaceRepository;
import com.project.anyplace.space.specification.SpaceSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// (수정) 예외 처리를 위해 추가
import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;

    /**
     * 공간 저장 (수정)
     * @param dto React에서 받은 공간 정보
     * @param currentUserId 현재 로그인한 유저 ID
     * @return 저장된 공간 정보 DTO
     */
    @Transactional
    public SpaceDTO saveSpace(SpaceDTO dto, Long currentUserId) {
        // (수정) DTO -> Entity 변환 시 hostId 주입
        Space space = dtoToEntity(dto);
        space.setHostId(currentUserId);

        Space savedSpace = spaceRepository.save(space);

        // (수정) Entity -> DTO 변환하여 반환
        return entityToDto(savedSpace);
    }

    /**
     * 공간 검색 (수정)
     * @return Page<SpaceDTO>
     */
    @Transactional(readOnly = true)
    public Page<SpaceDTO> searchSpaces(SpaceSearchRequest request, Pageable pageable) {
        Specification<Space> spec = SpaceSpecification.build(request);
        Page<Space> spacePage = spaceRepository.findAll(spec, pageable);

        // (수정) Page<Entity> -> Page<DTO> 변환
        return spacePage.map(this::entityToDto);
    }

    /**
     * 전체 공간 조회 (수정)
     * @return List<SpaceDTO>
     */
    @Transactional(readOnly = true)
    public List<SpaceDTO> getAllSpaces() {
        // (수정) Entity List -> DTO List 변환
        return spaceRepository.findAll().stream()
                .map(this::entityToDto)
                .toList();
    }

    /**
     * ID로 공간 조회 (수정)
     * @return SpaceDTO
     */
    @Transactional(readOnly = true)
    public SpaceDTO getSpaceById(Long id) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 공간이 존재하지 않습니다. ID=" + id));

        // (수정) Entity -> DTO 변환
        return entityToDto(space);
    }

    /**
     * 공간 삭제 (수정)
     * @param spaceId 삭제할 공간 ID
     * @param currentUserId 현재 로그인한 유저 ID
     */
    @Transactional
    public void deleteSpace(Long spaceId, Long currentUserId) {
        // (수정) 삭제 전 소유권 확인
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new NoSuchElementException("삭제할 공간이 존재하지 않습니다. ID=" + spaceId));

        if (!space.getHostId().equals(currentUserId)) {
            // (수정) 소유자가 아닌 경우 접근 거부 예외 발생
            // TODO: AccessDeniedException에 대한 GlobalExceptionHandler 처리가 필요합니다.
            throw new SecurityException("삭제 권한이 없습니다. ID=" + spaceId);
        }

        spaceRepository.deleteById(spaceId);
    }

    // --- DTO/Entity 변환 헬퍼 메서드 (추가) ---

    /**
     * Entity -> DTO 변환
     */
    private SpaceDTO entityToDto(Space space) {
        return SpaceDTO.builder()
                .id(space.getId())
                .hostId(space.getHostId()) // (추가)
                .name(space.getName())
                .type(space.getType())
                .description(space.getDescription())
                .address(space.getAddress())
                .capacity(space.getCapacity())
                .pricePerHour(space.getPricePerHour())
                .mainImageUrl(space.getMainImageUrl())
                .imageUrls(space.getImageUrls())
                .facilities(space.getFacilities())
                .build();
    }

    /**
     * DTO -> Entity 변환 (Create/Update 시 사용)
     * (hostId는 서비스 로직에서 별도 세팅)
     */
    private Space dtoToEntity(SpaceDTO dto) {
        return Space.builder()
                // id는 자동 생성되므로 DTO의 id를 사용하지 않음
                .name(dto.getName())
                .type(dto.getType())
                .description(dto.getDescription())
                .address(dto.getAddress())
                .capacity(dto.getCapacity())
                .pricePerHour(dto.getPricePerHour())
                .mainImageUrl(dto.getMainImageUrl())
                .imageUrls(dto.getImageUrls())
                .facilities(dto.getFacilities())
                .build();
    }
}