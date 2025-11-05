package com.project.anyplace.user.controller;

// ... (다른 imports)
import com.project.anyplace.user.dto.UserDTO;
import com.project.anyplace.user.repository.UserRepository;
import com.project.anyplace.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    private Long getUserIdFromOidcUser(OidcUser oidcUser) {
        if (oidcUser == null) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }

        // ★★★ (수정) "google" 하드코딩 버그 수정
        String provider = getProviderFromIssuer(oidcUser.getIssuer().toString());
        // ★★★ (수정) providerId를 subject 대신 name으로 가져옵니다. (CustomOidcUserService와 통일)
        String providerId = oidcUser.getName();

        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new RuntimeException("DB에서 사용자를 찾을 수 없습니다. provider=" + provider + ", providerId=" + providerId))
                .getId();
    }

    // ★★★ (추가) Issuer 문자열로 provider 식별자(yml의 key)를 반환하는 헬퍼
    private String getProviderFromIssuer(String issuer) {
        if (issuer.contains("google")) {
            return "google";
        } else if (issuer.contains("kakao")) {
            return "kakao";
        } else if (issuer.contains("naver")) {
            return "naver";
        } else {
            // issuer 주소를 기반으로 registrationId를 찾는 로직이 더 안전하지만,
            // 우선 간단하게 처리합니다.
            return "unknown";
        }
    }


    @GetMapping("/api/me")
    public ResponseEntity<UserDTO.UserResponse> getMe(@AuthenticationPrincipal OidcUser oidcUser) {
        if (oidcUser == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = getUserIdFromOidcUser(oidcUser);
        UserDTO.UserResponse myInfo = userService.getMyInfo(userId);
        return ResponseEntity.ok(myInfo);
    }

    @PostMapping("/api/user/upgrade-to-host")
    public ResponseEntity<Void> upgradeToHost(
            @AuthenticationPrincipal OidcUser oidcUser,
            @Valid @RequestBody UserDTO.HostUpgradeRequest request
    ) {
        Long userId = getUserIdFromOidcUser(oidcUser);
        userService.upgradeToHost(userId, request);
        return ResponseEntity.ok().build();
    }
}