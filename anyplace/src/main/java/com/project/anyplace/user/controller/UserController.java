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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

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

    private String getProviderFromIssuer(String issuer) {
        if (issuer.contains("google")) {
            return "google";
        }
        return "google";
    }

    @GetMapping("/api/me")
    public ResponseEntity<UserDTO.UserResponse> getMe(@AuthenticationPrincipal OAuth2User oauth2User) { // (수정)
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = getUserIdFromPrincipal(oauth2User); // (수정)
        UserDTO.UserResponse myInfo = userService.getMyInfo(userId);
        return ResponseEntity.ok(myInfo);
    }

    @PostMapping("/api/user/upgrade-to-host")
    public ResponseEntity<Void> upgradeToHost(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @Valid @RequestBody UserDTO.HostUpgradeRequest request
    ) {
        Long userId = getUserIdFromPrincipal(oauth2User);
        userService.upgradeToHost(userId, request);
        return ResponseEntity.ok().build();
    }
}