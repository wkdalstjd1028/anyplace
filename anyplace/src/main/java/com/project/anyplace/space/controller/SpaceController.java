package com.project.anyplace.space.controller;

import com.project.anyplace.space.dto.SpaceDTO;
import com.project.anyplace.space.dto.SpaceSearchRequest;
// (수정) Space Entity 대신 DTO 사용
import com.project.anyplace.space.service.SpaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// (수정) Spring Security 관련 import
// TODO: 'UserPrincipal'은 Spring Security의 UserDetails를 구현한
//       사용자 정의 클래스라고 가정합니다. (e.g., public class UserPrincipal implements UserDetails { ...; public Long getId() { ... } })
// import com.project.anyplace.auth.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("/api/space")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    /**
     * 공간 검색 (페이징) (수정)
     * @return Page<SpaceDTO>
     */
    @GetMapping("/search")
    public Page<SpaceDTO> searchSpaces( // (수정) 반환 타입 Page<Space> -> Page<SpaceDTO>
                                        @ModelAttribute SpaceSearchRequest request,
                                        @PageableDefault(size = 10, sort = "createdAt,desc") Pageable pageable) {

        return spaceService.searchSpaces(request, pageable);
    }

    /**
     * 공간 등록 (수정)
     * @return SpaceDTO
     */
    @PostMapping
    public SpaceDTO createSpace(@Valid @RequestBody SpaceDTO dto,
                                @AuthenticationPrincipal Long currentUserId // (수정)
                                // @AuthenticationPrincipal UserPrincipal userPrincipal // (대안)
    ) {
        // (수정) Spring Security에서 인증된 유저의 ID를 가져옴
        // Long currentUserId = userPrincipal.getId();

        // (임시) @AuthenticationPrincipal이 Long ID를 바로 반환하도록 설정했다고 가정
        //      만약 UserPrincipal 객체를 받는다면 위 주석(대안)처럼 ID를 추출합니다.

        return spaceService.saveSpace(dto, currentUserId);
    }

    /**
     * 전체 공간 조회 (수정)
     * @return List<SpaceDTO>
     */
    @GetMapping
    public List<SpaceDTO> getAllSpaces() { // (수정) 반환 타입 List<Space> -> List<SpaceDTO>
        return spaceService.getAllSpaces();
    }

    /**
     * 특정 공간 조회 (수정)
     * @return SpaceDTO
     */
    @GetMapping("/{id}")
    public SpaceDTO getSpaceById(@PathVariable Long id) { // (수정) 반환 타입 Space -> SpaceDTO
        return spaceService.getSpaceById(id);
    }

    /**
     * 공간 삭제 (수정)
     */
    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id,
                            @AuthenticationPrincipal Long currentUserId // (수정)
                            // @AuthenticationPrincipal UserPrincipal userPrincipal // (대안)
    ) {
        // (수정) Long currentUserId = userPrincipal.getId();
        spaceService.deleteSpace(id, currentUserId);
    }
}