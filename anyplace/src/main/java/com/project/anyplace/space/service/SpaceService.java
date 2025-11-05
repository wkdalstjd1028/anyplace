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

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;

    @Transactional
    public SpaceDTO saveSpace(SpaceDTO dto, Long currentUserId) {
        Space space = dtoToEntity(dto);
        space.setHostId(currentUserId);
        Space savedSpace = spaceRepository.save(space);
        return entityToDto(savedSpace);
    }

    @Transactional(readOnly = true)
    public Page<SpaceDTO> searchSpaces(SpaceSearchRequest request, Pageable pageable) {
        Specification<Space> spec = SpaceSpecification.build(request);
        Page<Space> spacePage = spaceRepository.findAll(spec, pageable);
        return spacePage.map(this::entityToDto);
    }

    @Transactional(readOnly = true)
    public List<SpaceDTO> getAllSpaces() {
        return spaceRepository.findAll().stream()
                .map(this::entityToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SpaceDTO getSpaceById(Long id) {
        Space space = spaceRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 공간이 존재하지 않습니다. ID=" + id));
        return entityToDto(space);
    }

    @Transactional
    public void deleteSpace(Long spaceId, Long currentUserId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new NoSuchElementException("삭제할 공간이 존재하지 않습니다. ID=" + spaceId));

        if (!space.getHostId().equals(currentUserId)) {
            throw new SecurityException("삭제 권한이 없습니다. ID=" + spaceId);
        }

        spaceRepository.deleteById(spaceId);
    }

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

    private Space dtoToEntity(SpaceDTO dto) {
        return Space.builder()
                .id(dto.getId()) // (추가) 업데이트 시 id가 필요합니다.
                .hostId(dto.getHostId()) // (추가)
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