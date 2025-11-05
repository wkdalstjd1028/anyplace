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
// ★ (수정) OidcUser -> OAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.oidc.user.OidcUser; // (타입 체크용)
import org.springframework.web.bind.annotation.*;
import java.util.Map; // (추가)

import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;
    private final UserRepository userRepository;

    private Long getUserIdFromPrincipal(OAuth2User oauth2User) {
        if (oauth2User == null) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }

        Map<String, Object> attributes = oauth2User.getAttributes();
        String provider;
        String providerId;

        if (oauth2User instanceof OidcUser) {
            // Google (OIDC)
            OidcUser oidcUser = (OidcUser) oauth2User;
            provider = getProviderFromIssuer(oidcUser.getIssuer().toString());
            providerId = oidcUser.getSubject();
        } else {
            // Kakao, Naver (OAuth2)
            if (attributes.containsKey("kakao_account")) {
                provider = "kakao";
                providerId = String.valueOf(attributes.get("id"));
            } else if (attributes.containsKey("response")) {
                provider = "naver";
                providerId = (String) ((Map<String, Object>) attributes.get("response")).get("id");
            } else {
                throw new RuntimeException("알 수 없는 OAuth2 provider입니다.");
            }
        }

        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new RuntimeException("DB에서 사용자를 찾을 수 없습니다. provider=" + provider + ", providerId=" + providerId))
                .getId();
    }

    // (Issuer 헬퍼)
    private String getProviderFromIssuer(String issuer) {
        if (issuer.contains("google")) {
            return "google";
        }
        return "google"; // (OIDC는 현재 google만 가정)
    }

    @GetMapping
    public Page<SpaceDTO> searchSpaces(
            @ModelAttribute SpaceSearchRequest request,
            @PageableDefault(size = 20, sort = "createdAt,desc") Pageable pageable) {
        return spaceService.searchSpaces(request, pageable);
    }

    // ★ (추가) "내 공간" API
    @GetMapping("/my")
    public Page<SpaceDTO> getMySpaces(
            @AuthenticationPrincipal OAuth2User oauth2User,
            // ★ (수정) React가 sort를 보내지 않으므로, 여기서 기본 정렬을 적용합니다.
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC)
            Pageable pageable) {

        Long currentUserId = getUserIdFromPrincipal(oauth2User);
        return spaceService.findSpacesByHostId(currentUserId, pageable);
    }

    @PostMapping
    public SpaceDTO createSpace(@Valid @RequestBody SpaceDTO dto,
                                @AuthenticationPrincipal OAuth2User oauth2User // ★ (수정) OidcUser -> OAuth2User
    ) {
        // ★ (수정) 헬퍼 메서드 호출
        Long currentUserId = getUserIdFromPrincipal(oauth2User);

        return spaceService.saveSpace(dto, currentUserId);
    }

    @GetMapping("/{id}")
    public SpaceDTO getSpaceById(@PathVariable Long id) {
        return spaceService.getSpaceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSpace(@PathVariable Long id,
                            @AuthenticationPrincipal OAuth2User oauth2User // ★ (수정) OidcUser -> OAuth2User
    ) {
        // ★ (수정) 헬퍼 메서드 호출
        Long currentUserId = getUserIdFromPrincipal(oauth2User);

        spaceService.deleteSpace(id, currentUserId);
    }
}