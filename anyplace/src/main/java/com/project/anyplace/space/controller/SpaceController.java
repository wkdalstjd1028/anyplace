package com.project.anyplace.space.controller;

import com.project.anyplace.space.dto.SpaceDTO;
import com.project.anyplace.space.dto.SpaceSearchRequest;
import com.project.anyplace.space.service.SpaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @GetMapping
    public Page<SpaceDTO> searchSpaces(
            @ModelAttribute SpaceSearchRequest request,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        return spaceService.searchSpaces(request, pageable);
    }

    @PostMapping
    public SpaceDTO createSpace(@Valid @RequestBody SpaceDTO dto,
                                @AuthenticationPrincipal Long currentUserId
    ) {
        return spaceService.saveSpace(dto, currentUserId);
    }

    @GetMapping("/{id}")
    public SpaceDTO getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id,
                            @AuthenticationPrincipal Long currentUserId
    ) {
        spaceService.deleteSpace(id, currentUserId);
    }

}