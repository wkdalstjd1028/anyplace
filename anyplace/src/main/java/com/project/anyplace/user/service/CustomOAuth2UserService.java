package com.project.anyplace.user.service;

import com.project.anyplace.user.constant.Role;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerId;
        String email;
        String name;

        if (provider.equals("kakao")) {
            providerId = String.valueOf(attributes.get("id"));
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            email = (String) kakaoAccount.get("email");
            name = (String) profile.get("nickname");

            if (email == null) {
                email = providerId + "@kakao.com";
            }

        } else if (provider.equals("naver")) {
            Map<String, Object> responseMap = (Map<String, Object>) attributes.get("response");
            providerId = (String) responseMap.get("id");
            email = (String) responseMap.get("email");
            name = (String) responseMap.get("name");
        } else {
            throw new OAuth2AuthenticationException("지원하지 않는 OAuth2 provider입니다.");
        }

        User user = saveOrUpdate(provider, providerId, email, name);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
                attributes,
                userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName()
        );
    }

    private User saveOrUpdate(String provider, String providerId, String email, String name) {
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .map(entity -> {
                    entity.setName(Optional.ofNullable(name).orElse(entity.getName()));
                    entity.setEmail(Optional.ofNullable(email).orElse(entity.getEmail()));
                    return entity;
                })
                .orElseGet(() -> {
                    return User.builder()
                            .email(Optional.ofNullable(email).orElse(providerId + "@" + provider))
                            .name(Optional.ofNullable(name).orElse("사용자"))
                            .provider(provider)
                            .providerId(providerId)
                            .role(Role.GUEST)
                            .build();
                });

        return userRepository.save(user);
    }
}
