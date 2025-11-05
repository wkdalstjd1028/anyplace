package com.project.anyplace.user.service;

import com.project.anyplace.user.constant.Role;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;
import java.util.Optional; // Optional 임포트

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        Map<String, Object> attributes = oidcUser.getAttributes();

        String provider = userRequest.getClientRegistration().getRegistrationId();

        // ★ (수정) providerId를 oidcUser.getSubject() (표준) 대신
        // oidcUser.getName() (yml의 user-name-attribute 기반)으로 가져옵니다.
        // Naver/Kakao는 subject가 없기 때문입니다.
        String providerId = oidcUser.getName();

        User user = saveOrUpdate(provider, providerId, attributes, oidcUser); // oidcUser 전달

        OidcUserAuthority authority = new OidcUserAuthority(
                user.getRoleKey(),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo()
        );

        // ★ (수정) nameAttributeKey를 yml의 user-name-attribute와 동일하게 설정
        String nameAttributeKey = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        return new DefaultOidcUser(
                Collections.singleton(authority),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                nameAttributeKey // ★ 수정됨
        );
    }

    private User saveOrUpdate(String provider, String providerId, Map<String, Object> attributes, OidcUser oidcUser) {

        // ★ (수정) Kakao/Naver의 중첩된 속성을 안전하게 가져옵니다.
        // Spring이 yml 설정 덕분에 oidcUser.getEmail(), oidcUser.getFullName()을 채워줍니다.
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName(); // Kakao는 "nickname", Naver는 "name"

        // (참고) 만약 oidcUser.getFullName()이 null이라면 수동 파싱이 필요합니다.
        // 예: name = (String) ((Map<String, Object>) attributes.get("kakao_account")).get("email");

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(entity -> {
                    // (수정) null-safe하게 업데이트
                    entity.setName(Optional.ofNullable(name).orElse(entity.getName()));
                    entity.setEmail(Optional.ofNullable(email).orElse(entity.getEmail()));
                    return entity;
                })
                .orElseGet(() -> {
                    // (수정) 신규 가입 시 null일 경우 "이름없음" 등으로 처리 (DB의 not-null 제약조건)
                    return User.builder()
                            .email(Optional.ofNullable(email).orElse(providerId + "@" + provider)) // 임시 이메일
                            .name(Optional.ofNullable(name).orElse("사용자")) // 임시 이름
                            .provider(provider)
                            .providerId(providerId)
                            .role(Role.GUEST)
                            .build();
                });

        return userRepository.save(user);
    }
}