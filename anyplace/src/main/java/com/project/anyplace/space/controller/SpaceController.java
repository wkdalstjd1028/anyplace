package com.project.anyplace.space.controller;

import com.project.anyplace.space.dto.SpaceDTO;
import com.project.anyplace.space.dto.SpaceSearchRequest;
import com.project.anyplace.space.service.SpaceService;
import com.project.anyplace.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final UserRepository userRepository; // (추가) DB에서 User ID를 찾기 위해

    /**
     * OidcUser로부터 DB의 User ID (Long)를 찾는 헬퍼 메서드
     */
    private Long getUserIdFromOidcUser(OidcUser oidcUser) {
        if (oidcUser == null) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }
        String provider = oidcUser.getIssuer().toString().contains("google") ? "google" : "unknown"; // (예시)
        String providerId = oidcUser.getSubject();

        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new RuntimeException("DB에서 사용자를 찾을 수 없습니다."))
                .getId();
    }

    @GetMapping
    public Page<SpaceDTO> searchSpaces(
            @ModelAttribute SpaceSearchRequest request,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        return spaceService.searchSpaces(request, pageable);
    }

    @PostMapping
    public SpaceDTO createSpace(@Valid @RequestBody SpaceDTO dto,
                                @AuthenticationPrincipal OidcUser oidcUser // (수정) Long -> OidcUser
    ) {
        // (추가) OidcUser로부터 실제 DB User ID (Long) 조회
        Long currentUserId = getUserIdFromOidcUser(oidcUser);

        return spaceService.saveSpace(dto, currentUserId);
    }

    @GetMapping("/{id}")
    public SpaceDTO getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id,
                            @AuthenticationPrincipal OidcUser oidcUser // (수정) Long -> OidcUser
    ) {
        // (추가) OidcUser로부터 실제 DB User ID (Long) 조회
        Long currentUserId = getUserIdFromOidcUser(oidcUser);

        spaceService.deleteSpace(id, currentUserId);
    }

}