package com.project.anyplace.user.controller;


import com.project.anyplace.user.dto.UserDTO;
import com.project.anyplace.user.repository.UserRepository;
import com.project.anyplace.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor

public class UserController {
    private final UserRepository userRepository;
    private final UserService userService; // (추가)

    @GetMapping("/api/me")
    public ResponseEntity<UserDTO.UserResponse> getMe(@AuthenticationPrincipal OidcUser oidcUser) {

        if (oidcUser == null) {
            // SecurityConfig가 보호하므로 이 코드는 거의 실행되지 않지만,
            // 인증되지 않은 경우를 대비합니다.
            return ResponseEntity.status(401).build();
        }

        // 1. OIDC 정보에서 provider와 providerId를 가져옵니다.
        String provider = oidcUser.getIssuer().toString().contains("google") ? "google" : "unknown"; // (예시)
        String providerId = oidcUser.getSubject();

        // 2. 우리 DB에서 사용자를 조회합니다.
        // CustomOidcUserService가 이미 사용자를 생성/업데이트했으므로, 여기서는 반드시 존재합니다.
        Long userId = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new RuntimeException("OIDC 인증은 되었으나 DB에서 사용자를 찾을 수 없습니다."))
                .getId();

        // 3. UserService를 사용하여 DTO로 변환 후 반환합니다.
        UserDTO.UserResponse myInfo = userService.getMyInfo(userId);
        return ResponseEntity.ok(myInfo);
    }
}
