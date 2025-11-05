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

@Service
@RequiredArgsConstructor
public class CustomOidcUserService extends OidcUserService {
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 기본 OidcUser 객체를 로드합니다. (구글 등에서 사용자 정보 가져오기)
        OidcUser oidcUser = super.loadUser(userRequest);
        Map<String, Object> attributes = oidcUser.getAttributes();

        // 2. OIDC 제공자 ID (예: "google")와 사용자 고유 ID를 가져옵니다.
        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerId = oidcUser.getSubject(); // OIDC 표준 사용자 고유 ID

        // 3. 우리 DB에서 사용자를 찾거나 새로 생성합니다.
        User user = saveOrUpdate(provider, providerId, attributes);

        // 4. Spring Security가 사용할 인증 객체를 만듭니다.
        // (중요) 'nameAttributeKey'를 'name'으로 설정하여, oidcUser.getName()이 동작하도록 합니다.
        String nameAttributeKey = "name";

        // 5. (선택적) Spring Security가 우리 DB의 Role을 알 수 있도록 권한을 설정합니다.
        OidcUserAuthority authority = new OidcUserAuthority(
                user.getRoleKey(), // "ROLE_GUEST", "ROLE_HOST" 등
                oidcUser.getIdToken(),
                oidcUser.getUserInfo()
        );

        // 6. 우리 DB 정보가 포함된 OidcUser를 반환합니다.
        return new DefaultOidcUser(
                Collections.singleton(authority),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                nameAttributeKey
        );
    }

    private User saveOrUpdate(String provider, String providerId, Map<String, Object> attributes) {
        // 4. provider와 providerId로 DB에서 사용자를 찾습니다.
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(entity -> {
                    // 5-1. (사용자가 이미 존재할 경우) 이름이나 이메일이 변경되었을 수 있으니 업데이트합니다.
                    entity.setName((String) attributes.get("name"));
                    entity.setEmail((String) attributes.get("email"));
                    return entity;
                })
                .orElseGet(() -> {
                    // 5-2. (신규 사용자일 경우) DB에 새로 저장합니다.
                    return User.builder()
                            .email((String) attributes.get("email"))
                            .name((String) attributes.get("name"))
                            .provider(provider)
                            .providerId(providerId)
                            .role(Role.GUEST) // 기본 권한은 GUEST
                            .build();
                });

        return userRepository.save(user);
    }
}
